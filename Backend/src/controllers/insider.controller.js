import {
  BankNiftyOptionChain,
  FinniftyOptionChain,
  NiftyOptionChain,
  MidcpNiftyOptionChain,
  SensexOptionChain,
} from "../models/optionChain.model.js";
import { addMinutesToTimestamp } from "../utils/dateUtils.js";
import { isMarketOpen } from "../utils/marketUtils.js";

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
      text: "Shorts covering",
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
    if (!index)
      return res.status(400).json({ success: false, message: "Missing index" });

    const Model = indexWiseModels[index.toUpperCase()];
    if (!Model)
      return res.status(400).json({ success: false, message: "Invalid index" });

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // fetch docs (use updatedAt sorting to get newest-first)
    let docs = await Model.find().sort({ updatedAt: -1 }).lean();
    if (!docs || docs.length === 0)
      return res
        .status(200)
        .json({ success: true, rows: [], availableExpiries: [] });

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

    // Ensure docs are sorted newest-first by updatedAt (explicit)
    docs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const intervalMin = Number(interval || 3);
    if (![3, 15].includes(intervalMin))
      return res
        .status(400)
        .json({ success: false, message: "Invalid interval" });

    // produce rows (optionIntervalAnalysis expects newest-first array)
    let rows = optionIntervalAnalysis(docs, intervalMin);

    // reverse rows so API returns newest rows first (latest windows on top)
    rows = rows.slice().reverse();

    const allExpiries = await Model.distinct("expiry", {
      underlyingName: index.toUpperCase(),
    });

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

// import {
//   BankNiftyOptionChain,
//   FinniftyOptionChain,
//   NiftyOptionChain,
//   MidcpNiftyOptionChain,
//   SensexOptionChain,
// } from "../models/optionChain.model.js";
// import { addMinutesToTimestamp } from "../utils/dateUtils.js";
// import { isMarketOpen } from "../utils/marketUtils.js";

// function findClosestStrikePrice(strikeData, lastPrice) {
//   let closest = null,
//     minDiff = Number.MAX_VALUE;
//   for (const d of strikeData || []) {
//     const diff = Math.abs(d.strikePrice - lastPrice);
//     if (diff < minDiff) {
//       closest = d.strikePrice;
//       minDiff = diff;
//     }
//   }
//   return closest;
// }
// function getCEPEObj(strikeData, strikePrice, optionType) {
//   return (strikeData || []).find(
//     (el) => el.strikePrice === strikePrice && el.optionType === optionType
//   );
// }
// function getAnalysis(now, prev) {
//   if (!now || !prev)
//     return { text: "Confusion", direction: null, green: false, yellow: true };

//   if (now.optionType === "CE") {
//     if (now.lastPrice >= prev.lastPrice && now.oi <= prev.oi)
//       return { text: "Short Covering", direction: "up", green: true };
//     if (now.lastPrice <= prev.lastPrice && now.oi >= prev.oi)
//       return { text: "Short Buildup", direction: "down", green: false };
//     if (now.lastPrice >= prev.lastPrice && now.oi >= prev.oi)
//       return { text: "Long Buildup", direction: "up", green: true };
//     if (now.lastPrice <= prev.lastPrice && now.oi <= prev.oi)
//       return { text: "Long Unwinding", direction: "down", green: false };
//   }

//   if (now.optionType === "PE") {
//     if (now.lastPrice >= prev.lastPrice && now.oi <= prev.oi)
//       return { text: "Short Covering", direction: "up", green: true };
//     if (now.lastPrice <= prev.lastPrice && now.oi >= prev.oi)
//       return { text: "Short Buildup", direction: "down", green: false };
//     if (now.lastPrice >= prev.lastPrice && now.oi >= prev.oi)
//       return { text: "Long Buildup", direction: "up", green: true };
//     if (now.lastPrice <= prev.lastPrice && now.oi <= prev.oi)
//       return { text: "Long Unwinding", direction: "down", green: false };
//   }
//   // return "-";
// }
// function sortByTimestamp(data) {
//   return data
//     .slice()
//     .sort(
//       (a, b) =>
//         new Date(`1970-01-01 ${b.timestamp}`) -
//         new Date(`1970-01-01 ${a.timestamp}`)
//     );
// }

// function optionIntervalAnalysis(dataArray, intervalMin) {
//   const rows = [];
//   const step = intervalMin / 3;
//   const skip = intervalMin === 3 ? 1 : 0;
//   for (let i = 0; i + step < dataArray.length - skip; i += step) {
//     const prevDoc = dataArray[i];
//     if (intervalMin === 15 && i + step >= dataArray.length - 1) {
//       if (i + step + 1 < dataArray.length) {
//         dataArray[i + step].timestamp = dataArray[i + step + 1].timestamp;
//       }
//     }
//     const nowDoc = dataArray[i + step];
//     const closestStrike = findClosestStrikePrice(
//       nowDoc.strikeData,
//       nowDoc.lastPrice
//     );
//     if (prevDoc.timestamp === nowDoc.timestamp) continue;

//     const nowCE = getCEPEObj(nowDoc.strikeData, closestStrike, "CE");
//     const nowPE = getCEPEObj(nowDoc.strikeData, closestStrike, "PE");
//     const prevCE = getCEPEObj(prevDoc.strikeData, closestStrike, "CE");
//     const prevPE = getCEPEObj(prevDoc.strikeData, closestStrike, "PE");
//     const call = getAnalysis(nowCE, prevCE);
//     const put = getAnalysis(nowPE, prevPE);
//     if (nowCE && nowPE && prevCE && prevPE && call && put) {
//       const callChangePrice =
//         Number(nowCE.lastPrice || 0) - Number(prevCE.lastPrice || 0);
//       const callChangeOI = Number(nowCE.oi || 0) - Number(prevCE.oi || 0);

//       const putChangePrice =
//         Number(nowPE.lastPrice || 0) - Number(prevPE.lastPrice || 0);
//       const putChangeOI = Number(nowPE.oi || 0) - Number(prevPE.oi || 0);
//       // rows.push({
//       //   timeStamp: `${nowDoc.timestamp} - ${prevDoc.timestamp}`,
//       //   strikePrice: closestStrike,
//       //   call,
//       //   put,
//       // });
//       rows.push({
//         timeStamp: `${prevDoc.timestamp} - ${nowDoc.timestamp}`,
//         strikePrice: closestStrike,
//         call: {
//           ...call,
//           lastPriceNow: Number(nowCE.lastPrice || 0),
//           oiNow: Number(nowCE.oi || 0),
//           lastPricePrev: Number(prevCE.lastPrice || 0),
//           oiPrev: Number(prevCE.oi || 0),
//           changePrice: callChangePrice,
//           changeOi: callChangeOI,
//         },
//         put: {
//           ...put,
//           lastPriceNow: Number(nowPE.lastPrice || 0),
//           oiNow: Number(nowPE.oi || 0),
//           lastPricePrev: Number(prevPE.lastPrice || 0),
//           oiPrev: Number(prevPE.oi || 0),
//           changePrice: putChangePrice,
//           changeOi: putChangeOI,
//         },
//         prevTimestamp: prevDoc.timestamp,
//         nowTimestamp: nowDoc.timestamp,
//       });
//     }
//   }
//   if (
//     rows.length > 0 &&
//     (rows[0]?.timeStamp?.split("-")[0]?.trim() != "03:30:00 PM" ||
//       rows[1]?.timeStamp?.split("-")[0]?.trim() != "03:30:00 PM")
//   ) {
//     const firstTimestamp = addMinutesToTimestamp(
//       rows[0]?.timeStamp?.split("-")[0]?.trim()
//     );
//     const secondTimestamp = addMinutesToTimestamp(
//       rows[0]?.timeStamp?.split("-")[1]?.trim()
//     );
//     if (
//       intervalMin === 3 &&
//       isMarketOpen() &&
//       firstTimestamp &&
//       secondTimestamp
//     ) {
//       rows.unshift({
//         timeStamp: `${firstTimestamp} - ${secondTimestamp}`,
//         strikePrice: rows[0].strikePrice,
//         call: rows[0].call,
//         put: rows[0].put,
//       });
//     }
//   }

//   return rows;
// }

// const indexWiseModels = {
//   NIFTY: NiftyOptionChain,
//   BANKNIFTY: BankNiftyOptionChain,
//   FINNIFTY: FinniftyOptionChain,
//   MIDCPNIFTY: MidcpNiftyOptionChain,
//   SENSEX: SensexOptionChain,
// };

// export const getOptionInsiderData = async (req, res) => {
//   try {
//     const { index, expiry, interval } = req.query;
//     const Model = indexWiseModels[index.toUpperCase()];
//     if (!Model)
//       return res.status(400).json({ success: false, message: "Invalid index" });

//     const now = new Date();
//     const startOfToday = new Date(now);
//     startOfToday.setHours(0, 0, 0, 0);

//     const isToday = (date) => {
//       return date >= startOfToday && date <= now;
//     };

//     let docs = await Model.find().lean();
//     if (!docs.length) return res.status(200).json({ success: true, rows: [] });

//     if (isToday(new Date(docs[0].updatedAt))) {
//       const queryObj = {
//         underlyingName: index.toUpperCase(),
//         updatedAt: { $gte: startOfToday, $lte: now },
//       };
//       if (expiry) queryObj.expiry = expiry;
//       docs = await Model.find(queryObj).lean();
//     }
//     const sortedDocs = sortByTimestamp(docs);
//     const rows = optionIntervalAnalysis(sortedDocs, Number(interval));

//     const allExpiries = await Model.distinct("expiry", {
//       underlyingName: index.toUpperCase(),
//     });

//     res.json({
//       success: true,
//       index: index,
//       expiry: expiry,
//       interval: interval,
//       availableExpiries: allExpiries,
//       rows,
//     });
//   } catch (error) {
//     console.error("Error in OptionInsider controller:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// export const getExpiriesByIndex = async (req, res) => {
//   try {
//     const result = {};

//     for (const index in indexWiseModels) {
//       const Model = indexWiseModels[index];
//       const allExpiries = await Model.distinct("expiry", {
//         underlyingName: index,
//       });
//       result[index] = allExpiries;
//     }

//     res.status(200).json({
//       success: true,
//       message: "Expiries for all indices fetched successfully!",
//       expiriesByIndex: result,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

export const getExpiriesByIndex = async (req, res) => {
  try {
    const result = {};
    for (const key in indexWiseModels) {
      const Model = indexWiseModels[key];
      const allExpiries = await Model.distinct("expiry", {
        underlyingName: key,
      });
      result[key] = allExpiries || [];
    }
    res.status(200).json({
      success: true,
      message: "Expiries fetched",
      expiriesByIndex: result,
    });
  } catch (error) {
    console.error("Error fetching expiries:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
