// indexCandlesFetcher.js
import moment from "moment-timezone";
import IndexCandles from "../models/indexCandles.model.js";
import axios from "axios";
import { getPreviousTradingDay } from "../controllers/liveMarketData.controller.js";

const indices = [
  { name: "NIFTY", scrip: "13", seg: "IDX_I", stepSize: 50 },
  { name: "BANKNIFTY", scrip: "25", seg: "IDX_I", stepSize: 100 },
  { name: "FINNIFTY", scrip: "27", seg: "IDX_I", stepSize: 50 },
  { name: "MIDCPNIFTY", scrip: "442", seg: "IDX_I", stepSize: 75 },
  { name: "SENSEX", scrip: "51", seg: "IDX_I", stepSize: 100 },
];

const DHAN_API_URL = "https://api.dhan.co/v2/charts/intraday";
const ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzY0NzU3OTg2LCJpYXQiOjE3NjQ2NzE1ODYsInRva2VuQ29uc3VtZXJUeXBlIjoiU0VMRiIsIndlYmhvb2tVcmwiOiIiLCJkaGFuQ2xpZW50SWQiOiIxMTA0MDczMDc4In0.i9Oi3J3vqPD1uACnsSSGp79nXr-2yVey600wDCg1XraVwschR9WWMIseh5G9rKAfpyjOk78Q9f6SFGYKaX9y-g";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const TZ = "Asia/Kolkata";

const unixToIST = (unixTimestamp) =>
  moment.unix(unixTimestamp).tz(TZ).format("DD/MM/YYYY, hh:mm:ss A");

const formatDateForAPI = (date) => moment(date).format("DD-MM-YYYY");

// Normalize timestamps array (detect ms vs s)
const normalizeTimestamps = (arr) =>
  (arr || []).map((t) => {
    if (t === undefined || t === null) return t;
    const n = Number(t);
    if (isNaN(n)) return null;
    if (n > 1e12) return Math.floor(n / 1000); // ms -> s
    return Math.floor(n); // assume seconds
  });

// Ensure chronological arrays and drop invalid entries
const normalizeAndSortApiData = (apiData) => {
  if (!apiData || !Array.isArray(apiData.timestamp)) return apiData;
  const ts = normalizeTimestamps(apiData.timestamp);
  const rows = [];
  for (let i = 0; i < ts.length; i++) {
    if (!ts[i]) continue;
    rows.push({
      ts: ts[i],
      open: apiData.open[i],
      high: apiData.high[i],
      low: apiData.low[i],
      close: apiData.close[i],
    });
  }
  // sort ascending (oldest -> newest)
  rows.sort((a, b) => a.ts - b.ts);
  return {
    timestamp: rows.map((r) => r.ts),
    open: rows.map((r) => r.open),
    high: rows.map((r) => r.high),
    low: rows.map((r) => r.low),
    close: rows.map((r) => r.close),
  };
};

const generateSessionIntervals = (tradingDateString = moment().tz(TZ).format("DD-MM-YYYY")) => {
  const start = moment.tz(`${tradingDateString} 09:15:00`, "DD-MM-YYYY HH:mm:ss", TZ);
  const sessionEnd = moment.tz(`${tradingDateString} 15:30:00`, "DD-MM-YYYY HH:mm:ss", TZ);

  const intervals15 = [];
  let cursor = start.clone();
  while (cursor.isBefore(sessionEnd)) {
    const end = cursor.clone().add(15, "minutes");
    intervals15.push({
      startUnix: cursor.unix(),
      startLabel: cursor.format("HH:mm"),
      endUnix: end.unix(),
      label: `${cursor.format("HH:mm")} - ${end.format("HH:mm")}`,
    });
    cursor.add(15, "minutes");
  }

  const intervals30 = [];
  let cursor30 = start.clone();
  while (cursor30.isBefore(sessionEnd)) {
    const end = cursor30.clone().add(30, "minutes");
    const effectiveEnd = end.isAfter(sessionEnd) ? sessionEnd.clone() : end;
    intervals30.push({
      startUnix: cursor30.unix(),
      startLabel: cursor30.format("HH:mm"),
      endUnix: effectiveEnd.unix(),
      label: `${cursor30.format("HH:mm")} - ${effectiveEnd.format("HH:mm")}`,
      isShort: end.isAfter(sessionEnd),
    });
    cursor30.add(30, "minutes");
  }

  const interval3 = [];
  const last3Start = sessionEnd.clone().subtract(3, "minutes");
  let cursor3 = start.clone();
  while (cursor3.isSameOrBefore(last3Start)) {
    interval3.push(cursor3.unix());
    cursor3.add(3, "minutes");
  }

  return { intervals15, intervals30, interval3 };
};

const isContiguous = (arr, stepSeconds) => {
  if (!arr || arr.length === 0) return false;
  const s = arr.slice().sort((a, b) => a - b);
  for (let i = 1; i < s.length; i++) {
    if (s[i] - s[i - 1] !== stepSeconds) return false;
  }
  return true;
};

// ---------------- 1m -> 3m (only save when 3m interval is complete) ----------------
const merge1mTo3m = (data, tradingDay, nowUnix) => {
  if (!data || !Array.isArray(data.timestamp) || data.timestamp.length === 0) return [];

  const timestamps = data.timestamp; // already normalized & sorted by caller
  const open = data.open || [];
  const high = data.high || [];
  const low = data.low || [];
  const close = data.close || [];

  const session = generateSessionIntervals(tradingDay);
  const sessionStart = session.intervals15[0].startUnix; // 09:15
  const sessionEnd = moment.unix(session.intervals15[session.intervals15.length - 1].endUnix).unix(); // 15:30
  const last3StartAllowed = moment.unix(sessionEnd).subtract(3, "minutes").unix(); // 15:27
  const candlesToProcess = 9;

  const startIndex = Math.max(0, timestamps.length - candlesToProcess);
  const sliced = {
    open: open.slice(startIndex),
    high: high.slice(startIndex),
    low: low.slice(startIndex),
    close: close.slice(startIndex),
    timestamp: timestamps.slice(startIndex),
  };

  const groups = {};
  let afterMarketClose = null;

  for (let i = 0; i < sliced.timestamp.length; i++) {
    const ts = sliced.timestamp[i];
    if (!ts) continue;
    if (ts < sessionStart) continue;
    if (ts > sessionEnd) {
      afterMarketClose = sliced.close[i];
      continue;
    }
    const date = moment.unix(ts).tz(TZ);
    const minute = date.minute();
    const intervalStartMinute = Math.floor(minute / 3) * 3;
    const intervalStartUnix = date.set({ minute: intervalStartMinute, second: 0, millisecond: 0 }).unix();

    if (intervalStartUnix < sessionStart || intervalStartUnix > last3StartAllowed) continue;

    if (!groups[intervalStartUnix]) groups[intervalStartUnix] = { open: [], high: [], low: [], close: [], ts: [] };
    groups[intervalStartUnix].open.push(sliced.open[i]);
    groups[intervalStartUnix].high.push(sliced.high[i]);
    groups[intervalStartUnix].low.push(sliced.low[i]);
    groups[intervalStartUnix].close.push(sliced.close[i]);
    groups[intervalStartUnix].ts.push(sliced.timestamp[i]);
  }

  const keys = Object.keys(groups).map(Number).sort((a, b) => b - a).slice(0, 3);
  const merged = [];

  for (const key of keys) {
    const g = groups[key];
    const intervalEnd = key + 3 * 60;
    if (g.open.length === 3 && isContiguous(g.ts, 60) && intervalEnd <= nowUnix) {
      merged.push({
        open: g.open[0],
        high: Math.max(...g.high),
        low: Math.min(...g.low),
        close: g.close[g.close.length - 1],
        lastClose: g.close[g.close.length - 1],
        timestamp: unixToIST(key),
        rawTimestampUnix: key,
      });
    } else {
      // skip incomplete
    }
  }

  if (afterMarketClose !== null) {
    const targetUnix = moment.tz(tradingDay, "DD-MM-YYYY", TZ).set({ hour: 15, minute: 27, second: 0, millisecond: 0 }).unix();
    merged.push({
      close: afterMarketClose,
      lastClose: afterMarketClose,
      timestamp: unixToIST(targetUnix),
      rawTimestampUnix: targetUnix,
      isAfterMarketUpdate: true,
    });
  }

  return merged; // newest-first
};

// ---------------- 15m processing & 15m->30m merging (ONLY USING last 7 and bypass last if incomplete) ----------------
// Replace existing process15mAndMergeTo30m with this function
const process15mAndMergeTo30m = (apiData, index, tradingDay, nowUnix) => {
  /**
   * - Use last 7 15m from apiData (already normalized & chronological).
   * - Bypass latest if incomplete.
   * - Build 30m pairs where first minute === 15 or 45 and second = first + 15m.
   * - Exceptional single -> 30m allowed ONLY if single.rawTimestampUnix === last15StartAllowed (15:15).
   */

  const result = { fifteenCandles: [], last3Fifteen: [], thirtyCandles: [] };
  if (!apiData || !Array.isArray(apiData.timestamp) || apiData.timestamp.length === 0) return result;

  const timestamps = apiData.timestamp; // chronological old -> new
  const open = apiData.open || [];
  const high = apiData.high || [];
  const low = apiData.low || [];
  const close = apiData.close || [];

  const session = generateSessionIntervals(tradingDay);
  const sessionStart = session.intervals15[0].startUnix; // 09:15
  const sessionEnd = moment.unix(session.intervals15[session.intervals15.length - 1].endUnix).unix(); // 15:30
  const last15StartAllowed = session.intervals15[session.intervals15.length - 1].startUnix; // 15:15

  // last 7
  const startIndex = Math.max(0, timestamps.length - 7);
  const sliced = {
    open: open.slice(startIndex),
    high: high.slice(startIndex),
    low: low.slice(startIndex),
    close: close.slice(startIndex),
    timestamp: timestamps.slice(startIndex),
  };

  let afterMarketClose = null;
  for (let i = 0; i < sliced.timestamp.length; i++) {
    const ts = sliced.timestamp[i];
    if (!ts) continue;
    if (ts < sessionStart) continue;
    if (ts > sessionEnd) {
      afterMarketClose = sliced.close[i];
      continue;
    }

    const minutesFromStart = moment.unix(ts).tz(TZ).diff(moment.unix(sessionStart).tz(TZ), "minutes");
    if (minutesFromStart % 15 !== 0) {
      console.warn(`Skipping misaligned 15m at ${unixToIST(ts)} for ${index.name}`);
      continue;
    }

    const candleEnd = ts + 15 * 60;
    if (candleEnd > nowUnix) {
      // bypass incomplete (this will skip the latest incomplete if present)
      console.log(`Bypassing incomplete 15m at ${unixToIST(ts)} (ends ${unixToIST(candleEnd)})`);
      continue;
    }

    if (ts > last15StartAllowed) continue;

    result.fifteenCandles.push({
      open: sliced.open[i],
      high: sliced.high[i],
      low: sliced.low[i],
      close: sliced.close[i],
      lastClose: sliced.close[i],
      timestamp: unixToIST(ts),
      rawTimestampUnix: ts,
    });
  }

  if (afterMarketClose !== null) {
    const targetUnix = moment.tz(tradingDay, "DD-MM-YYYY", TZ).set({ hour: 15, minute: 15, second: 0, millisecond: 0 }).unix();
    result.fifteenCandles.push({
      isAfterMarketUpdate: true,
      close: afterMarketClose,
      lastClose: afterMarketClose,
      timestamp: unixToIST(targetUnix),
      rawTimestampUnix: targetUnix,
    });
  }

  // chronological (old -> new)
  result.fifteenCandles.sort((a, b) => a.rawTimestampUnix - b.rawTimestampUnix);

  // last 3 complete 15m for saving
  result.last3Fifteen = result.fifteenCandles.slice(-3);

  // Build 30m pairs greedily from chronological fifteenCandles
  const chrono = result.fifteenCandles.slice();
  const used = new Set();
  const allowed30Starts = generateSessionIntervals(tradingDay).intervals30.map((it) => it.startUnix);

  for (let i = 0; i < chrono.length - 1; i++) {
    if (used.has(i)) continue;
    const first = chrono[i];
    const second = chrono[i + 1];
    if (!first || !second) continue;

    const minute = moment.unix(first.rawTimestampUnix).tz(TZ).minute();
    // first must be 15 or 45
    if (!(minute === 15 || minute === 45)) continue;

    // second must be exactly +15m
    if (second.rawTimestampUnix - first.rawTimestampUnix !== 900) continue;

    // defensive: ensure first is allowed 30-start
    if (!allowed30Starts.includes(first.rawTimestampUnix)) continue;

    // create 30m
    result.thirtyCandles.push({
      open: first.open,
      high: Math.max(first.high, second.high),
      low: Math.min(first.low, second.low),
      close: second.close,
      lastClose: second.close,
      timestamp: first.timestamp,
      rawTimestampUnix: first.rawTimestampUnix,
    });

    used.add(i);
    used.add(i + 1);
  }

  // Exceptional single -> 30m ONLY if it is the session's last 15-start (15:15)
  // i.e., single.rawTimestampUnix === last15StartAllowed
  if (result.thirtyCandles.length === 0) {
    const single = result.fifteenCandles.slice(-1)[0];
    if (single) {
      const end = single.rawTimestampUnix + 15 * 60;
      if (single.rawTimestampUnix === last15StartAllowed && end <= nowUnix) {
        // allow single -> 30m (maps to 15:15)
        result.thirtyCandles.push({
          open: single.open,
          high: single.high,
          low: single.low,
          close: single.close,
          lastClose: single.lastClose,
          timestamp: single.timestamp,
          rawTimestampUnix: single.rawTimestampUnix,
          isSingle: true,
        });
      }
    }
  }

  return result;
};



// ---------------- Fetch Dhan Data ----------------
const fetchDhanData = async (index, interval, fromDate, toDate) => {
  let intervalParam = interval === "3m" ? 1 : Number(interval.replace("m", "")) || Number(interval);
  const formattedFromDate = moment(fromDate, "DD-MM-YYYY").format("YYYY-MM-DD");
  const formattedToDate = moment(toDate, "DD-MM-YYYY").format("YYYY-MM-DD");

  try {
    const response = await axios.post(
      DHAN_API_URL,
      {
        securityId: index.scrip,
        exchangeSegment: index.seg,
        instrument: "INDEX",
        interval: intervalParam,
        oi: false,
        fromDate: formattedFromDate,
        toDate: formattedToDate,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "access-token": ACCESS_TOKEN,
        },
        timeout: 15000,
      }
    );

    if (!response?.data) {
      console.warn(`Dhan returned empty payload for ${index.name} interval ${interval}`);
      return null;
    }

    return {
      open: response.data.open || [],
      low: response.data.low || [],
      high: response.data.high || [],
      close: response.data.close || [],
      timestamp: response.data.timestamp || [],
    };
  } catch (error) {
    if (error.response?.status === 429) {
      console.warn(`Rate limit hit for ${index.name}. Retrying after 150ms...`);
      await delay(150);
      return fetchDhanData(index, interval, fromDate, toDate);
    }
    console.error(`Error fetching ${interval} data for ${index.name}:`, error.response?.data || error.message);
    return null;
  }
};

// ---------------- Save helpers ----------------
const saveCandleIfNotExists = async (index, interval, candle) => {
  const query = {
    indexName: index.name,
    securityId: index.scrip,
    interval,
    timestamp: candle.timestamp,
  };

  try {
    if (candle.isAfterMarketUpdate) {
      const updateResult = await IndexCandles.updateOne(query, {
        $set: {
          close: candle.close,
          lastClose: candle.lastClose,
        },
      });
      if (updateResult.matchedCount > 0 || updateResult.modifiedCount > 0) {
        console.log(`Updated after-market ${interval} candle for ${index.name} at ${candle.timestamp}`);
        return;
      } else {
        const indexCandle = new IndexCandles({
          indexName: index.name,
          securityId: index.scrip,
          interval,
          open: candle.open || 0,
          high: candle.high || 0,
          low: candle.low || 0,
          close: candle.close,
          lastClose: candle.lastClose,
          timestamp: candle.timestamp,
          rawTimestampUnix: candle.rawTimestampUnix,
        });
        await indexCandle.save();
        console.log(`Saved new ${interval} candle for ${index.name} at ${candle.timestamp} with after-market close`);
        return;
      }
    }

    const existing = await IndexCandles.findOne(query);
    if (!existing) {
      const indexCandle = new IndexCandles({
        indexName: index.name,
        securityId: index.scrip,
        interval,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        lastClose: candle.lastClose,
        timestamp: candle.timestamp,
        rawTimestampUnix: candle.rawTimestampUnix,
      });
      await indexCandle.save();
      console.log(`Saved ${interval} candle for ${index.name} at ${candle.timestamp}`);
    } else {
      // skip existing
    }
  } catch (err) {
    console.error(`DB error saving ${interval} candle for ${index.name} at ${candle.timestamp}:`, err);
  }
};

// ---------------- Process index candles ----------------
const processIndexCandles = async (index, apiData, currentTime, interval, tradingDay) => {
  if (!apiData) {
    console.log(`No data to process for ${index.name} (${interval})`);
    return;
  }

  try {
    const nowUnix = moment(currentTime).tz(TZ).unix();

    if (interval === "3m") {
      // apiData must be 1m data (we requested intervalParam=1)
      const merged3m = merge1mTo3m(apiData, tradingDay, nowUnix); // newest-first
      for (const candle of merged3m) {
        await saveCandleIfNotExists(index, "3m", candle);
      }
    } else if (interval === "15m") {
      // apiData is 15m candles; we will take last 7, bypass incomplete last, use remaining 6 to form 3x30m
      const processed = process15mAndMergeTo30m(apiData, index, tradingDay, nowUnix);

      // Save last 3 complete 15m candles
      const last3 = processed.last3Fifteen || [];
      for (const candle of last3) {
        await saveCandleIfNotExists(index, "15m", candle);
      }

      // Save the 30m candles produced (3x30m expected when last was bypassed)
      for (const candle of processed.thirtyCandles) {
        await saveCandleIfNotExists(index, "30m", candle);
      }
    } else if (interval === "30m") {
      // fallback: if raw 30m fetched, save last 3 30m that are aligned
      const timestamps = normalizeTimestamps(apiData.timestamp || []);
      const session = generateSessionIntervals(tradingDay);
      const sessionStart = session.intervals15[0].startUnix;
      const sessionEnd = moment.unix(session.intervals15[session.intervals15.length - 1].endUnix).unix();

      const startIndex = Math.max(0, timestamps.length - 3);
      for (let i = startIndex; i < apiData.open.length; i++) {
        const ts = timestamps[i];
        if (!ts) continue;
        if (ts < sessionStart || ts > sessionEnd) continue;
        // ensure ts matches one of allowed 30m starts
        const allowed30 = session.intervals30.map((it) => it.startUnix);
        if (!allowed30.includes(ts)) {
          console.warn(`Skipping misaligned raw 30m at ${unixToIST(ts)} for ${index.name}`);
          continue;
        }
        const candle = {
          open: apiData.open[i],
          high: apiData.high[i],
          low: apiData.low[i],
          close: apiData.close[i],
          lastClose: apiData.close[i],
          timestamp: unixToIST(ts),
          rawTimestampUnix: ts,
        };
        await saveCandleIfNotExists(index, "30m", candle);
      }
    }
  } catch (error) {
    console.error(`Error processing ${index.name} candles for ${interval}:`, error);
  }
};

// ---------------- Fetch & Process All Indices ----------------
const fetchAndProcessAllIndices = async (fromDate, toDate) => {
  // compute now once (IST)
  const currentTime = moment().tz(TZ).toDate();
  const intervals = ["3m", "15m"];

  for (const index of indices) {
    for (const interval of intervals) {
      let apiData = await fetchDhanData(index, interval, fromDate, toDate);
      if (apiData) {
        // normalize & sort to chronological arrays (old -> new)
        apiData = normalizeAndSortApiData(apiData);
        await processIndexCandles(index, apiData, currentTime, interval, toDate);
      }
      await delay(150);
    }
  }
  console.log("All indices processed successfully");
};

// ---------------- deleteOldIndexData ----------------
export const deleteOldIndexData = async () => {
  try {
    const previousDay = await getPreviousTradingDay(new Date());
    const deleteBefore = new Date(previousDay);
    deleteBefore.setHours(0, 0, 0, 0);
    await IndexCandles.deleteMany({
      createdAt: { $lt: deleteBefore },
    });
    console.log("✅ Old index candle data deleted before", deleteBefore.toISOString());
  } catch (error) {
    console.log("❌ Error deleting index candles old data:", error);
  }
};

// ---------------- Main runner ----------------
export const runFetchForIndexCandles = async () => {
  try {
    const today = moment().tz(TZ);
    const currentDate = formatDateForAPI(today);
    await fetchAndProcessAllIndices(currentDate, currentDate);
  } catch (error) {
    console.error("Error in runFetchForIndexCandles:", error);
    throw error;
  }
};


