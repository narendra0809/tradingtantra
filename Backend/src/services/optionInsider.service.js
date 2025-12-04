import {
  BankNiftyOptionChain,
  FinniftyOptionChain,
  NiftyOptionChain,
  MidcpNiftyOptionChain,
  SensexOptionChain,
} from "../models/optionChain.model.js";

const indexWiseModels = {
  NIFTY: NiftyOptionChain,
  BANKNIFTY: BankNiftyOptionChain,
  FINNIFTY: FinniftyOptionChain,
  MIDCPNIFTY: MidcpNiftyOptionChain,
  SENSEX: SensexOptionChain,
};

function optionIntervalAnalysis(docsSortedNewestFirst, intervalMin) {
  const rows = [];
  if (
    !Array.isArray(docsSortedNewestFirst) ||
    docsSortedNewestFirst.length === 0
  )
    return rows;

  //   // chronological oldest-first
  const docsChron = docsSortedNewestFirst.slice().reverse();

  //   // Map minute -> doc index: compute minute for each doc
  const docMinutes = docsChron.map((d) => ({
    doc: d,
    mins: parseTimeToMinutes(d.timestamp),
  }));

  const windows = buildWindowsForDay(intervalMin);

  function findDocForWindowEnd(windowEnd) {
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

  for (let i = 1; i < windows.length; i++) {
    const prevWindow = windows[i - 1];
    const currWindow = windows[i];

    const prevDoc = findDocForWindowEnd(prevWindow.end);
    const nowDoc = findDocForWindowEnd(currWindow.end);

    if (!prevDoc || !nowDoc) continue;

    if (prevDoc.timestamp === nowDoc.timestamp) continue;

    const closestStrike = findClosestStrikePrice(
      nowDoc.strikeData,
      nowDoc.lastPrice
    );
    if (closestStrike == null) continue;

    const prevCE = getCEPEObj(prevDoc.strikeData, closestStrike, "CE");
    const prevPE = getCEPEObj(prevDoc.strikeData, closestStrike, "PE");
    const nowCE = getCEPEObj(nowDoc.strikeData, closestStrike, "CE");
    const nowPE = getCEPEObj(nowDoc.strikeData, closestStrike, "PE");

    if (!prevCE || !prevPE || !nowCE || !nowPE) continue;

    const callAnalysis = getAnalysis(nowCE, prevCE);
    const putAnalysis = getAnalysis(nowPE, prevPE);

    const callChangePrice =
      Number(nowCE.lastPrice || 0) - Number(prevCE.lastPrice || 0);
    const callChangeOI = Number(nowCE.oi || 0) - Number(prevCE.oi || 0);

    const putChangePrice =
      Number(nowPE.lastPrice || 0) - Number(prevPE.lastPrice || 0);
    const putChangeOI = Number(nowPE.oi || 0) - Number(prevPE.oi || 0);

    rows.push({
      timeStamp: `${minutesToTimeString(
        prevWindow.start
      )} - ${minutesToTimeString(prevWindow.end)}`,
      compareRange: `${minutesToTimeString(
        currWindow.start
      )} - ${minutesToTimeString(currWindow.end)}`,
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
      prevTimestamp: prevDoc.timestamp,
      nowTimestamp: nowDoc.timestamp,
    });
  }

  return rows;
}

function minutesToTimeString(mins) {
  if (mins == null) return "";
  const hh = Math.floor(mins / 60);
  const mm = mins % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function sortByTimestamp(data) {
  if (!Array.isArray(data)) return data;
  return data.slice().sort((a, b) => {
    const ma = parseTimeToMinutes(a.timestamp);
    const mb = parseTimeToMinutes(b.timestamp);

    if (ma != null && mb != null) return mb - ma; // newest first by timestamp
    const da = new Date(a.updatedAt || 0);
    const db = new Date(b.updatedAt || 0);
    return db - da;
  });
}

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
  if (!now || !prev)
    return { text: "Confusion", direction: null, color: "#777272" };

  const nowLP = Number(now.lastPrice || 0);
  const prevLP = Number(prev.lastPrice || 0);
  const nowOi = Number(now.oi || 0);
  const prevOi = Number(prev.oi || 0);

  if (nowLP >= prevLP && nowOi <= prevOi)
    return {
      text: "Short covering",
      direction: "up",
      color: "#003473",
      textColor: "#e7f9ff",
    };
  if (nowLP <= prevLP && nowOi >= prevOi)
    return {
      text: "Short build up",
      direction: "down",
      color: "#f44336",
      textColor: "#e7f9ff",
    };
  if (nowLP >= prevLP && nowOi >= prevOi)
    return {
      text: "Long build up",
      direction: "up",
      color: "#4caf50",
      textColor: "#e7f9ff",
    };
  if (nowLP <= prevLP && nowOi <= prevOi)
    return {
      text: "Long unwinding",
      direction: "down",
      color: "#ffc107",
      textColor: "#6e3b26",
    };

  return { text: "Neutral", direction: null, color: "#777272" };
}

function buildWindowsForDay(intervalMin) {
  const marketOpen = 9 * 60 + 15; // 9:15 -> minutes
  const marketClose = 15 * 60 + 30; // 15:33 -> inclusive
  const windows = [];
  for (
    let start = marketOpen;
    start + intervalMin <= marketClose;
    start += intervalMin
  ) {
    const end = start + intervalMin;
    windows.push({ start, end });
  }

  return windows;
}

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

export async function buildOptionInsiderPayload({ index, expiry, interval }) {
  const Model = indexWiseModels[index.toUpperCase()];
  if (!Model) throw new Error("Invalid index");

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  let docs = await Model.find().sort({ updatedAt: -1 }).lean();
  if (!docs || docs.length === 0) {
    return {
      index,
      expiry,
      interval,
      rows: [],
      availableExpiries: [],
    };
  }

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

  docs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const intervalMin = Number(interval || 3);
  const rowsFromFn = optionIntervalAnalysis(docs, intervalMin);
  const rows = rowsFromFn.slice().reverse();

  const allExpiries = await Model.distinct("expiry", {
    underlyingName: index.toUpperCase(),
  });

  return {
    index,
    expiry,
    interval: intervalMin,
    availableExpiries: allExpiries,
    rows,
  };
}
