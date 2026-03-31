import {
  BtcOptionChain,
  EthOptionChain,
  SolOptionChain,
  XrpOptionChain,
} from "../models/cryptoOptionChain.model.js";

const indexWiseModels = {
  BTC: BtcOptionChain,
  ETH: EthOptionChain,
  SOL: SolOptionChain,
  XRP: XrpOptionChain,
};

/**
 * Same interval analysis logic as optionInsider.service.js but adapted for
 * 24/7 crypto markets (no market-hours restriction).
 */

function cryptoIntervalAnalysis(docsSortedNewestFirst, intervalMin) {
  const rows = [];
  if (
    !Array.isArray(docsSortedNewestFirst) ||
    docsSortedNewestFirst.length === 0
  )
    return rows;

  // Track the most recent document we're comparing backwards from
  let currentDoc = docsSortedNewestFirst[0];
  const selectedDocs = [currentDoc];
  let currentMins = parseTimeToMinutes(currentDoc.timestamp);

  if (currentMins == null) return rows;

  // Walk backwards to find docs that are separated by intervalMin
  for (let i = 1; i < docsSortedNewestFirst.length; i++) {
    const doc = docsSortedNewestFirst[i];
    const mins = parseTimeToMinutes(doc.timestamp);
    if (mins == null) continue;

    let diff = currentMins - mins;
    if (diff < 0) {
      diff += 24 * 60; // Handle midnight crossing
    }

    if (diff >= intervalMin) {
      selectedDocs.push(doc);
      currentDoc = doc;
      currentMins = mins;
    }
  }

  // selectedDocs contains [newest, older, oldest...].
  // Compare pairs backwards (newest vs older)
  for (let i = 0; i < selectedDocs.length - 1; i++) {
    const nowDoc = selectedDocs[i]; // Newest of pair
    const prevDoc = selectedDocs[i + 1]; // Older of pair

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
      timeStamp: `${prevDoc.timestamp} - ${nowDoc.timestamp}`,
      compareRange: `${prevDoc.timestamp} - ${nowDoc.timestamp}`,
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

  // Reverse so oldest rows come first (the caller does `.slice().reverse()` 
  // again so the dashboard gets youngest rows first).
  rows.reverse();

  return rows;
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
      textColor: "#FFFFFF",
    };
  if (nowLP <= prevLP && nowOi >= prevOi)
    return {
      text: "Short build up",
      direction: "down",
      color: "#F44336",
      textColor: "#FFFFFF",
    };
  if (nowLP >= prevLP && nowOi >= prevOi)
    return {
      text: "Long build up",
      direction: "up",
      color: "#4CAF50",
      textColor: "#FFFFFF",
    };
  if (nowLP <= prevLP && nowOi <= prevOi)
    return {
      text: "Long unwinding",
      direction: "down",
      color: "#E9B10B",
      textColor: "#000A2D",
    };

  return { text: "Neutral", direction: null, color: "#777272" };
}



function parseTimeToMinutes(ts) {
  if (!ts) return null;
  const cleaned = String(ts).split("-")[0].trim().replace(/-EOD$/i, "").trim();
  const m = cleaned.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/);
  if (!m) return null;
  let hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const ampm = m[4];
  if (ampm) {
    const isPM = /pm/i.test(ampm);
    if (isPM && hh !== 12) hh += 12;
    if (!isPM && hh === 12) hh = 0;
  }
  return hh * 60 + mm;
}

export async function buildCryptoOptionInsiderPayload({
  index,
  expiry,
  interval,
}) {
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
  const rowsFromFn = cryptoIntervalAnalysis(docs, intervalMin);
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
