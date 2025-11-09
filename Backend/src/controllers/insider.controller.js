// controllers/optionInsider.controller.js
import {
  BankNiftyOptionChain,
  FinniftyOptionChain,
  NiftyOptionChain,
  MidcpNiftyOptionChain,
  SensexOptionChain,
} from "../models/optionChain.model.js";
import { addMinutesToTimestamp } from "../utils/dateUtils.js";
import { isMarketOpen } from "../utils/marketUtils.js";

/**
 * Helper: parse timestamp strings like "9:24:00 AM", "09:24", "15:30-EOD", "9:24"
 * Returns minutes since midnight in IST assumed (integer).
 */
function parseTimeToMinutes(ts) {
  if (!ts) return null;
  const cleaned = String(ts).split("-")[0].trim().replace(/-EOD$/i, "").trim();
  const m = cleaned.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/);
  if (!m) return null;
  let hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const ss = parseInt(m[3] || "0", 10);
  const ampm = m[4];
  if (ampm) {
    const isPM = /pm/i.test(ampm);
    if (isPM && hh !== 12) hh += 12;
    if (!isPM && hh === 12) hh = 0;
  }
  // convert to minutes since midnight
  return hh * 60 + mm;
}

/**
 * Format minutes since midnight into HH:MM (24h) or h:mm AM/PM as you like.
 * We'll return `H:MM` or `HH:MM` (without seconds) — consistent with your DB.
 */
function minutesToTimeString(mins) {
  if (mins == null) return "";
  const hh = Math.floor(mins / 60);
  const mm = mins % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/**
 * Sort docs newest-first using timestamp (fallback to updatedAt)
 */
function sortByTimestamp(data) {
  if (!Array.isArray(data)) return data;
  return data.slice().sort((a, b) => {
    const ma = parseTimeToMinutes(a.timestamp);
    const mb = parseTimeToMinutes(b.timestamp);

    if (ma != null && mb != null) return mb - ma; // newest first
    // fallback to updatedAt if parse failed
    const da = new Date(a.updatedAt || 0);
    const db = new Date(b.updatedAt || 0);
    return db - da;
  });
}

/**
 * find strike closest to lastPrice
 */
function findClosestStrikePrice(strikeData, lastPrice) {
  if (!Array.isArray(strikeData) || strikeData.length === 0) return null;
  let closest = null;
  let minDiff = Number.MAX_VALUE;
  const price = Number(lastPrice);
  for (const d of strikeData) {
    const strike = Number(d.strikePrice);
    const diff = Math.abs(strike - price);
    if (diff < minDiff) {
      closest = strike;
      minDiff = diff;
    }
  }
  return closest;
}

function getCEPEObj(strikeData, strikePrice, optionType) {
  return (strikeData || []).find(
    (el) =>
      Number(el.strikePrice) === Number(strikePrice) &&
      String(el.optionType).toUpperCase() === String(optionType).toUpperCase()
  );
}

function getAnalysis(now, prev) {
  if (!now || !prev) return { text: "Confusion", direction: null, green: false };

  const nowLP = Number(now.lastPrice || 0);
  const prevLP = Number(prev.lastPrice || 0);
  const nowOi = Number(now.oi || 0);
  const prevOi = Number(prev.oi || 0);

  if (nowLP >= prevLP && nowOi <= prevOi)
    return { text: "Shorts covering", direction: "up", green: true };
  if (nowLP <= prevLP && nowOi >= prevOi)
    return { text: "Short build up", direction: "down", green: false };
  if (nowLP >= prevLP && nowOi >= prevOi)
    return { text: "Long build up", direction: "up", green: true };
  if (nowLP <= prevLP && nowOi <= prevOi)
    return { text: "Long unwinding", direction: "down", green: false };

  return { text: "Neutral", direction: null, green: false };
}

/**
 * Build windows aligned to 09:15 baseline.
 * intervalMin = 3 or 15
 * We'll produce an array of windows (startMin, endMin) that exists within trading day (9:15-15:33)
 */
function buildWindowsForDay(intervalMin) {
  const marketOpen = 9 * 60 + 15; // 9:15 -> minutes
  const marketClose = 15 * 60 + 33; // 15:33 -> inclusive
  const windows = [];
  for (let start = marketOpen; start + intervalMin <= marketClose; start += intervalMin) {
    const end = start + intervalMin; // e.g. start=9:15 end=9:18 for 3-min
    windows.push({ start, end });
  }
  return windows;
}

/**
 * For a sorted (newest-first) docs array, create rows comparing end-of-prev-window doc and end-of-current-window doc.
 * We will:
 *  - reverse sorted docs to chronological (oldest-first)
 *  - for each target window, find the doc with timestamp <= window.end that is the latest in that bucket (i.e. closest to end)
 *  - compare consecutive window ends: prev = doc for previous window end, now = doc for current window end
 */
function optionIntervalAnalysis(docsSortedNewestFirst, intervalMin) {
  const rows = [];
  if (!Array.isArray(docsSortedNewestFirst) || docsSortedNewestFirst.length === 0) return rows;

  // chronological oldest-first
  const docsChron = docsSortedNewestFirst.slice().reverse();

  // Map minute -> doc index: compute minute for each doc
  const docMinutes = docsChron.map((d) => ({ doc: d, mins: parseTimeToMinutes(d.timestamp) }));

  const windows = buildWindowsForDay(intervalMin);

  // function to find latest doc <= windowEnd
  function findDocForWindowEnd(windowEnd) {
    // find doc with mins <= windowEnd and maximum mins
    let candidate = null;
    let candidateMin = -Infinity;
    for (const { doc, mins } of docMinutes) {
      if (mins == null) continue;
      if (mins <= windowEnd && mins > candidateMin) {
        candidate = doc;
        candidateMin = mins;
      }
    }
    return candidate;
  }

  // loop windows, pair previous and current
  for (let i = 1; i < windows.length; i++) {
    const prevWindow = windows[i - 1];
    const currWindow = windows[i];

    // doc at prevWindow end and doc at currWindow end
    const prevDoc = findDocForWindowEnd(prevWindow.end);
    const nowDoc = findDocForWindowEnd(currWindow.end);

    if (!prevDoc || !nowDoc) {
      // skip if either side missing
      continue;
    }

    // find closest strike relative to nowDoc.lastPrice
    const closestStrike = findClosestStrikePrice(nowDoc.strikeData, nowDoc.lastPrice);
    if (closestStrike == null) continue;

    const prevCE = getCEPEObj(prevDoc.strikeData, closestStrike, "CE");
    const prevPE = getCEPEObj(prevDoc.strikeData, closestStrike, "PE");
    const nowCE = getCEPEObj(nowDoc.strikeData, closestStrike, "CE");
    const nowPE = getCEPEObj(nowDoc.strikeData, closestStrike, "PE");

    if (!prevCE || !prevPE || !nowCE || !nowPE) continue;

    const callAnalysis = getAnalysis(nowCE, prevCE);
    const putAnalysis = getAnalysis(nowPE, prevPE);

    // numeric delta fields
    const callChangePrice = Number(nowCE.lastPrice || 0) - Number(prevCE.lastPrice || 0);
    const callChangeOI = Number(nowCE.oi || 0) - Number(prevCE.oi || 0);

    const putChangePrice = Number(nowPE.lastPrice || 0) - Number(prevPE.lastPrice || 0);
    const putChangeOI = Number(nowPE.oi || 0) - Number(prevPE.oi || 0);

    rows.push({
      timeStamp: `${minutesToTimeString(prevWindow.start)} - ${minutesToTimeString(prevWindow.end)}`, // show window range (prev)
      compareRange: `${minutesToTimeString(currWindow.start)} - ${minutesToTimeString(currWindow.end)}`, // current window
      strikePrice: closestStrike,
      call: {
        ...callAnalysis,
        lastPriceNow: Number(nowCE.lastPrice || 0),
        oiNow: Number(nowCE.oi || 0),
        lastPricePrev: Number(prevCE.lastPrice || 0),
        oiPrev: Number(prevCE.oi || 0),
        changePrice: callChangePrice,
        changeOi: callChangeOI,
      },
      put: {
        ...putAnalysis,
        lastPriceNow: Number(nowPE.lastPrice || 0),
        oiNow: Number(nowPE.oi || 0),
        lastPricePrev: Number(prevPE.lastPrice || 0),
        oiPrev: Number(prevPE.oi || 0),
        changePrice: putChangePrice,
        changeOi: putChangeOI,
      },
      // include raw timestamps for debugging / UI optional use
      prevTimestamp: prevDoc.timestamp,
      nowTimestamp: nowDoc.timestamp,
    });
  }

  return rows;
}

const indexWiseModels = {
  NIFTY: NiftyOptionChain,
  BANKNIFTY: BankNiftyOptionChain,
  FINNIFTY: FinniftyOptionChain,
  MIDCPNIFTY: MidcpNiftyOptionChain,
  SENSEX: SensexOptionChain,
};

export const getOptionInsiderData = async (req, res) => {
  try {
    const { index, expiry, interval } = req.query;
    if (!index) return res.status(400).json({ success: false, message: "Missing index" });

    const Model = indexWiseModels[index.toUpperCase()];
    if (!Model) return res.status(400).json({ success: false, message: "Invalid index" });

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // fetch newest docs first
    let docs = await Model.find().sort({ updatedAt: -1 }).lean();
    if (!docs || docs.length === 0) return res.status(200).json({ success: true, rows: [], availableExpiries: [] });

    // if newest doc is today, filter to today's docs
    const newestUpdatedAt = new Date(docs[0].updatedAt);
    if (newestUpdatedAt >= startOfToday && newestUpdatedAt <= now) {
      const queryObj = {
        underlyingName: index.toUpperCase(),
        updatedAt: { $gte: startOfToday, $lte: now },
      };
      if (expiry) queryObj.expiry = expiry;
      docs = await Model.find(queryObj).sort({ updatedAt: -1 }).lean();
    } else if (expiry) {
      docs = docs.filter((d) => d.expiry === expiry);
    }

    const sortedDocs = sortByTimestamp(docs); // newest-first (by timestamp)
    const intervalMin = Number(interval || 3);
    if (![3, 15].includes(intervalMin)) return res.status(400).json({ success: false, message: "Invalid interval" });

    const rows = optionIntervalAnalysis(sortedDocs, intervalMin);

    const allExpiries = await Model.distinct("expiry", { underlyingName: index.toUpperCase() });

    res.json({
      success: true,
      index,
      expiry,
      interval: intervalMin,
      availableExpiries: allExpiries,
      rows,
    });
  } catch (error) {
    console.error("Error in OptionInsider controller:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getExpiriesByIndex = async (req, res) => {
  try {
    const result = {};
    for (const key in indexWiseModels) {
      const Model = indexWiseModels[key];
      const allExpiries = await Model.distinct("expiry", { underlyingName: key });
      result[key] = allExpiries || [];
    }
    res.status(200).json({ success: true, message: "Expiries fetched", expiriesByIndex: result });
  } catch (error) {
    console.error("Error fetching expiries:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
