import FiveMinCandles from "./src/models/fiveMinCandles.model.js";
import MarketDetailData from "./src/models/marketData.model.js";
import MomentumStockFiveMin from "./src/models/momentumStockFiveMin.model.js";
import StocksDetail from "./src/models/stocksDetail.model.js";

export const AIMomentumCatcherFiveMins = async (req, res) => {
  try {
    // Fetch stock details (216 stocks)
    const stocks = await StocksDetail.find(
      {},
      { SECURITY_ID: 1, SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1, _id: 0 }
    );
    if (!stocks || stocks.length === 0) {
      console.error("No stocks found in StocksDetail collection");
      return { message: "No stocks data found" };
    }


    // Create stock mapping
    const stockMap = new Map();
    stocks.forEach((entry) => {
      if (!entry.SECURITY_ID || !entry.SYMBOL_NAME) {
        console.warn(`Invalid stock entry: ${JSON.stringify(entry)}`);
      }
      stockMap.set(entry.SECURITY_ID, {
        UNDERLYING_SYMBOL: entry.UNDERLYING_SYMBOL, // Corrected typo
        SYMBOL_NAME: entry.SYMBOL_NAME,
      });
    });

    // Get latest and previous trading day
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date");

    if (!latestEntry) {
      console.error("No market data found in MarketDetailData");
      return { message: "No stock data available" };
    }

    const latestDate = latestEntry.date;
    const latestData = await MarketDetailData.find({ date: latestDate });

    if (latestData.length === 0) {
      console.error(`No market data found for date: ${latestDate}`);
      return { message: "No stock data available for the latest date" };
    }

    const previousDayEntry = await MarketDetailData.findOne(
      { date: { $lt: latestDate } },
      { date: 1 }
    ).sort({ date: -1 });

    if (!previousDayEntry) {
      console.error("No previous day data found in MarketDetailData");
      return { message: "No previous stock data available" };
    }

    const previousDayDate = previousDayEntry.date;
    const yesterdayData = await MarketDetailData.find({
      date: previousDayDate,
    });

    // Map latest and previous day data
    const securityIds = [];
    const latestDataMap = new Map();
    latestData.forEach((entry) => {
      securityIds.push(entry.securityId);
      latestDataMap.set(
        entry.securityId,
        entry.data?.latestTradedPrice?.[0] || 0
      );
    });

    const yesterdayMap = new Map();
    yesterdayData.forEach((entry) => {
      yesterdayMap.set(entry.securityId, entry.data?.dayClose?.[0] || 0);
    });

    const updatedData = [];
    for (const securityId of securityIds) {
      // Fetch 5-minute candle data
      const data = await FiveMinCandles.findOne({ securityId }).lean();

      if (!data || !data.open || !data.close || data.timestamp.length < 2) {
        console.warn(`No valid candle data for securityId: ${securityId}`);
        continue;
      }

      // Get the last two candles (3:20 PM and 3:25 PM)
      const lastCandle = {
        high: data.high[data.high.length - 1],
        low: data.low[data.low.length - 1],
        close: data.close[data.close.length - 1],
        open: data.open[data.open.length - 1],
        timestamp: data.timestamp[data.timestamp.length - 1],
      };

      const secondLastCandle = {
        high: data.high[data.high.length - 2],
        low: data.low[data.low.length - 2],
        close: data.close[data.close.length - 2],
        open: data.open[data.open.length - 2],
        timestamp: data.timestamp[data.timestamp.length - 2],
      };

      // Calculate current candle body and previous candle range
      const currentBody = Math.abs(lastCandle.close - lastCandle.open);
      const previousRange = secondLastCandle.high - secondLastCandle.low;

      updatedData.push({
        securityId,
        timestamp: [secondLastCandle.timestamp, lastCandle.timestamp],
        open: [secondLastCandle.open, lastCandle.open],
        high: [secondLastCandle.high, lastCandle.high],
        low: [secondLastCandle.low, lastCandle.low],
        close: [secondLastCandle.close, lastCandle.close],
        currentBody,
        previousRange,
      });
    }

    if (updatedData.length === 0) {
      console.warn("No recent candle data found in FiveMinCandles");
      const updatedDataFromDB = await MomentumStockFiveMin.find(
        {},
        {
          securityId: 1,
          symbol_name: 1,
          symbol: 1,
          momentumType: 1,
          timestamp: 1,
          percentageChange: 1,
          previousHigh: 1,
          previousLow: 1,
          previousOpen: 1,
          previousClose: 1,
          currentOpen: 1,
          currentClose: 1,
          _id: 0,
        }
      ).sort({ updatedAt: -1 });
      return {
        message:
          "No recent candle data found, returning existing momentum stocks",
        updatedData: updatedDataFromDB.slice(0, 20),
      };
    }

    const momentumStocks = updatedData
      .map((entry) => {
        const [preHigh, crrHigh] = entry.high;
        const [preLow, crrLow] = entry.low;
        const [preClose, crrClose] = entry.close;
        const [preOpen, crrOpen] = entry.open;
        const latestTimestamp = entry.timestamp[1];

        // Momentum condition: 3:25 PM body >= double 3:20 PM range
        const hasMomentum =
          Number(entry.currentBody.toFixed(4)) >=
            Number((entry.previousRange * 2).toFixed(4)) &&
          entry.previousRange > 0.1;

        const isBullish = crrClose > crrOpen;
        const isBearish = crrClose < crrOpen;

        if (hasMomentum && (isBullish || isBearish)) {
          const stockDetails = stockMap.get(entry.securityId) || {};
          if (!stockDetails.SYMBOL_NAME) {
            console.warn(
              `No stock details found for securityId: ${entry.securityId}`
            );
          }
          const dayClose = yesterdayMap.get(entry.securityId);
          const latestTradedPrice = latestDataMap.get(entry.securityId);

          const percentageChange =
            dayClose && !isNaN(dayClose) && !isNaN(latestTradedPrice)
              ? ((latestTradedPrice - dayClose) / dayClose) * 100
              : 0;

          return {
            securityId: entry.securityId,
            symbol_name: stockDetails.SYMBOL_NAME || "Unknown",
            symbol: stockDetails.UNDERLYING_SYMBOL || "Unknown",
            previousHigh: preHigh,
            previousLow: preLow,
            previousOpen: preOpen,
            previousClose: preClose,
            currentOpen: crrOpen,
            currentClose: crrClose,
            momentumType: isBullish ? "Bullish" : "Bearish",
            priceChange: entry.currentBody,
            percentageChange: percentageChange.toFixed(2),
            timestamp: latestTimestamp,
            updatedAt: new Date(),
          };
        }
        return null;
      })
      .filter((stock) => stock !== null);

    // Log momentum stocks for debugging
    console.log(`Found ${momentumStocks.length} momentum stocks`);

    // Bulk upsert in MongoDB
    if (momentumStocks.length > 0) {
      const bulkUpdates = momentumStocks.map((stock) => ({
        updateOne: {
          filter: { securityId: stock.securityId },
          update: { $set: stock },
          upsert: true,
        },
      }));

      try {
        await MomentumStockFiveMin.bulkWrite(bulkUpdates);
        console.log(
          `[MongoDB] Momentum stocks saved or updated for MomentumStockFiveMin`
        );
      } catch (error) {
        console.error(
          `[MongoDB] Error saving momentum stocks: ${error.message}`
        );
      }
    }

    // Fetch all momentum stocks, sorted by updatedAt (descending)
    const updatedDataFromDB = await MomentumStockFiveMin.find(
      {},
      {
        securityId: 1,
        symbol_name: 1,
        symbol: 1,
        momentumType: 1,
        timestamp: 1,
        percentageChange: 1,
        previousHigh: 1,
        previousLow: 1,
        previousOpen: 1,
        previousClose: 1,
        currentOpen: 1,
        currentClose: 1,
        _id: 0,
      }
    ).sort({ updatedAt: -1 });

    return {
      message: "Momentum stocks found and saved",
      count: momentumStocks.length,
      updatedData: updatedDataFromDB,
    };
  } catch (error) {
    console.error(
      `[Main] Error in AIMomentumCatcherFiveMins: ${error.message}`
    );
    return {
      message: "Internal server error",
      error: error.message,
    };
  }
};