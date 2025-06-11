import DailyRangeBreakouts from "../../models/dailyRangeBreakout.model.js";
import FiveMinCandles from "../../models/fiveMinCandles.model.js";
import MarketDetailData from "../../models/marketData.model.js";
import StocksDetail from "../../models/stocksDetail.model.js";

export const DailyRangeBreakout = async () => {
  try {
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date")
      .limit(1);

    if (!latestEntry) {
      return { status: 404, message: "No stock data available" };
    }

    const latestDate = latestEntry.date;

    // Get previous trading day
    const previousEntry = await MarketDetailData.findOne({
      date: { $lt: latestDate },
    })
      .sort({ date: -1 })
      .limit(1);

    if (!previousEntry) {
      return { status: 404, message: "No previous date available" };
    }

    const previousDate = previousEntry.date;

    // Fetch latest and previous day stock data
    const [latestData, previousData] = await Promise.all([
      MarketDetailData.find(
        { date: latestDate },
        { securityId: 1, data: 1, _id: 0 }
      ),
      MarketDetailData.find(
        { date: previousDate },
        { securityId: 1, data: 1, _id: 0 }
      ),
    ]);

    if (!latestData?.length) {
      return { status: 404, message: "No latest stock data available" };
    }

    if (!previousData?.length) {
      return { status: 404, message: "No previous stock data available" };
    }

    // Create maps for latest and previous day data
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

    // Fetch stock details
    const stocks = await StocksDetail.find(
      {},
      { SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1, SECURITY_ID: 1, _id: 0 }
    );

    if (!stocks?.length) {
      return { status: 404, message: "No stocks data found" };
    }

    const stockMap = new Map();
    stocks.forEach((entry) => {
      stockMap.set(entry.SECURITY_ID, {
        UNDERLYING_SYMBOL: entry.UNDERLYING_SYMBOL || "N/A",
        SYMBOL_NAME: entry.SYMBOL_NAME || "N/A",
      });
    });

    // Get 5-minute candle data
    const candleData = await FiveMinCandles.find({
      securityId: { $in: securityIds },
    }).lean();
    const updatedData = [];

    for (const data of candleData) {
      const securityId = data.securityId;
      if (!data.open || !data.close || !data.high || data.high.length < 5) {
        continue;
      }

      // Validate and sort timestamps
      const timestamps = data.timestamp
        .map((ts, index) => ({ ts, index }))
        .filter((item) =>
          /^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2} [ap]m$/i.test(item.ts)
        )
        .sort((a, b) => {
          const dateA = new Date(
            a.ts.replace(
              /(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2} [ap]m)/i,
              "$3-$2-$1 $4"
            )
          );
          const dateB = new Date(
            b.ts.replace(
              /(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2} [ap]m)/i,
              "$3-$2-$1 $4"
            )
          );
          return dateB - dateA;
        })
        .slice(0, 5)
        .sort((a, b) => {
          const dateA = new Date(
            a.ts.replace(
              /(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2} [ap]m)/i,
              "$3-$2-$1 $4"
            )
          );
          const dateB = new Date(
            b.ts.replace(
              /(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2} [ap]m)/i,
              "$3-$2-$1 $4"
            )
          );
          return dateA - dateB;
        })
        .map((item) => item.index);

      if (timestamps.length < 5) {
        continue;
      }

      const lastFiveCandles = {
        timestamp: timestamps.map((i) => data.timestamp[i]),
        open: timestamps.map((i) => data.open[i]),
        close: timestamps.map((i) => data.close[i]),
        high: timestamps.map((i) => data.high[i]),
        low: timestamps.map((i) => data.low[i]),
      };

      updatedData.push({
        securityId,
        ...lastFiveCandles,
      });
    }

    if (!updatedData.length) {
      const existingSignals = await DailyRangeBreakouts.find(
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
        status: 200,
        message: "No candle data found, returning existing signals",
        data: existingSignals,
        currentBreakouts: [],
        stats: { total: 0, bullish: 0, bearish: 0 },
      };
    }

    // Analyze breakouts
    let breakoutStocks = [];
    for (const item of updatedData) {
      const securityId = item.securityId;
      const stock = stockMap.get(securityId);
      const latestTradedPrice = latestDataMap.get(securityId);
      const previousDayClose = previousDayDataMap.get(securityId);

      if (
        !latestTradedPrice ||
        !previousDayClose ||
        latestTradedPrice <= 0 ||
        previousDayClose <= 0
      ) {
        continue;
      }

      const highs = item.high;
      const lows = item.low;
      const opens = item.open;
      const closes = item.close;
      const timestamps = item.timestamp;

      // First candle range (15:05 PM)
      const firstCandleHigh = highs[0];
      const firstCandleLow = lows[0];
      // Check middle candles (15:10–15:20) within first candle's range
      const areMiddleCandlesInRange = [1, 2, 3].every((i) => {
        return (
          opens[i] >= firstCandleLow &&
          opens[i] <= firstCandleHigh &&
          closes[i] >= firstCandleLow &&
          closes[i] <= firstCandleHigh
        );
      });

      if (areMiddleCandlesInRange) {
        const latestClose = closes[4];
        const latestTimestamp = timestamps[4];

        const percentageChange =
          ((latestTradedPrice - previousDayClose) / previousDayClose) * 100;

        // Bullish breakout
        if (latestClose > firstCandleHigh) {
          breakoutStocks.push({
            type: "Bullish",
            securityId,
            stockSymbol: stock?.UNDERLYING_SYMBOL || "N/A",
            stockName: stock?.SYMBOL_NAME || "N/A",
            lastTradePrice: latestTradedPrice,
            percentageChange: percentageChange.toFixed(2),
            firstCandleLow: firstCandleLow,
            firstCandleHigh: firstCandleHigh,
            currentCandleClose: latestClose,
            firstCandleRange: `${firstCandleLow}-${firstCandleHigh}`,
            timestamp: latestTimestamp,
            date: latestDate,
            updatedAt: new Date(),
          });
        }
        // Bearish breakout
        else if (latestClose < firstCandleLow) {
          breakoutStocks.push({
            type: "Bearish",
            securityId,
            stockSymbol: stock?.UNDERLYING_SYMBOL || "N/A",
            stockName: stock?.SYMBOL_NAME || "N/A",
            lastTradePrice: latestTradedPrice,
            percentageChange: percentageChange.toFixed(2),
            firstCandleLow: firstCandleLow,
            firstCandleHigh: firstCandleHigh,
            currentCandleClose: latestClose,
            firstCandleRange: `${firstCandleLow}-${firstCandleHigh}`,
            timestamp: latestTimestamp,
            date: latestDate,
            updatedAt: new Date(),
          });
        }
      }
    }

    // Save breakout signals
    if (breakoutStocks.length > 0) {
      const bulkOps = breakoutStocks.map((signal) => ({
        updateOne: {
          filter: {
            securityId: signal.securityId,
            // date: signal.date,
            // type: signal.type,
          },
          update: { $set: signal },
          upsert: true,
        },
      }));

      try {
        await DailyRangeBreakouts.bulkWrite(bulkOps);
        console.log(
          `[MongoDB] Breakout signals saved or updated for DailyRangeBreakouts`
        );
      } catch (dbError) {
        console.error(
          `[MongoDB] Error saving breakout signals: ${dbError.message}`
        );
      }
    }

    // Get all breakout signals
    const fullData = await DailyRangeBreakouts.find(
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
      status: 200,
      message:
        breakoutStocks.length > 0
          ? "Breakout analysis complete"
          : "No breakout signals detected",
      data: fullData,
      currentBreakouts: breakoutStocks,
      stats: {
        total: breakoutStocks.length,
        bullish: breakoutStocks.filter((b) => b.type === "Bullish").length,
        bearish: breakoutStocks.filter((b) => b.type === "Bearish").length,
      },
    };
  } catch (error) {
    console.error(`[Main] Error in DailyRangeBreakout: ${error.message}`);
    return {
      status: 500,
      message: "Internal server error",
      error: error.message,
    };
  }
};
