import { getModelForUnderlying } from "../controllers/OptionDataController.js";
import { convertTo12HourFormat } from "../utils/dateUtils.js";

export const buildOptionClockPayload = async ({
  index,
  expiry,
  startTime,
  endTime,
}) => {
  try {
    const indexMap = {
      Nifty50: "NIFTY",
      BankNifty: "BANKNIFTY",
      FinNifty: "FINNIFTY",
      Midcap: "MIDCPNIFTY",
      Sensex: "SENSEX",
    };

    const apiIndex = indexMap[index];
    if (!apiIndex) {
      throw new Error(`Invalid index: ${index}`);
    }

    const data = await getModelForUnderlying(apiIndex).find({
      expiry: expiry,
    });
    const optionData = data || [];

    const marketStartTime = convertTo12HourFormat(startTime) || "9:15:00 AM";
    const marketEndTime = convertTo12HourFormat(endTime) || "3:30:00 PM";

    const startTimeData = optionData.find(
      (data) => data.expiry === expiry && data.timestamp === marketStartTime
    );

    const endTimeData = optionData.find(
      (data) => data.expiry === expiry && data.timestamp === marketEndTime
    );

    if (!startTimeData || !endTimeData) {
      throw new Error("Market start or end time data not available");
    }

    // Calculate total OI for both times
    const { totalOiCE: totalOiCEStart, totalOiPE: totalOiPEStart } =
      getTotalOi(startTimeData);
    const { totalOiCE: totalOiCEEnd, totalOiPE: totalOiPEEnd } =
      getTotalOi(endTimeData);

    const processedData = processData(startTimeData, endTimeData, index);

    // Calculate total OI changes
    const totalOiChanges = getTotalOIChange(processedData);

    // Calculate total OI divided by lot size
    const lotSizeMap = {
      Nifty50: 25,
      BankNifty: 15,
      FinNifty: 25,
      Midcap: 75,
      Sensex: 10,
    };
    const lotSizeValue = lotSizeMap[index] || 25;

    const totalOi = {
      totalOiCE: (totalOiCEEnd / lotSizeValue).toFixed(0),
      totalOiPE: (totalOiPEEnd / lotSizeValue).toFixed(0),
    };

    const latestData = endTimeData;
    const currentStrike = findClosestStrike(
      latestData.strikeData,
      latestData.lastPrice
    );

    return {
      currData: processedData,
      totalOiChanges,
      totalOi,
      currentStrike,
      selectedIndex: index,
      selectedExpiry: expiry,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error building option clock payload:", error);
    throw error;
  }
};

const getTotalOi = (data) => {
  let totalOiCE = 0;
  let totalOiPE = 0;
  data.strikeData.forEach((strike) => {
    if (strike.optionType === "CE") {
      totalOiCE += strike.oi;
    } else {
      totalOiPE += strike.oi;
    }
  });
  return { totalOiCE, totalOiPE };
};

const processData = (startTime, endTime, selectedIndex) => {
  if (!startTime || !endTime) return [];

  const createStrikeMap = (data) => {
    const map = {};
    data.strikeData.forEach((strike) => {
      const key = `${strike.strikePrice}-${strike.optionType}`;
      map[key] = strike;
    });
    return map;
  };

  const startTimeMap = createStrikeMap(startTime);
  const endTimeMap = createStrikeMap(endTime);

  const mergedMap = new Map();
  const allKeys = new Set([
    ...Object.keys(startTimeMap),
    ...Object.keys(endTimeMap),
  ]);

  allKeys.forEach((key) => {
    const [strikePrice, optionType] = key.split("-");
    const price = parseFloat(strikePrice);

    const morning = startTimeMap[key];
    const evening = endTimeMap[key];

    if (!morning || !evening) return;

    const lotSizeMap = {
      Nifty50: 25,
      BankNifty: 15,
      FinNifty: 25,
      Midcap: 75,
      Sensex: 10,
    };
    const lotSizeValue = lotSizeMap[selectedIndex] || 25;

    const oiChange = (evening.oi - morning.oi) / lotSizeValue;
    const priceChange = evening.lastPrice - morning.lastPrice;

    const mapKey = price;
    if (!mergedMap.has(mapKey)) {
      mergedMap.set(mapKey, {
        strikePrice: price,
        oiChangeCE: 0,
        oiChangePE: 0,
        priceChangeCE: 0,
        priceChangePE: 0,
      });
    }

    const existing = mergedMap.get(mapKey);

    if (optionType === "CE") {
      existing.oiChangeCE = oiChange;
      existing.priceChangeCE = priceChange;
    } else {
      existing.oiChangePE = oiChange;
      existing.priceChangePE = priceChange;
    }

    mergedMap.set(mapKey, existing);
  });

  return Array.from(mergedMap.values()).sort(
    (a, b) => a.strikePrice - b.strikePrice
  );
};

const getTotalOIChange = (processedData) => {
  let TotalOiChangeCE = 0;
  let TotalOiChangePE = 0;
  processedData.forEach((data) => {
    TotalOiChangeCE += data.oiChangeCE;
    TotalOiChangePE += data.oiChangePE;
  });

  return {
    TotalOiChangeCE: TotalOiChangeCE.toFixed(2),
    TotalOiChangePE: TotalOiChangePE.toFixed(2),
  };
};

const findClosestStrike = (strikeData, lastPrice) => {
  let closest = strikeData[0]?.strikePrice ?? null;
  let minDiff =
    closest === null ? Number.MAX_VALUE : Math.abs(closest - lastPrice);

  for (const obj of strikeData) {
    const diff = Math.abs(obj.strikePrice - lastPrice);
    if (diff < minDiff) {
      closest = obj.strikePrice;
      minDiff = diff;
    }
  }
  return closest;
};
