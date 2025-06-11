import FiveMinCandles from "../../models/fiveMinCandles.model.js";
import MarketDetailData from "../../models/marketData.model.js";
import StocksDetail from "../../models/stocksDetail.model.js";
import TwoDayHighLowBreak from "../../models/twoDayHighLowBreak.model.js";

export const twoDayHLBreak = async () => {
  try {
    // Get the latest 3 unique trading days
    const uniqueTradingDays = await MarketDetailData.aggregate([
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } },
      { $limit: 3 },
    ]);

    if (!uniqueTradingDays || uniqueTradingDays.length < 3) {
      return { success: false, message: "Not enough historical data found" };
    }

    const latestDate = uniqueTradingDays[0]._id;
    const firstPrevTargetDate = uniqueTradingDays[1]._id;
    const secondPrevTargetDate = uniqueTradingDays[2]._id;

    // Fetch stock data
    const [currentStockData, firstPrevStockData, secondPrevStockData] =
      await Promise.all([
        MarketDetailData.find(
          { date: latestDate },
          {
            securityId: 1,
            "data.latestTradedPrice": 1,
            date: 1,
            _id: 0,
          }
        ),
        MarketDetailData.find(
          { date: firstPrevTargetDate },
          {
            securityId: 1,
            "data.dayHigh": 1,
            "data.dayLow": 1,
            date: 1,
            _id: 0,
          }
        ),
        MarketDetailData.find(
          { date: secondPrevTargetDate },
          {
            securityId: 1,
            "data.dayHigh": 1,
            "data.dayLow": 1,
            "data.dayClose": 1,
            date: 1,
            _id: 0,
          }
        ),
      ]);

    if (
      !currentStockData.length ||
      !firstPrevStockData.length ||
      !secondPrevStockData.length
    ) {
      return {
        success: false,
        message: "No stock data found for the selected dates",
      };
    }

    // Create maps
    const securityIds = currentStockData.map((item) => item.securityId);
    const currentStockDataMap = new Map();
    currentStockData.forEach((item) => {
      currentStockDataMap.set(item.securityId, {
        securityId: item.securityId,
        latestTradedPrice: item.data?.latestTradedPrice?.[0] || 0,
        date: item.date,
      });
    });

    const firstPrevStockDataMap = new Map();
    firstPrevStockData.forEach((item) => {
      firstPrevStockDataMap.set(item.securityId, {
        securityId: item.securityId,
        dayHigh: item.data?.dayHigh?.[0] || 0,
        dayLow: item.data?.dayLow?.[0] || 0,
        date: item.date,
      });
    });

    const secondPrevStockDataMap = new Map();
    secondPrevStockData.forEach((item) => {
      secondPrevStockDataMap.set(item.securityId, {
        securityId: item.securityId,
        dayHigh: item.data?.dayHigh?.[0] || 0,
        dayLow: item.data?.dayLow?.[0] || 0,
        dayClose: item.data?.dayClose?.[0] || 0,
        date: item.date,
      });
    });

    // Fetch stock details
    const stockDetails = await StocksDetail.find(
      {},
      { SECURITY_ID: 1, SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1 }
    );
    if (!stockDetails.length) {
      return { success: false, message: "No stock details found" };
    }
    const stockDetailsMap = new Map();
    stockDetails.forEach((item) => {
      stockDetailsMap.set(item.SECURITY_ID, {
        symbolName: item.SYMBOL_NAME || "N/A",
        underlyingSymbol: item.UNDERLYING_SYMBOL || "N/A",
      });
    });

    const responseData = [];

    // Process each security
    for (const securityId of securityIds) {
      const existingBreak = await TwoDayHighLowBreak.findOne({
        securityId,
        date: latestDate,
        type: { $in: ["Bullish", "Bearish"] },
      });
      if (existingBreak) {
        continue;
      }

      const candleData = await FiveMinCandles.findOne({ securityId }).lean();
      if (!candleData || !candleData.high || candleData.high.length === 0) {
        continue;
      }

      const currentDayData = currentStockDataMap.get(securityId);
      const firstPrevDayData = firstPrevStockDataMap.get(securityId);
      const secondPrevDayData = secondPrevStockDataMap.get(securityId);
      const stocksDetail = stockDetailsMap.get(securityId);

      if (
        !currentDayData ||
        !firstPrevDayData ||
        !secondPrevDayData ||
        !stocksDetail
      ) {
        continue;
      }

      // Calculate 2-day high/low
      const firstPrevDayHigh = firstPrevDayData.dayHigh;
      const firstPrevDayLow = firstPrevDayData.dayLow;
      const secondPrevDayHigh = secondPrevDayData.dayHigh;
      const secondPrevDayLow = secondPrevDayData.dayLow;
      const secondPrevDayClose = secondPrevDayData.dayClose;
      const latestTradedPrice = currentDayData.latestTradedPrice;

      if (
        !firstPrevDayHigh ||
        !firstPrevDayLow ||
        !secondPrevDayHigh ||
        !secondPrevDayLow
      ) {
        continue;
      }

      const maxHigh = Math.max(firstPrevDayHigh, secondPrevDayHigh);
      const minLow = Math.min(firstPrevDayLow, secondPrevDayLow);
      const highThreshold = maxHigh * 1.01;
      const lowThreshold = minLow * 0.99;

      // Last candle
      const lastIndex = candleData.high.length - 1;
      const candleClose = candleData.close[lastIndex];
      const candleTimestamp = candleData.timestamp[lastIndex];

      // Bullish break
      if (candleClose > highThreshold) {
        responseData.push({
          securityId,
          symbolName: stocksDetail.symbolName,
          underlyingSymbol: stocksDetail.underlyingSymbol,
          type: "Bullish",
          breakPrice: candleClose,
          maxHigh,
          timestamp: candleTimestamp,
          percentageChange: parseFloat(
            (
              ((latestTradedPrice - secondPrevDayClose) / secondPrevDayClose) *
              100
            ).toFixed(2)
          ),
          date: latestDate,
          updatedAt: new Date(),
        });
      }
      // Bearish break
      else if (candleClose < lowThreshold) {
        responseData.push({
          securityId,
          symbolName: stocksDetail.symbolName,
          underlyingSymbol: stocksDetail.underlyingSymbol,
          type: "Bearish",
          breakPrice: candleClose,
          minLow,
          timestamp: candleTimestamp,
          percentageChange: parseFloat(
            (
              ((latestTradedPrice - secondPrevDayClose) / secondPrevDayClose) *
              100
            ).toFixed(2)
          ),
          date: latestDate,
          updatedAt: new Date(),
        });
      }
    }

    // Store results
    if (responseData.length > 0) {
      const bulkOps = responseData.map((item) => ({
        updateOne: {
          filter: {
            securityId: item.securityId,
            // date: item.date,
            // type: item.type,
          },
          update: { $set: item },
          upsert: true,
        },
      }));
      try {
        await TwoDayHighLowBreak.bulkWrite(bulkOps);
        console.log(
          `[MongoDB] Break signals saved or updated for TwoDayHighLowBreak`
        );
      } catch (dbError) {
        console.error(
          `[MongoDB] Error saving break signals: ${dbError.message}`
        );
      }
    }

    // Fetch final data
    const data = await TwoDayHighLowBreak.find(
      {},
      {
        securityId: 1,
        symbolName: 1,
        underlyingSymbol: 1,
        type: 1,
        timestamp: 1,
        breakPrice: 1,
        percentageChange: 1,
        date: 1,
        _id: 0,
      }
    )
      .sort({ updatedAt: -1 })
      .lean();

    return {
      success: true,
      message:
        responseData.length > 0
          ? "Two Day High Low Break analysis complete"
          : "No breakouts detected",
      data,
    };
  } catch (error) {
    console.error(`[Main] Error in twoDayHLBreak: ${error.message}`);
    return { success: false, message: error.message };
  }
};
