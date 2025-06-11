import FiveMinCandles from "../../models/fiveMinCandles.model.js";
import HighLowReversal from "../../models/highLowReversal.model.js";
import MarketDetailData from "../../models/marketData.model.js";
import StocksDetail from "../../models/stocksDetail.model.js";

export const dayHighLowReversal = async () => {
  try {
    // Helper function to convert string timestamp to Unix seconds
    function parseTimestamp(timestampStr) {
      const formattedStr = timestampStr.replace(
        /(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2} [ap]m)/i,
        "$3-$2-$1 $4"
      );
      const date = new Date(Date.parse(formattedStr));
      return isNaN(date.getTime()) ? null : Math.floor(date.getTime() / 1000);
    }

    // Get the latest trading day
    const latestTradingDay = await MarketDetailData.aggregate([
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);

    if (!latestTradingDay || latestTradingDay.length === 0) {
      return { success: false, message: "No trading data found" };
    }

    const latestDate = latestTradingDay[0]._id;

    // Get the previous trading day
    const previousTradingDay = await MarketDetailData.aggregate([
      { $match: { date: { $lt: latestDate } } },
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);

    const previousDate = previousTradingDay[0]?._id;

    // Fetch stock data
    const [stockData, previousStockData] = await Promise.all([
      MarketDetailData.find(
        { date: latestDate },
        {
          securityId: 1,
          "data.dayOpen": 1,
          "data.dayClose": 1,
          "data.dayHigh": 1,
          "data.dayLow": 1,
          "data.latestTradedPrice": 1,
          date: 1,
          _id: 0,
        }
      ),
      previousDate
        ? MarketDetailData.find(
            { date: previousDate },
            {
              securityId: 1,
              "data.dayClose": 1,
              date: 1,
              _id: 0,
            }
          )
        : [],
    ]);

    if (!stockData || stockData.length === 0) {
      return {
        success: false,
        message: "No stock data found for the latest date",
      };
    }

    // Fetch stock details
    const stockDetails = await StocksDetail.find(
      {},
      { SECURITY_ID: 1, SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1 }
    );

    if (!stockDetails) {
      return { success: false, message: "No stocks info found" };
    }

    const stockDetailsMap = new Map();
    stockDetails.forEach((item) => {
      stockDetailsMap.set(item.SECURITY_ID, {
        symbolName: item.SYMBOL_NAME || "N/A",
        underlyingSymbol: item.UNDERLYING_SYMBOL || "N/A",
      });
    });

    const securityIds = stockData.map((item) => item.securityId);
    const stockDataMap = new Map();
    stockData.forEach((item) => {
      stockDataMap.set(item.securityId, {
        securityId: item.securityId,
        dayOpen: item.data?.dayOpen?.[0] || 0,
        dayClose: item.data?.dayClose?.[0] || 0,
        dayHigh: item.data?.dayHigh?.[0] || 0,
        dayLow: item.data?.dayLow?.[0] || 0,
        date: item.date,
        latestTradedPrice: item.data?.latestTradedPrice?.[0] || 0,
      });
    });

    const previousStockDataMap = new Map();
    previousStockData.forEach((item) => {
      previousStockDataMap.set(item.securityId, {
        dayClose: item.data?.dayClose?.[0] || 0,
      });
    });

    const responseData = [];

    // Process each security
    for (const securityId of securityIds) {
      const candleData = await FiveMinCandles.findOne({ securityId }).lean();

      if (!candleData || !candleData.high || candleData.high.length < 5) {
        continue;
      }

      const stockInfo = stockDataMap.get(securityId);
      const stocksDetail = stockDetailsMap.get(securityId);
      const previousDayData = previousStockDataMap.get(securityId);

      if (
        !stockInfo ||
        !stocksDetail ||
        !stockInfo.dayHigh ||
        !stockInfo.dayLow
      ) {
        continue;
      }

      // Convert and sort timestamps
      const timestamps = candleData.timestamp
        .map((ts, index) => ({ ts: parseTimestamp(ts), index }))
        .filter((item) => item.ts !== null)
        .sort((a, b) => b.ts - a.ts)
        .slice(0, 5)
        .sort((a, b) => a.ts - b.ts);

      if (timestamps.length < 5) {
        continue;
      }

      const lastFiveIndices = timestamps.map((item) => item.index);
      const lastFiveCandles = {
        timestamp: lastFiveIndices.map((i) => candleData.timestamp[i]),
        open: lastFiveIndices.map((i) => candleData.open[i]),
        close: lastFiveIndices.map((i) => candleData.close[i]),
        high: lastFiveIndices.map((i) => candleData.high[i]),
        low: lastFiveIndices.map((i) => candleData.low[i]),
      };

      const dayHigh = stockInfo.dayHigh;
      const dayLow = stockInfo.dayLow;
      const highThreshold = dayHigh * 0.9975;
      const lowThreshold = dayLow * 1.0025;
      const latestTradedPrice = stockInfo.latestTradedPrice;
      const previousDayClose = previousDayData?.dayClose || 0;
      const percentageChange =
        latestTradedPrice && previousDayClose
          ? (
              ((latestTradedPrice - previousDayClose) / previousDayClose) *
              100
            ).toFixed(2)
          : 0;

      // Last candle (15:25)
      const lastIndex = 4;
      const candleOpen = lastFiveCandles.open[lastIndex];
      const candleClose = lastFiveCandles.close[lastIndex];
      const candleHigh = lastFiveCandles.high[lastIndex];
      const candleLow = lastFiveCandles.low[lastIndex];
      const candleTimestamp = lastFiveCandles.timestamp[lastIndex];

      const isRedCandle = candleOpen > candleClose;
      const isGreenCandle = candleOpen < candleClose;

      const candleDataFields = {
        rangeHigh: dayHigh,
        rangeLow: dayLow,
        secondCandle: {
          open: lastFiveCandles.open[1],
          close: lastFiveCandles.close[1],
        },
        thirdCandle: {
          open: lastFiveCandles.open[2],
          close: lastFiveCandles.close[2],
        },
        fourthCandle: {
          open: lastFiveCandles.open[3],
          close: lastFiveCandles.close[3],
        },
      };

      // Bearish reversal
      if (candleHigh >= highThreshold && isRedCandle) {
        responseData.push({
          securityId,
          symbolName: stocksDetail.symbolName,
          underlyingSymbol: stocksDetail.underlyingSymbol,
          type: "Bearish",
          reversalPrice: candleClose,
          timestamp: candleTimestamp,
          percentageChange: parseFloat(percentageChange),
          date: latestDate,
          ...candleDataFields,
          updatedAt: new Date(),
        });
      }
      // Bullish reversal
      else if (candleLow <= lowThreshold && isGreenCandle) {
        responseData.push({
          securityId,
          symbolName: stocksDetail.symbolName,
          underlyingSymbol: stocksDetail.underlyingSymbol,
          type: "Bullish",
          reversalPrice: candleClose,
          timestamp: candleTimestamp,
          percentageChange: parseFloat(percentageChange),
          date: latestDate,
          ...candleDataFields,
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
        await HighLowReversal.bulkWrite(bulkOps);
        console.log(
          `[MongoDB] Reversal signals saved or updated for HighLowReversal`
        );
      } catch (dbError) {
        console.error(
          `[MongoDB] Error saving reversal signals: ${dbError.message}`
        );
      }
    }

    // Fetch final data
    const data = await HighLowReversal.find(
      {},
      {
        securityId: 1,
        symbolName: 1,
        underlyingSymbol: 1,
        type: 1,
        timestamp: 1,
        reversalPrice: 1,
        percentageChange: 1,
        date: 1,
        rangeHigh: 1,
        rangeLow: 1,
        secondCandle: 1,
        thirdCandle: 1,
        fourthCandle: 1,
        _id: 0,
      }
    )
      .sort({ updatedAt: -1 })
      .lean();

    return {
      success: true,
      message:
        responseData.length > 0
          ? "Day High Low Reversal analysis complete"
          : "No reversals detected",
      data,
    };
  } catch (error) {
    console.error(`[Main] Error in DayHighLowReversal: ${error.message}`);
    return { success: false, message: error.message };
  }
};
