import MarketDetailData from "../models/marketData.model.js";
import StocksDetail from "../models/stocksDetail.model.js";
import FiveDayRangeBreakerModel from "../models/fiveDayRangeBreacker.model.js";
import TenDayRangeBreakerModel from "../models/tenDayRangeBreacker.model.js";
import DailyCandleReversalModel from "../models/dailyCandleRevarsal.model.js";
import ContractionModel from "../models/Contraction.model.js";
import CandleBreakoutBreakdown from "../models/candlebreakout.model.js";


const getFormattedISTDate = () => {
  const now = new Date();
  const istDate = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, "0");
  const day = String(istDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const processRangeBreakers = async (days, Model) => {
  const lookbackDays = days + 1; // Current day + lookback period

  // 1. Get the latest unique trading dates
  const tradingDays = await MarketDetailData.aggregate([
    { $group: { _id: "$date" } },
    { $sort: { _id: -1 } },
    { $limit: lookbackDays }
  ]);

  if (tradingDays.length < lookbackDays) {
    throw new Error(`Need at least ${days} trading days of data`);
  }

  const dates = tradingDays.map(d => d._id);
  const currentDate = dates[0];
  const previousDates = dates.slice(1); // Last `days` days

  // 2. Fetch required market data
  const marketData = await MarketDetailData.find(
    { date: { $in: dates } },
    {
      securityId: 1,
      "data.dayHigh": 1,
      "data.dayLow": 1,
      "data.dayClose": 1,
      "data.latestTradedPrice": 1,
      date: 1
    }
  ).lean();

  // 3. Fetch stock metadata
  const stocks = await StocksDetail.find(
    {},
    { SECURITY_ID: 1, UNDERLYING_SYMBOL: 1, SYMBOL_NAME: 1 }
  );
  const stockMap = new Map(stocks.map(stock => [stock.SECURITY_ID, stock]));

  // 4. Organize market data by securityId
  const securityDataMap = new Map();

  for (const entry of marketData) {
    if (!entry.securityId || !Array.isArray(entry.data)) continue;

    if (!securityDataMap.has(entry.securityId)) {
      securityDataMap.set(entry.securityId, {
        current: null,
        previous: Array(days).fill(null)
      });
    }

    const secData = securityDataMap.get(entry.securityId);
    const dailyData = entry.data[0];

    if (entry.date === currentDate) {
      secData.current = dailyData;
    } else {
      const index = previousDates.indexOf(entry.date);
      if (index !== -1) {
        secData.previous[index] = dailyData;
      }
    }
  }

  // 5. Detect range breakouts and prepare bulk operations
  const bulkOps = [];

  for (const [securityId, data] of securityDataMap.entries()) {
    const { current, previous } = data;
    if (!current || previous.some(d => !d)) continue;

    const stock = stockMap.get(securityId);
    if (!stock) continue;

    const {
      dayHigh,
      dayLow,
      dayClose,
      latestTradedPrice
    } = current;

    const previousHighs = previous.map(d => d.dayHigh);
    const previousLows = previous.map(d => d.dayLow);
    const baseClose = previous[0].dayClose;

    const maxHigh = Math.max(...previousHighs);
    const minLow = Math.min(...previousLows);

    let type = null;
    if (dayClose > maxHigh) type = "bullish";
    else if (dayClose < minLow) type = "bearish";
    if (!type) continue;

    const pctChange = ((latestTradedPrice - baseClose) / baseClose) * 100;

    bulkOps.push({
      updateOne: {
        filter: { securityId },
        update: {
          $set: {
            percentageChange: parseFloat(pctChange.toFixed(2)),
            todayHigh: dayHigh.toFixed(2),
            todayLow: dayLow.toFixed(2),
            todayLatestTradedPrice: latestTradedPrice.toFixed(2),
            [days === 5 ? 'preFiveDaysHigh' : 'preTenDaysHigh']: maxHigh.toFixed(2),
            [days === 5 ? 'preFiveDaysLow' : 'preTenDaysLow']: minLow.toFixed(2),
            UNDERLYING_SYMBOL: stock.UNDERLYING_SYMBOL,
            SYMBOL_NAME: stock.SYMBOL_NAME,
            type,
            timestamp: getFormattedISTDate()
          }
        },
        upsert: true
      }
    });
  }

  // 6. Write to MongoDB if data available
  if (bulkOps.length > 0) {
    await Model.bulkWrite(bulkOps);
  }

  return { success: true, count: bulkOps.length };
};

const fiveDayRangeBreakers = async (req, res) => {
  try {
    const result = await processRangeBreakers(5, FiveDayRangeBreakerModel);
    return res ? res.json(result) : result;
  } catch (error) {
    console.error("5-day range breaker error:", error);
    const response = { success: false, error: error.message };
    return res ? res.status(500).json(response) : response;
  }
};

const tenDayRangeBreakers = async (req, res) => {
  try {
    const result = await processRangeBreakers(10, TenDayRangeBreakerModel);
    return res ? res.json(result) : result;
  } catch (error) {
    console.error("10-day range breaker error:", error);
    const response = { success: false, error: error.message };
    return res ? res.status(500).json(response) : response;
  }
};

const dailyCandleReversal = async (req, res) => {
  try {
    // 1. Get last 3 trading days
    const tradingDays = await MarketDetailData.aggregate([
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } },
      { $limit: 3 }
    ]);

    if (tradingDays.length < 3) {
      return res?.status(400).json({ message: "Need at least 3 trading days" }) || 
             { message: "Need at least 3 trading days" };
    }

    const dates = tradingDays.map(d => d._id);
    const [currentDate, prevDate, prevPrevDate] = dates;

    // 2. Fetch market data in single query
    const marketData = await MarketDetailData.find(
      { date: { $in: dates } },
      {
        securityId: 1,
        "data.dayOpen": 1,
        "data.dayClose": 1,
        "data.latestTradedPrice": 1,
        date: 1
      }
    ).lean();

    // 3. Get stock metadata
    const stocks = await StocksDetail.find(
      {}, 
      { SECURITY_ID: 1, UNDERLYING_SYMBOL: 1, SYMBOL_NAME: 1 }
    );
    const stockMap = new Map(stocks.map(s => [s.SECURITY_ID, s]));

    // 4. Organize data by security
    const securityData = new Map();
    
    marketData.forEach(entry => {
      if (!securityData.has(entry.securityId)) {
        securityData.set(entry.securityId, {
          current: null,
          prev: null,
          prevPrev: null
        });
      }
      
      const data = securityData.get(entry.securityId);
      if (entry.date === currentDate) data.current = entry.data[0];
      else if (entry.date === prevDate) data.prev = entry.data[0];
      else if (entry.date === prevPrevDate) data.prevPrev = entry.data[0];
    });

    // 5. Detect reversals with strict conditions
    const bulkOps = [];
    
    for (const [securityId, data] of securityData) {
      // Skip if incomplete data
      if (!data.current || !data.prev || !data.prevPrev) continue;
      
      const stock = stockMap.get(securityId);
      if (!stock) continue;
      
      // Current candle values
      const { dayOpen: currOpen, dayClose: currClose, latestTradedPrice: currPrice } = data.current;
      
      // Previous candle values
      const { dayOpen: prevOpen, dayClose: prevClose } = data.prev;
      
      // Pre-previous candle values
      const { dayClose: prevPrevClose } = data.prevPrev;
      
      // Skip if any invalid values
      if ([prevClose, prevPrevClose, currPrice].some(v => v === undefined || v === 0)) continue;

      // Calculate percentage changes
      const prevCandleChange = ((prevClose - prevPrevClose) / prevPrevClose) * 100;
      const currCandleChange = ((currPrice - prevClose) / prevClose) * 100;
      
      // Absolute values for comparison
      const absPrevChange = Math.abs(prevCandleChange);
      const absCurrChange = Math.abs(currCandleChange);
      
      // Minimum 2% movement in previous candle
      if (absPrevChange < 1) continue;
      
      let trend = null;
      
      // Bullish Reversal Condition:
      // 1. Previous candle was red (open > close)
      // 2. Current candle is green (open < close)
      // 3. Current green candle is ≥2x size of previous red candle
      if (prevOpen > prevClose && currOpen < currClose && absCurrChange >= absPrevChange * 2) {
        trend = "BULLISH";
      } 
      // Bearish Reversal Condition:
      // 1. Previous candle was green (open < close)
      // 2. Current candle is red (open > close)
      // 3. Current red candle is ≥2x size of previous green candle
      else if (prevOpen < prevClose && currOpen > currClose && absCurrChange >= absPrevChange * 2) {
        trend = "BEARISH";
      }
      
      if (trend) {
        bulkOps.push({
          updateOne: {
            filter: { securityId },
            update: {
              $set: {
                securityId,
                fstPreviousDayChange: prevCandleChange.toFixed(2),
                persentageChange: currCandleChange.toFixed(2),
                trend,
                UNDERLYING_SYMBOL: stock.UNDERLYING_SYMBOL,
                SYMBOL_NAME: stock.SYMBOL_NAME,
                timestamp: getFormattedISTDate()
              }
            },
            upsert: true
          }
        });
      }
    }

    // 6. Save results
    if (bulkOps.length > 0) {
      await DailyCandleReversalModel.bulkWrite(bulkOps);
    }

    const response = { 
      success: true,
      count: bulkOps.length,
      message: `Found ${bulkOps.length} reversal patterns`
    };
    
    return res?.json(response) || response;

  } catch (error) {
    console.error("Daily reversal error:", error);
    const response = { 
      success: false,
      message: "Internal server error",
      error: error.message 
    };
    return res?.status(500).json(response) || response;
  }
};
const AIContraction = async (req, res) => {
  try {
    // 1. Get last 7 trading days (for comparison)
    const tradingDays = await MarketDetailData.aggregate([
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } },
      { $limit: 7 }
    ]);

    if (tradingDays.length < 7) {
      return res?.status(400).json({ message: "Need at least 7 trading days" }) || 
             { message: "Need at least 7 trading days" };
    }

    const dates = tradingDays.map(d => d._id);
    const currentDate = dates[0];
    const previousDates = dates.slice(1);

    // 2. Fetch market data in single query
    const marketData = await MarketDetailData.find(
      { date: { $in: dates } },
      {
        securityId: 1,
        "data.dayOpen": 1,
        "data.dayClose": 1,
        "data.dayHigh": 1,
        "data.dayLow": 1,
        "data.latestTradedPrice": 1,
        date: 1
      }
    ).lean();

    // 3. Get stock metadata
    const stocks = await StocksDetail.find(
      {}, 
      { SECURITY_ID: 1, UNDERLYING_SYMBOL: 1, SYMBOL_NAME: 1 }
    );
    const stockMap = new Map(stocks.map(s => [s.SECURITY_ID, s]));

    // 4. Organize data by security and calculate candle sizes
    const securityData = new Map();
    
    marketData.forEach(entry => {
      if (!securityData.has(entry.securityId)) {
        securityData.set(entry.securityId, {
          candles: []
        });
      }
      
      const data = securityData.get(entry.securityId);
      const candleData = entry.data[0];
      
      data.candles.push({
        date: entry.date,
        open: candleData.dayOpen,
        close: candleData.dayClose,
        high: candleData.dayHigh,
        low: candleData.dayLow,
        latestPrice: candleData.latestTradedPrice,
        // Calculate candle body size (absolute difference between open and close)
        bodySize: Math.abs(candleData.dayOpen - candleData.dayClose),
        // Calculate total candle range (high - low)
        totalRange: candleData.dayHigh - candleData.dayLow
      });
    });

    // 5. Find contraction patterns
    const bulkOps = [];
    
    for (const [securityId, data] of securityData) {
      // Skip if we don't have all 7 days
      if (data.candles.length < 7) continue;
      
      const stock = stockMap.get(securityId);
      if (!stock) continue;
      
      // Sort candles by date (newest first)
      const sortedCandles = [...data.candles].sort((a, b) => 
        new Date(b.date) - new Date(a.date));
      
      const currentCandle = sortedCandles[0];
      const previousCandles = sortedCandles.slice(1);
      
      // Check if current candle is the smallest in both body size and total range
      const isSmallestBody = previousCandles.every(c => 
        currentCandle.bodySize < c.bodySize);
      
      const isSmallestRange = previousCandles.every(c => 
        currentCandle.totalRange < c.totalRange);
      
      // Only consider if both body and range are smallest
      if (isSmallestBody && isSmallestRange) {
        const prevClose = sortedCandles[1].close;
        const percentageChange = 
          ((currentCandle.latestPrice - prevClose) / prevClose) * 100;
        
        bulkOps.push({
          updateOne: {
            filter: { securityId },
            update: {
              $set: {
                securityId,
                UNDERLYING_SYMBOL: stock.UNDERLYING_SYMBOL,
                SYMBOL_NAME: stock.SYMBOL_NAME,
                percentageChange: parseFloat(percentageChange.toFixed(2)),
                currentBodySize: currentCandle.bodySize.toFixed(2),
                currentRange: currentCandle.totalRange.toFixed(2),
                timestamp: getFormattedISTDate()
              }
            },
            upsert: true
          }
        });
      }
    }

    // 6. Save results
    if (bulkOps.length > 0) {
      await ContractionModel.bulkWrite(bulkOps);
    }

    const response = { 
      success: true,
      count: bulkOps.length,
      message: `Found ${bulkOps.length} contraction patterns`
    };
    
    return res?.json(response) || response;

  } catch (error) {
    console.error("AI Contraction error:", error);
    const response = { 
      success: false,
      message: "Internal server error",
      error: error.message 
    };
    return res?.status(500).json(response) || response;
  }
};

const candleBreakoutBreakdown = async (req, res) => {
  let response = {
    success: false,
    message: "",
    data: null
  };

  try {
    // Step 1: Get last 5 trading days
    const tradingDays = await MarketDetailData.aggregate([
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } },
      { $limit: 5 }
    ]);

    if (tradingDays.length < 5) {
      response.message = "Need at least 5 trading days of data";
      return res ? res.status(400).json(response) : response;
    }

    const dates = tradingDays.map(d => d._id);
    const [currentDate, day1Back, day2Back, day3Back, day4Back] = dates;

    // Step 2: Fetch OHLC data
    const marketData = await MarketDetailData.find(
      { date: { $in: dates } },
      {
        securityId: 1,
        "data.dayOpen": 1,
        "data.dayHigh": 1,
        "data.dayLow": 1,
        "data.dayClose": 1,
        date: 1,
        _id: 0
      }
    ).lean();

    // Step 3: Get stock metadata
    const stocks = await StocksDetail.find(
      {},
      { SECURITY_ID: 1, UNDERLYING_SYMBOL: 1, SYMBOL_NAME: 1 }
    );
    const stockMap = new Map(stocks.map(s => [s.SECURITY_ID, s]));

    // Step 4: Analyze
    const analysisResults = [];

    const securityData = marketData.reduce((acc, entry) => {
      if (!acc[entry.securityId]) {
        acc[entry.securityId] = {
          stockInfo: stockMap.get(entry.securityId),
          candles: {}
        };
      }
      acc[entry.securityId].candles[entry.date] = entry.data[0];
      return acc;
    }, {});

    for (const [securityId, data] of Object.entries(securityData)) {
      const candles = data.candles;

      if (Object.keys(candles).length !== 5) continue;

      const sortedDates = [day4Back, day3Back, day2Back, day1Back, currentDate];
      const sortedCandles = sortedDates.map(date => ({
        date,
        ...candles[date]
      }));

      const refCandle = sortedCandles[0];
      const refClose = refCandle.dayClose;
      const upperBound = refClose * 1.02;
      const lowerBound = refClose * 0.98;

      const middleCandles = sortedCandles.slice(1, 4);
      const allWithinRange = middleCandles.every(c => {
        return c.dayClose >= lowerBound && c.dayClose <= upperBound;
      });

      if (!allWithinRange) continue;

      const currentCandle = sortedCandles[4];
      let trend = null;
      if (currentCandle.dayClose > upperBound) trend = "BULLISH";
      else if (currentCandle.dayClose < lowerBound) trend = "BEARISH";

      if (trend) {
        const fstPreviousDayChange = ((currentCandle.dayClose - sortedCandles[3].dayClose) / sortedCandles[3].dayClose * 100).toFixed(2);
        const persentageChange = ((currentCandle.dayClose - refClose) / refClose * 100).toFixed(2);

        const payload = {
          securityId,
          SYMBOL_NAME: data.stockInfo?.SYMBOL_NAME || "",
          UNDERLYING_SYMBOL: data.stockInfo?.UNDERLYING_SYMBOL || "",
          fstPreviousDayChange: parseFloat(fstPreviousDayChange),
          persentageChange: parseFloat(persentageChange),
          trend,
          timestamp: new Date()
        };

        // ✅ UPSERT (update if exists, else insert)
        await CandleBreakoutBreakdown.findOneAndUpdate(
          { securityId },
          payload,
          { upsert: true, new: true }
        );

        analysisResults.push(payload);
      }
    }

    response = {
      success: true,
      count: analysisResults.length,
      message: `Found ${analysisResults.length} breakout patterns`,
      data: null
    };

    return res ? res.status(200).json(response) : response;

  } catch (error) {
    console.error("Candle breakout detection error:", error);
    response = {
      success: false,
      message: "Internal server error",
      error: error.message
    };
    return res ? res.status(500).json(response) : response;
  }
};




export {
  fiveDayRangeBreakers,//change check with the dayClose instead of latestTradedPrice
  tenDayRangeBreakers,//change check with the dayClose instead of latestTradedPrice
  dailyCandleReversal,
  AIContraction,
  candleBreakoutBreakdown
};
