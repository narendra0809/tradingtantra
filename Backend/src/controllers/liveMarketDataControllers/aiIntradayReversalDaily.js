import DailyMomentumSignal from "../../models/dailyMomentumSignal.model.js";
import MarketDetailData from "../../models/marketData.model.js";
import StocksDetail from "../../models/stocksDetail.model.js";
import FifteenMinCandles from "../../models/fifteenMinCandles.model.js";
export const AIIntradayReversalDaily = async (req, res) => {
  try {
    // Get latest market data
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date")
      .limit(1);

    if (!latestEntry) {
      return { message: "No stock data available" };
    }

    const latestDate = latestEntry.date;

    // Fetch latest and previous day data
    const [latestData, previousEntry] = await Promise.all([
      MarketDetailData.find(
        { date: latestDate },
        { securityId: 1, data: 1, _id: 0 }
      ),
      MarketDetailData.findOne({ date: { $lt: latestDate } }, { date: 1 })
        .sort({ date: -1 })
        .limit(1),
    ]);

    if (!latestData?.length) {
      return { message: "No latest stock data available" };
    }
    if (!previousEntry) {
      return { message: "No previous date available" };
    }

    const previousDate = previousEntry.date;
    const previousData = await MarketDetailData.find(
      { date: previousDate },
      { securityId: 1, data: 1, _id: 0 }
    );

    if (!previousData?.length) {
      return { message: "No previous stock data available" };
    }

    // Create price maps
    const latestDataMap = new Map();
    const securityIds = [];
    latestData.forEach((entry) => {
      securityIds.push(entry.securityId.trim().toString());
      latestDataMap.set(
        entry.securityId,
        entry.data?.latestTradedPrice?.[0] || 0
      );
    });

    const previousDayDataMap = new Map();
    previousData.forEach((entry) => {
      previousDayDataMap.set(entry.securityId, entry.data?.dayClose?.[0] || 0);
    });

    // Fetch stock metadata (216 stocks)
    const stocks = await StocksDetail.find(
      {},
      { SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1, SECURITY_ID: 1, _id: 0 }
    );

    if (!stocks?.length) {
      return { message: "No stocks data found" };
    }

    const stockMap = new Map();
    stocks.forEach((entry) => {
      stockMap.set(entry.SECURITY_ID, {
        UNDERLYING_SYMBOL: entry.UNDERLYING_SYMBOL,
        SYMBOL_NAME: entry.SYMBOL_NAME,
      });
    });

    // Process 15-minute candles
    const updatedData = [];
    for (const securityId of securityIds) {
      const data = await FifteenMinCandles.findOne({ securityId }).lean();
      if (!data || !data.open || !data.close || data.open.length < 5) {
        continue;
      }

      updatedData.push({
        securityId,
        timestamp: data.timestamp.slice(-5),
        open: data.open.slice(-5),
        close: data.close.slice(-5),
        high: data.high.slice(-5),
        low: data.low.slice(-5),
      });
    }

    if (!updatedData.length) {
      const existingSignals = await DailyMomentumSignal.find(
        {},
        {
          type: 1,
          securityId: 1,
          stockSymbol: 1,
          stockName: 1,
          percentageChange: 1,
          timestamp: 1,
          _id: 0,
        }
      ).sort({ updatedAt: -1 });
      return {
        message: "No candle data found, returning existing signals",
        data: existingSignals,
      };
    }

    // Analyze reversals
    const results = updatedData.map((item) => {
      const momentumSignals = [];
      const securityId = item.securityId;
      const stock = stockMap.get(securityId);
      const latestTradedPrice = latestDataMap.get(securityId);
      const previousDayClose = previousDayDataMap.get(securityId);
      const latestTimestamp = item.timestamp[4];

      if (item.open.length < 5 || item.close.length < 5) {
        return momentumSignals;
      }

      const lastFiveOpen = item.open;
      const lastFiveClose = item.close;

      // Calculate percentage returns
      const candleReturns = lastFiveOpen.map((open, i) => {
        const close = lastFiveClose[i];
        return ((close - open) / open) * 100;
      });

      const prevFourReturns = candleReturns.slice(0, 4);
      const latestReturn = candleReturns[4];
      // console.log("Latest Data : ", latestReturn);
      // process.exit();

      // Check candle directions
      const isLatestBullish = lastFiveClose[4] > lastFiveOpen[4];
      const isLatestBearish = lastFiveClose[4] < lastFiveOpen[4];
      const prevFourColors = prevFourReturns.map((ret) =>
        ret > 0 ? "green" : ret < 0 ? "red" : "neutral"
      );

      // Overall percentage change
      const percentageChange =
        previousDayClose &&
        latestTradedPrice &&
        !isNaN(previousDayClose) &&
        !isNaN(latestTradedPrice)
          ? ((latestTradedPrice - previousDayClose) / previousDayClose) * 100
          : 0;

      // Bullish Reversal
      const allPrevRed = prevFourColors.every((color) => color === "red");
      const decreasingLosses = prevFourReturns.every(
        (ret, i) => i === 0 || Math.abs(ret) < Math.abs(prevFourReturns[i - 1])
      );

      if (allPrevRed && decreasingLosses && isLatestBullish) {
        momentumSignals.push({
          type: "Bullish",
          securityId,
          stockSymbol: stock?.UNDERLYING_SYMBOL || "N/A",
          stockName: stock?.SYMBOL_NAME || "N/A",
          lastTradePrice: lastFiveClose[4],
          previousClosePrice: lastFiveClose[3],
          percentageChange: percentageChange.toFixed(2),
          timestamp: latestTimestamp,
          updatedAt: new Date(),
        });
      }

      // Bearish Reversal
      const allPrevGreen = prevFourColors.every((color) => color === "green");
      const decreasingGains = prevFourReturns.every(
        (ret, i) => i === 0 || ret < prevFourReturns[i - 1]
      );

      if (allPrevGreen && decreasingGains && isLatestBearish) {
        momentumSignals.push({
          type: "Bearish",
          securityId,
          stockSymbol: stock?.UNDERLYING_SYMBOL || "N/A",
          stockName: stock?.SYMBOL_NAME || "N/A",
          lastTradePrice: lastFiveClose[4],
          previousClosePrice: lastFiveClose[3],
          percentageChange: percentageChange.toFixed(2),
          timestamp: latestTimestamp,
          updatedAt: new Date(),
        });
      }

      return momentumSignals;
    });

    const finalResults = results.flat();

    // Save signals
    if (finalResults.length) {
      const savePromises = finalResults.map(async (signal) => {
        try {
          await DailyMomentumSignal.findOneAndUpdate(
            { securityId: signal.securityId },
            { $set: signal },
            { upsert: true, new: true }
          );
        } catch (dbError) {
          console.error(
            `[MongoDB] Error saving reversal signal for ${signal.securityId}: ${dbError.message}`
          );
        }
      });
      await Promise.all(savePromises);
      console.log(
        `[MongoDB] Reversal signals saved or updated for DailyMomentumSignal`
      );
    }

    // Fetch all signals
    const fullData = await DailyMomentumSignal.find(
      {},
      {
        type: 1,
        securityId: 1,
        stockSymbol: 1,
        stockName: 1,
        percentageChange: 1,
        timestamp: 1,
        _id: 0,
      }
    ).sort({ updatedAt: -1 });

    return {
      message: finalResults.length
        ? "Intraday reversal stocks found and saved"
        : "No reversal signals detected",
      data: fullData,
    };
  } catch (error) {
    console.error(`[Main] Error in AIIntradayReversalDaily: ${error.message}`);
    return {
      message: "Internal server error",
      error: error.message,
    };
  }
};
