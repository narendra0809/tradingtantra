import {
  BankNiftyOptionChain,
  FinniftyOptionChain,
  NiftyOptionChain,
  MidcpNiftyOptionChain,
  SensexOptionChain,
} from "../models/optionChain.model.js";

function findClosestStrikePrice(strikeData, lastPrice) {
  let closest = null,
    minDiff = Number.MAX_VALUE;
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
function getAnalysis(now, prev) {
  if (!now || !prev) return "-";
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
  return "-";
}
function sortByTimestamp(data) {
  return data
    .slice()
    .sort(
      (a, b) =>
        new Date(`1970-01-01 ${b.timestamp}`) -
        new Date(`1970-01-01 ${a.timestamp}`)
    );
}

function optionIntervalAnalysis(dataArray, intervalMin) {
  const rows = [];
  const step = intervalMin / 3;
  for (let i = 0; i + step < dataArray.length; i++) {
    const prevDoc = dataArray[i];
    const nowDoc = dataArray[i + step];
    const closestStrike = findClosestStrikePrice(
      nowDoc.strikeData,
      nowDoc.lastPrice
    );

    const nowCE = getCEPEObj(nowDoc.strikeData, closestStrike, "CE");
    const nowPE = getCEPEObj(nowDoc.strikeData, closestStrike, "PE");
    const prevCE = getCEPEObj(prevDoc.strikeData, closestStrike, "CE");
    const prevPE = getCEPEObj(prevDoc.strikeData, closestStrike, "PE");
    if (
      prevDoc.timestamp === "9:33:00 AM" ||
      nowDoc.timestamp === "9:36:00 AM"
    ) {
      console.log(prevDoc.timestamp, nowCE, nowPE);
      console.log(nowDoc.timestamp, prevCE, prevPE);
      //   process.exit();
    }
    const call = getAnalysis(nowCE, prevCE);
    const put = getAnalysis(nowPE, prevPE);

    rows.push({
      timeStamp: `${prevDoc.timestamp} - ${nowDoc.timestamp}`,
      strikePrice: closestStrike,
      call,
      put,
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
    const Model = indexWiseModels[index.toUpperCase()];
    if (!Model)
      return res.status(400).json({ success: false, message: "Invalid index" });

    const queryObj = { underlyingName: index.toUpperCase() };
    if (expiry) queryObj.expiry = expiry;

    const docs = await Model.find(queryObj).lean();
    if (!docs.length) return res.status(200).json({ success: true, rows: [] });

    const sortedDocs = sortByTimestamp(docs);
    const rows = optionIntervalAnalysis(sortedDocs, Number(interval));

    const allExpiries = await Model.distinct("expiry", {
      underlyingName: index.toUpperCase(),
    });

    res.json({
      success: true,
      index: index,
      expiry: expiry,
      interval: interval,
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
    const { index } = req.query;
    if (!indexWiseModels[index.toUpperCase()]) {
      return res.status(400).json({ success: false, message: "Invalid index" });
    }
    const Model = indexWiseModels[index.toUpperCase()];
    const allExpiries = await Model.distinct("expiry", {
      underlyingName: index.toUpperCase(),
    });
    res.status(201).json({
      success: true,
      message: "Expiries fetched successfully !",
      expiries: allExpiries,
    });
  } catch (error) {
    console.error(error);
  }
};
