import MarketDetailData from "../../models/marketData.model.js";
import MomentumStockTenMin from "../../models/momentumStockTenMin.model.js";
import StocksDetail from "../../models/stocksDetail.model.js";
import TenMinCandles from "../../models/tenMinCandles.model.js";

export const AIMomentumCatcherTenMins = async (req, res) => {
  try {
    // Fetch stock metadata (216 stocks)
    const stocks = await StocksDetail.find(
      {},
      { SECURITY_ID: 1, SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1, _id: 0 }
    );
    if (!stocks?.length) return { message: "No stocks data found" };

    // Create stock mapping
    const stockMap = new Map(
      stocks.map((entry) => [
        entry.SECURITY_ID,
        {
          UNDERLYING_SYMBOL: entry.UNDERLYING_SYMBOL,
          SYMBOL_NAME: entry.SYMBOL_NAME,
        },
      ])
    );
    const securityIds = stocks.map((stock) => stock.SECURITY_ID);

    // Get latest market data
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date");
    if (!latestEntry) return { message: "No stock data available" };

    const latestDate = latestEntry.date;
    const [latestData, previousDayEntry] = await Promise.all([
      MarketDetailData.find({ date: latestDate }),
      MarketDetailData.findOne({ date: { $lt: latestDate } }, { date: 1 }).sort(
        { date: -1 }
      ),
    ]);

    if (!latestData.length)
      return { message: "No stock data available for the latest date" };
    if (!previousDayEntry)
      return { message: "No previous stock data available" };

    // Prepare price maps
    const createPriceMap = (data, priceField) =>
      new Map(
        data.map((entry) => [
          entry.securityId,
          entry.data?.[priceField]?.[0] || 0,
        ])
      );
    const latestDataMap = createPriceMap(latestData, "latestTradedPrice");
    const yesterdayMap = createPriceMap(
      await MarketDetailData.find({ date: previousDayEntry.date }),
      "dayClose"
    );

    // Process each security
    const momentumStocks = [];
    for (const securityId of securityIds) {
      // Fetch 10-minute candle data
      const data = await TenMinCandles.findOne({ securityId }).lean();
      if (!data || !data.high || !data.close || data.timestamp.length < 2) {
        continue;
      }

      // Get the last two candles (3:15 PM and 3:25 PM)
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

      // Analyze last two 10-min periods
      const currentBody = Math.abs(lastCandle.close - lastCandle.open);
      const previousRange = secondLastCandle.high - secondLastCandle.low;
      const hasMomentum =
        currentBody >= previousRange * 2 && previousRange > 0.1;

      if (hasMomentum) {
        const stockInfo = stockMap.get(securityId) || {};
        const pctChange =
          ((latestDataMap.get(securityId) - yesterdayMap.get(securityId)) /
            yesterdayMap.get(securityId)) *
            100 || 0;

        momentumStocks.push({
          securityId,
          symbol_name: stockInfo.SYMBOL_NAME || "Unknown",
          symbol: stockInfo.UNDERLYING_SYMBOL || "Unknown",
          previousHigh: secondLastCandle.high,
          previousLow: secondLastCandle.low,
          previousOpen: secondLastCandle.open,
          previousClose: secondLastCandle.close,
          currentOpen: lastCandle.open,
          currentClose: lastCandle.close,
          momentumType:
            lastCandle.close > lastCandle.open ? "Bullish" : "Bearish",
          priceChange: currentBody,
          percentageChange: pctChange.toFixed(2),
          timestamp: lastCandle.timestamp,
          updatedAt: new Date(),
        });
      }
    }

    // Save results
    if (momentumStocks.length) {
      const bulkUpdates = momentumStocks.map((stock) => ({
        updateOne: {
          filter: { securityId: stock.securityId },
          update: { $set: stock },
          upsert: true,
        },
      }));

      try {
        await MomentumStockTenMin.bulkWrite(bulkUpdates);
        console.log(
          `[MongoDB] Momentum stocks saved or updated for MomentumStockTenMin`
        );
      } catch (error) {
        console.error(
          `[MongoDB] Error saving momentum stocks: ${error.message}`
        );
      }
    }

    // Fetch all momentum stocks, sorted by updatedAt (descending)
    const allMomentumStocks = await MomentumStockTenMin.find(
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
      message: momentumStocks.length
        ? "Momentum stocks found and saved"
        : "No momentum signals",
      count: allMomentumStocks.length,
      data: allMomentumStocks,
    };
  } catch (error) {
    console.error(`[Main] Error in AIMomentumCatcherTenMins: ${error.message}`);
    return {
      message: "Internal server error",
      error: error.message,
    };
  }
};
