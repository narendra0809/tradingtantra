// import {
//   BankNiftyOptionChain,
//   FinniftyOptionChain,
//   NiftyOptionChain,
//   MidcpNiftyOptionChain,
//   SensexOptionChain,
// } from "../models/optionChain.model.js";

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
//   if (!now || !prev) return "-";
//   if (now.optionType === "CE") {
//     if (now.lastPrice > prev.lastPrice && now.oi < prev.oi)
//       return { text: "Buyers INT", direction: "up", green: true };
//     if (now.lastPrice < prev.lastPrice && now.oi > prev.oi)
//       return { text: "Buyers INT", direction: "down", green: false };
//     return { text: "Confusion", direction: null, green: false, yellow: true };
//   }
//   if (now.optionType === "PE") {
//     if (now.lastPrice > prev.lastPrice && now.oi < prev.oi)
//       return { text: "Sellers INT", direction: "up", green: true };
//     if (now.lastPrice < prev.lastPrice && now.oi > prev.oi)
//       return { text: "Sellers INT", direction: "down", green: false };
//     return { text: "Confusion", direction: null, green: false, yellow: true };
//   }
//   return "-";
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
//   for (let i = 0; i + step < dataArray.length; i++) {
//     const prevDoc = dataArray[i];
//     const nowDoc = dataArray[i + step];
//     const closestStrike = findClosestStrikePrice(
//       nowDoc.strikeData,
//       nowDoc.lastPrice
//     );

//     const nowCE = getCEPEObj(nowDoc.strikeData, closestStrike, "CE");
//     const nowPE = getCEPEObj(nowDoc.strikeData, closestStrike, "PE");
//     const prevCE = getCEPEObj(prevDoc.strikeData, closestStrike, "CE");
//     const prevPE = getCEPEObj(prevDoc.strikeData, closestStrike, "PE");
//     if (
//       prevDoc.timestamp === "9:33:00 AM" ||
//       nowDoc.timestamp === "9:36:00 AM"
//     ) {
//       console.log(prevDoc.timestamp, nowCE, nowPE);
//       console.log(nowDoc.timestamp, prevCE, prevPE);
//       //   process.exit();
//     }
//     const call = getAnalysis(nowCE, prevCE);
//     const put = getAnalysis(nowPE, prevPE);

//     rows.push({
//       timeStamp: `${prevDoc.timestamp} - ${nowDoc.timestamp}`,
//       strikePrice: closestStrike,
//       call,
//       put,
//     });
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

//     const queryObj = { underlyingName: index.toUpperCase() };
//     if (expiry) queryObj.expiry = expiry;

//     const docs = await Model.find(queryObj).lean();
//     if (!docs.length) return res.status(200).json({ success: true, rows: [] });

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
//     const { index } = req.query;
//     if (!indexWiseModels[index.toUpperCase()]) {
//       return res.status(400).json({ success: false, message: "Invalid index" });
//     }
//     const Model = indexWiseModels[index.toUpperCase()];
//     const allExpiries = await Model.distinct("expiry", {
//       underlyingName: index.toUpperCase(),
//     });
//     res.status(201).json({
//       success: true,
//       message: "Expiries fetched successfully !",
//       expiries: allExpiries,
//     });
//   } catch (error) {
//     console.error(error);
//   }
// };
import {
  BankNiftyOptionChain,
  FinniftyOptionChain,
  NiftyOptionChain,
  MidcpNiftyOptionChain,
  SensexOptionChain,
} from "../models/optionChain.model.js";

/* --------------------- Time Helpers --------------------- */
function parseTimeToMinutes(ts) {
  const [time, ampmRaw] = ts.trim().split(" ");
  let [hh, mm] = time.split(":").map(Number);
  const ampm = (ampmRaw || "").toUpperCase();
  if (ampm === "PM" && hh !== 12) hh += 12;
  if (ampm === "AM" && hh === 12) hh = 0;
  return hh * 60 + mm;
}

function minutesToTimeString(mins) {
  let hh = Math.floor(mins / 60) % 24;
  const mm = mins % 60;
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12;
  if (hh === 0) hh = 12;
  const pad = (n) => String(n).padStart(2, "0");
  return `${hh}:${pad(mm)}:00 ${ampm}`;
}

/* ------------------ Utility Functions ------------------ */
function sortByTimestampAsc(docs) {
  return docs.slice().sort((a, b) => parseTimeToMinutes(a.timestamp) - parseTimeToMinutes(b.timestamp));
}

function findClosestStrikePrice(strikeData, lastPrice) {
  let closest = null, minDiff = Number.MAX_VALUE;
  for (const d of strikeData || []) {
    const diff = Math.abs(d.strikePrice - lastPrice);
    if (diff < minDiff) {
      closest = d.strikePrice;
      minDiff = diff;
    }
  }
  return closest;
}

function getCEPEObj(strikeData, strikePrice, optionType) {
  return (strikeData || []).find(
    (el) => el.strikePrice === strikePrice && el.optionType === optionType
  );
}

/* ---------------- Session Grid ---------------- */
const SESSION_START = 9 * 60 + 15;   // 9:15
const SESSION_END   = 15 * 60 + 30;  // 15:30

function buildGrid(stepMinutes) {
  const arr = [];
  for (let t = SESSION_START; t <= SESSION_END; t += stepMinutes) arr.push(t);
  return arr;
}

/* ---------------- Analysis Logic ---------------- */
function getAnalysis(now, prev) {
  if (!now || !prev) return { text: "Confusion", direction: null, green: false, yellow: true };

  if (now.optionType === "CE") {
    if (now.lastPrice > prev.lastPrice && now.oi < prev.oi)
      return { text: "Buyers INT", direction: "up", green: true };
    if (now.lastPrice < prev.lastPrice && now.oi > prev.oi)
      return { text: "Buyers INT", direction: "down", green: false };
    return { text: "Confusion", direction: null, green: false, yellow: true };
  }

  if (now.optionType === "PE") {
    if (now.lastPrice > prev.lastPrice && now.oi < prev.oi)
      return { text: "Sellers INT", direction: "up", green: true };
    if (now.lastPrice < prev.lastPrice && now.oi > prev.oi)
      return { text: "Sellers INT", direction: "down", green: false };
    return { text: "Confusion", direction: null, green: false, yellow: true };
  }

  return { text: "Confusion", direction: null, green: false, yellow: true };
}

/* ---------------- Helper: Snapshot Lookup ---------------- */
function indexDocs(docs) {
  const arr = docs.map((d) => ({ m: parseTimeToMinutes(d.timestamp), doc: d }));
  return { minutes: arr.map((x) => x.m), docs: arr.map((x) => x.doc) };
}

function findDocAtOrBefore(minutesArr, docsArr, targetMinute) {
  let idx = -1;
  for (let i = 0; i < minutesArr.length; i++) {
    if (minutesArr[i] <= targetMinute) idx = i;
    else break;
  }
  return idx >= 0 ? docsArr[idx] : null;
}

/* ---------------- Main Window Analysis ---------------- */
function optionIntervalAnalysisFixed(docsAsc, intervalMin) {
  const rows = [];
  const step = intervalMin;
  const grid = buildGrid(step);
  const { minutes, docs } = indexDocs(docsAsc);

  for (let i = 0; i + 1 < grid.length; i++) {
    const startM = grid[i];
    const endM = grid[i + 1];

    // Previous candle (price at startM, OI 3m lag)
    const prevDoc = findDocAtOrBefore(minutes, docs, startM);
    // Current candle (price at endM, OI 3m lag)
    const currDoc = findDocAtOrBefore(minutes, docs, endM);

    if (!prevDoc || !currDoc) {
      rows.push({
        timeStamp: `${minutesToTimeString(startM)} - ${minutesToTimeString(endM)}`,
        strikePrice: "-",
        call: { text: "Confusion", direction: null, green: false, yellow: true },
        put:  { text: "Confusion", direction: null, green: false, yellow: true },
      });
      continue;
    }

    // --- Adjust OI lag (each entry’s OI = +3 min snapshot if available) ---
    const currLagDoc = findDocAtOrBefore(minutes, docs, endM + 3) || currDoc;
    const prevLagDoc = findDocAtOrBefore(minutes, docs, startM + 3) || prevDoc;

    // --- Compare only same strike ---
    const strikeList = (currLagDoc.strikeData || []).map((s) => s.strikePrice);
    const results = [];

    for (const strike of strikeList) {
      const nowCE  = getCEPEObj(currLagDoc.strikeData, strike, "CE");
      const prevCE = getCEPEObj(prevLagDoc.strikeData, strike, "CE");
      const nowPE  = getCEPEObj(currLagDoc.strikeData, strike, "PE");
      const prevPE = getCEPEObj(prevLagDoc.strikeData, strike, "PE");

      if (nowCE && prevCE && nowPE && prevPE) {
        const call = getAnalysis(nowCE, prevCE);
        const put  = getAnalysis(nowPE, prevPE);

        results.push({
          strikePrice: strike,
          call,
          put,
        });
      }
    }

    // --- Use ATM strike as main row reference ---
    const closestStrike = findClosestStrikePrice(currLagDoc.strikeData, currLagDoc.lastPrice);
    const matched = results.find((r) => r.strikePrice === closestStrike);

    rows.push({
      timeStamp: `${minutesToTimeString(startM)} - ${minutesToTimeString(endM)}`,
      strikePrice: closestStrike || "-",
      call: matched ? matched.call : { text: "Confusion", direction: null, green: false, yellow: true },
      put:  matched ? matched.put  : { text: "Confusion", direction: null, green: false, yellow: true },
    });
  }

  return rows;
}

/* ---------------- Model Mapping ---------------- */
const indexWiseModels = {
  NIFTY: NiftyOptionChain,
  BANKNIFTY: BankNiftyOptionChain,
  FINNIFTY: FinniftyOptionChain,
  MIDCPNIFTY: MidcpNiftyOptionChain,
  SENSEX: SensexOptionChain,
};

/* ---------------- Controller ---------------- */
export const getOptionInsiderData = async (req, res) => {
  try {
    const { index, expiry, interval } = req.query;
    const intervalMin = Number(interval || 3);

    const Model = indexWiseModels[(index || "").toUpperCase()];
    if (!Model)
      return res.status(400).json({ success: false, message: "Invalid index" });

    const queryObj = { underlyingName: (index || "").toUpperCase() };
    if (expiry) queryObj.expiry = expiry;

    const docs = await Model.find(queryObj).lean();
    if (!docs.length)
      return res.status(200).json({ success: true, rows: [] });

    const sortedDocs = sortByTimestampAsc(docs);
    const rows = optionIntervalAnalysisFixed(sortedDocs, intervalMin);

    const allExpiries = await Model.distinct("expiry", {
      underlyingName: (index || "").toUpperCase(),
    });

    res.json({
      success: true,
      rows,
      meta: { index, expiry, interval: intervalMin },
      availableExpiries: allExpiries,
    });
  } catch (error) {
    console.error("Error in OptionInsider controller:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getExpiriesByIndex = async (req, res) => {
  try {
    const { index } = req.query;
    const key = (index || "").toUpperCase();
    if (!indexWiseModels[key])
      return res.status(400).json({ success: false, message: "Invalid index" });

    const Model = indexWiseModels[key];
    const expiries = await Model.distinct("expiry", {
      underlyingName: key,
    });

    res.status(200).json({
      success: true,
      message: "Expiries fetched successfully!",
      expiries,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
