// test.js — fetch base intervals, aggregate, and save ONLY target intervals 3m,15m,30m (timestamps in IST)
import dotenv from "dotenv";
dotenv.config();
import moment from "moment-timezone";

import mongoose from "mongoose";
import axios from "axios";
import IndexCandles from "./src/models/indexCandles.model.js"; // adjust path if needed

const DB_URI = process.env.DB_URI || "mongodb://localhost:27017/tradingtantra";
const DHAN_TOKEN = process.env.DHAN_ACCESS_TOKEN || "";
const DHAN_API_BASE = process.env.DHAN_API_BASE || "https://api.dhan.co/v2";

// Defaults: fetch 1m and 15m, produce targets 3,15,30
const BASE_INTERVALS = (process.env.BASE_INTERVALS || "1,15").split(",").map((s) => Number(s.trim())).filter(Boolean);
const TARGET_INTERVALS = (process.env.TARGET_INTERVALS || "3,15,30").split(",").map((s) => Number(s.trim())).filter(Boolean);

const FROM_DATE_STR = process.env.FROM_DATE; // optional but recommended
const TO_DATE = process.env.TO_DATE;
const OI = process.env.CANDLE_OI === "true";

const indices = [
  { name: "NIFTY", securityId: "13", exchangeSegment: "IDX_I" },
  { name: "BANKNIFTY", securityId: "25", exchangeSegment: "IDX_I" },
  { name: "FINNIFTY", securityId: "27", exchangeSegment: "IDX_I" },
  { name: "MIDCPNIFTY", securityId: "442", exchangeSegment: "IDX_I" },
  { name: "SENSEX", securityId: "51", exchangeSegment: "IDX_I" },
];

// ----------------- Helpers -----------------
async function connectDB() {
  try {
    await mongoose.connect(DB_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connect error:", err);
    process.exit(1);
  }
}

function formatDateToISTString(value) {
  let m;
  if (value instanceof Date) m = moment(value);
  else if (typeof value === "number") m = value < 1e11 ? moment.unix(value) : moment(value);
  else if (typeof value === "string" && /^\d+$/.test(value)) {
    const n = Number(value);
    m = n < 1e11 ? moment.unix(n) : moment(n);
  } else m = moment(value);
  return m.tz("Asia/Kolkata").format("DD/MM/YYYY, hh:mm:ss A");
}

function genTimestampsFromStart(startDate, count, intervalMinutes) {
  const arr = [];
  for (let i = 0; i < count; i++) arr.push(new Date(startDate.getTime() + i * intervalMinutes * 60000));
  return arr;
}

function buildCandlesFromArrays(respObj, fallbackStartDate, intervalMinutes) {
  const openArr = respObj.open ?? respObj.opens ?? respObj.o;
  const highArr = respObj.high ?? respObj.highs ?? respObj.h;
  const lowArr = respObj.low ?? respObj.lows ?? respObj.l;
  const closeArr = respObj.close ?? respObj.closes ?? respObj.c;

  if (!Array.isArray(openArr) || !Array.isArray(highArr) || !Array.isArray(lowArr) || !Array.isArray(closeArr)) {
    return null;
  }

  const len = Math.max(openArr.length, highArr.length, lowArr.length, closeArr.length);

  // try timestamp arrays
  const timeKeys = ["timestamp", "timestamps", "time", "times", "epoch", "ts"];
  let tsArr = null;
  for (const k of timeKeys) {
    if (Array.isArray(respObj[k]) && respObj[k].length >= len) {
      tsArr = respObj[k].slice(0, len);
      break;
    }
  }

  // normalize timestamps -> Date objects
  if (tsArr && tsArr.length > 0 && typeof tsArr[0] === "number") {
    tsArr = tsArr.map((t) => (t < 1e11 ? new Date(t * 1000) : new Date(t)));
  } else if (tsArr && tsArr.length > 0 && typeof tsArr[0] === "string" && /^\d+$/.test(tsArr[0])) {
    tsArr = tsArr.map((t) => {
      const n = Number(t);
      return n < 1e11 ? new Date(n * 1000) : new Date(n);
    });
  } else if (tsArr && tsArr.length > 0) {
    tsArr = tsArr.map((t) => new Date(String(t)));
  }

  if (!tsArr) {
    if (!fallbackStartDate) return null;
    tsArr = genTimestampsFromStart(fallbackStartDate, len, intervalMinutes);
  }

  const candles = [];
  for (let i = 0; i < len; i++) {
    const tsDate = tsArr[i] instanceof Date ? tsArr[i] : new Date(tsArr[i]);
    const istTsStr = formatDateToISTString(tsDate);
    candles.push({
      timestampISO: tsDate.toISOString(), // for sorting & aggregation
      timestamp: istTsStr, // the string saved to DB
      open: Number(openArr[i] ?? 0),
      high: Number(highArr[i] ?? 0),
      low: Number(lowArr[i] ?? 0),
      close: Number(closeArr[i] ?? 0),
    });
  }
  return candles;
}

function aggregateCandles(baseCandles, chunkSize) {
  if (!Array.isArray(baseCandles) || baseCandles.length === 0) return [];
  const agg = [];
  for (let i = 0; i < baseCandles.length; i += chunkSize) {
    const chunk = baseCandles.slice(i, i + chunkSize);
    if (chunk.length === 0) continue;
    const open = chunk[0].open;
    const close = chunk[chunk.length - 1].close;
    let high = -Infinity;
    let low = Infinity;
    for (const c of chunk) {
      if (c.high > high) high = c.high;
      if (c.low < low) low = c.low;
    }
    const tsDate = new Date(chunk[0].timestampISO);
    const tsIST = formatDateToISTString(tsDate);
    agg.push({ timestampISO: tsDate.toISOString(), timestamp: tsIST, open, high, low, close });
  }
  return agg;
}

async function saveCandlesToDB(indexName, securityId, intervalLabel, candles) {
  if (!candles || candles.length === 0) {
    console.log(`No candles to save for ${indexName} (${securityId}) [${intervalLabel}]`);
    return;
  }
  const bulkOps = candles.map((c) => ({
    updateOne: {
      filter: { securityId: String(securityId), interval: intervalLabel, timestamp: c.timestamp },
      update: {
        $set: {
          indexName,
          securityId: String(securityId),
          interval: intervalLabel,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          timestamp: c.timestamp,
        },
      },
      upsert: true,
    },
  }));
  try {
    await IndexCandles.bulkWrite(bulkOps, { ordered: false });
    console.log(`Saved ${candles.length} candles for ${indexName} (${intervalLabel})`);
  } catch (err) {
    console.error("❌ Error saving to DB:", err);
  }
}

async function fetchIntradayFromDhan({ securityId, exchangeSegment, interval, fromDate, toDate }) {
  if (!DHAN_TOKEN) throw new Error("DHAN_ACCESS_TOKEN not set.");
  const url = `${DHAN_API_BASE}/charts/intraday`;
  const body = {
    securityId: String(securityId),
    exchangeSegment: String(exchangeSegment),
    instrument: "EQUITY",
    interval: String(interval),
    oi: OI,
    fromDate,
    toDate,
  };
  try {
    const resp = await axios.post(url, body, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "access-token": DHAN_TOKEN,
      },
      timeout: 30000,
    });
    return resp.data ?? null;
  } catch (err) {
    console.error("❌ Dhan API error:", err?.response?.data ?? err.message);
    return null;
  }
}

// choose best base interval to aggregate a given target: prefer the largest base that divides target
function chooseBaseForTarget(target, availableBases) {
  const candidates = availableBases.filter((b) => target % b === 0);
  if (candidates.length === 0) return null;
  return Math.max(...candidates);
}

// ----------------- Main -----------------
async function run() {
  try {
    if (!DHAN_TOKEN) {
      console.error("❌ Set DHAN_ACCESS_TOKEN in .env");
      process.exit(1);
    }
    await connectDB();

    // fallback start date if needed
    let fallbackStart = null;
    if (FROM_DATE_STR) {
      const iso = FROM_DATE_STR.includes("T") ? FROM_DATE_STR : FROM_DATE_STR.replace(" ", "T");
      const dt = new Date(iso);
      if (!isNaN(dt.getTime())) fallbackStart = dt;
      else console.warn("⚠️ FROM_DATE invalid, will attempt to use API timestamps if present.");
    } else {
      console.warn("⚠️ FROM_DATE not provided — if API doesn't include timestamps, candles cannot be generated.");
    }

    const fromDate = FROM_DATE_STR ?? (new Date(Date.now() - 3 * 24 * 3600 * 1000)).toISOString().slice(0, 19).replace("T", " ");
    const toDate = TO_DATE ?? new Date().toISOString().slice(0, 19).replace("T", " ");

    console.log(`Using fromDate=${fromDate} toDate=${toDate}`);
    console.log(`BASE_INTERVALS=${BASE_INTERVALS.join(", ")} TARGETS=${TARGET_INTERVALS.join(", ")}`);

    for (const idx of indices) {
      console.log(`\n▶ Processing ${idx.name} (securityId=${idx.securityId})`);

      // fetch all base intervals and keep in memory
      const baseMap = {}; // baseInterval -> array of base candles
      for (const baseInterval of BASE_INTERVALS) {
        console.log(`  - Fetching base ${baseInterval}m`);
        const raw = await fetchIntradayFromDhan({
          securityId: idx.securityId,
          exchangeSegment: idx.exchangeSegment ?? idx.seg ?? "IDX_I",
          interval: baseInterval,
          fromDate,
          toDate,
        });
        if (!raw) {
          console.log(`   No response for base ${baseInterval}m`);
          continue;
        }
        const baseCandles = buildCandlesFromArrays(raw, fallbackStart, baseInterval);
        if (!baseCandles) {
          console.warn(`   ⚠️ Could not build ${baseInterval}m candles for ${idx.name}`);
          continue;
        }
        baseCandles.sort((a, b) => new Date(a.timestampISO) - new Date(b.timestampISO));
        baseMap[baseInterval] = baseCandles;
        // small delay
        await new Promise((r) => setTimeout(r, 250));
      }

      // For each target interval, pick best base and aggregate/save
      for (const target of TARGET_INTERVALS) {
        const base = chooseBaseForTarget(target, Object.keys(baseMap).map(Number));
        if (!base) {
          console.warn(`  ⚠️ No available base interval to produce ${target}m for ${idx.name}. Available: ${Object.keys(baseMap).join(", ")}`);
          continue;
        }
        const chunkSize = target / base;
        const baseCandles = baseMap[base];
        if (!baseCandles || baseCandles.length === 0) {
          console.warn(`  ⚠️ base ${base}m has no candles for ${idx.name}`);
          continue;
        }
        const aggregated = aggregateCandles(baseCandles, chunkSize);
        await saveCandlesToDB(idx.name, idx.securityId, `${target}m`, aggregated);
      }
    }

    console.log("\n✅ All done. Disconnecting DB.");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
}

run();
