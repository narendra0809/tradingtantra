import FiveMinCandles from "../models/fiveMinCandles.model.js";
import MomentumStockFiveMin from "../models/fiveMinMomentumSignal.model.js";
import redis from "../config/redisClient.js";
import MarketDetailData from "../models/marketData.model.js";
import StocksDetail from "../models/stocksDetail.model.js";

const processAIMomentumFiveMins = async () => {
  try {
    // 1. Fetch basic stock information
    const stocks = await StocksDetail.find(
      {},
      { SECURITY_ID: 1, SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1, _id: 0 }
    ).lean();
    
    if (!stocks?.length) {
      return { success: false, message: "No stocks data found" };
    }

    // 2. Create stock mapping for quick lookup
    const stockMap = new Map(stocks.map(stock => [
      stock.SECURITY_ID, 
      {
        UNDERLYING_SYMBOL: stock.UNDERLYING_SYMBOL,
        SYMBOL_NAME: stock.SYMBOL_NAME
      }
    ]));

    // 3. Get latest market date
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date")
      .lean();

    if (!latestEntry) {
      return { success: false, message: "No market data available" };
    }

    const latestDate = latestEntry.date;

    // 4. Get previous trading day data
    const previousDayEntry = await MarketDetailData.findOne(
      { date: { $lt: latestDate } },
      { date: 1 }
    )
      .sort({ date: -1 })
      .lean();

    if (!previousDayEntry) {
      return { success: false, message: "No previous day data available" };
    }

    // 5. Fetch and process candle data
    const [latestData, yesterdayData] = await Promise.all([
      MarketDetailData.find({ date: latestDate }).lean(),
      MarketDetailData.find({ date: previousDayEntry.date }).lean()
    ]);

    const securityIds = latestData.map(entry => entry.securityId);
    const latestDataMap = new Map(latestData.map(entry => [
      entry.securityId, 
      entry.data?.latestTradedPrice?.[0] || 0
    ]));
    const yesterdayMap = new Map(yesterdayData.map(entry => [
      entry.securityId, 
      entry.data?.dayClose?.[0] || 0
    ]));

    // 6. Process each security
    const momentumStocks = [];
    const tomorrow = new Date(latestDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split("T")[0];

    for (const securityId of securityIds) {
      try {
        const redisKey = `stockFiveMinCandle:${securityId}:${latestDate}-${tomorrowFormatted}`;
        
        // Try cache first, then database
        const cachedData = await redis.get(redisKey);
        const data = cachedData ? JSON.parse(cachedData) : 
          await FiveMinCandles.findOne({ securityId, date: latestDate }).lean();

        if (!data?.open?.length || data.open.length < 2) continue;

        // Get last two candles
        const lastIdx = data.open.length - 1;
        const lastCandle = {
          high: data.high[lastIdx],
          low: data.low[lastIdx],
          close: data.close[lastIdx],
          open: data.open[lastIdx],
          timestamp: data.timestamp[lastIdx]
        };
        const prevCandle = {
          high: data.high[lastIdx-1],
          low: data.low[lastIdx-1],
          close: data.close[lastIdx-1],
          open: data.open[lastIdx-1]
        };

        // Calculate momentum conditions
        const currentBody = Math.abs(lastCandle.close - lastCandle.open);
        const previousRange = prevCandle.high - prevCandle.low;
        const hasMomentum = currentBody >= previousRange * 2 && previousRange > 0.1;
        const isBullish = lastCandle.close > lastCandle.open;
        const isBearish = lastCandle.close < lastCandle.open;

        if (hasMomentum && (isBullish || isBearish)) {
          const stockInfo = stockMap.get(securityId) || {};
          const dayClose = yesterdayMap.get(securityId) || 0;
          const currentPrice = latestDataMap.get(securityId) || 0;
          const percentageChange = dayClose ? 
            ((currentPrice - dayClose) / dayClose) * 100 : 0;

          momentumStocks.push({
            securityId,
            symbol: stockInfo.UNDERLYING_SYMBOL || "Unknown",
            symbol_name: stockInfo.SYMBOL_NAME || "Unknown",
            previousHigh: prevCandle.high,
            previousLow: prevCandle.low,
            previousOpen: prevCandle.open,
            previousClose: prevCandle.close,
            currentOpen: lastCandle.open,
            currentClose: lastCandle.close,
            momentumType: isBullish ? "Bullish" : "Bearish",
            priceChange: currentBody,
            percentageChange: percentageChange.toFixed(2),
            timestamp: lastCandle.timestamp
          });
        }
      } catch (err) {
        // console.error(`Error processing ${security  securityId}:`, err);
      }
    }

    // 7. Sort and save results
    momentumStocks.sort((a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange));

    if (momentumStocks.length) {
      await MomentumStockFiveMin.bulkWrite(
        momentumStocks.map(stock => ({
          updateOne: {
            filter: { securityId: stock.securityId },
            update: { $set: stock },
            upsert: true
          }
        }))
      );
    }

    return {
      success: true,
      message: `Processed ${momentumStocks.length} momentum stocks`,
      count: momentumStocks.length
    };

  } catch (error) {
    console.error("Process error:", error);
    return {
      success: false,
      message: "Processing failed",
      error: error.message
    };
  }
};

const fetchMomentumFiveMins = async () => {
  try {
    const data = await MomentumStockFiveMin.find({})
      .sort({ timestamp: -1 })
      .select({
        securityId: 1,
        symbol: 1,
        symbol_name: 1,
        momentumType: 1,
        timestamp: 1,
        percentageChange: 1,
        previousHigh: 1,
        previousLow: 1,
        previousOpen: 1,
        previousClose: 1,
        currentOpen: 1,
        currentClose: 1,
        _id: 0
      })
      .lean();

    return {
      success: true,
      data,
      count: data.length,
      message: "Momentum data fetched successfully"
    };
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

const getAIMomentumFiveMins = async (req, res) => {
  try {
    const result = await fetchMomentumFiveMins();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch momentum data",
      error: error.message
    });
  }
};

export { processAIMomentumFiveMins, getAIMomentumFiveMins, fetchMomentumFiveMins };