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
  try {
    const lookbackDays = days + 1;

    const tradingDays = await MarketDetailData.aggregate([
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } },
      { $limit: lookbackDays }
    ]);

    if (tradingDays.length < lookbackDays) {
      return { 
        success: false,
        message: `Need at least ${days} trading days of historical data` 
      };
    }

    const dates = tradingDays.map(d => d._id);
    const currentDate = dates[0];
    const historicalDates = dates.slice(1);

    const marketData = await MarketDetailData.aggregate([
      { $match: { date: { $in: dates } } },
      { $project: {
          securityId: 1,
          date: 1,
          dayHigh: { $arrayElemAt: ["$data.dayHigh", 0] },
          dayLow: { $arrayElemAt: ["$data.dayLow", 0] },
          dayClose: { $arrayElemAt: ["$data.dayClose", 0] },
          latestPrice: { $arrayElemAt: ["$data.latestTradedPrice", 0] }
      } }
    ]);

    const stockMap = new Map();
    (await StocksDetail.find({}, { SECURITY_ID: 1, UNDERLYING_SYMBOL: 1, SYMBOL_NAME: 1 }))
      .forEach(stock => stockMap.set(stock.SECURITY_ID, stock));

    const securityData = new Map();
    
    marketData.forEach(entry => {
      if (!securityData.has(entry.securityId)) {
        securityData.set(entry.securityId, {
          current: null,
          historical: []
        });
      }
      
      const data = securityData.get(entry.securityId);
      if (entry.date === currentDate) {
        data.current = {
          high: entry.dayHigh,
          low: entry.dayLow,
          close: entry.dayClose,
          price: entry.latestPrice
        };
      } else {
        data.historical.push({
          high: entry.dayHigh,
          low: entry.dayLow,
          close: entry.dayClose
        });
      }
    });

    const bulkOps = [];
    
    for (const [securityId, data] of securityData) {
      if (!data.current || data.historical.length !== days) continue;
      
      const stock = stockMap.get(securityId);
      if (!stock) continue;

      const historicalHighs = data.historical.map(d => d.high);
      const historicalLows = data.historical.map(d => d.low);
      const rangeHigh = Math.max(...historicalHighs);
      const rangeLow = Math.min(...historicalLows);
      const firstHistoricalClose = data.historical[0].close;

      let breakoutType = null;
      if (data.current.close > rangeHigh) {
        breakoutType = "BULLISH";
      } else if (data.current.close < rangeLow) {
        breakoutType = "BEARISH";
      }

      if (!breakoutType) continue;

      const percentageChange = ((data.current.price - firstHistoricalClose) / firstHistoricalClose) * 100;

      bulkOps.push({
        updateOne: {
          filter: { securityId },
          update: {
            $set: {
              securityId,
              symbol: stock.UNDERLYING_SYMBOL,
              symbolName: stock.SYMBOL_NAME,
              breakoutType,
              percentageChange: parseFloat(percentageChange.toFixed(2)),
              currentHigh: data.current.high.toFixed(2),
              currentLow: data.current.low.toFixed(2),
              currentClose: data.current.close.toFixed(2),
              rangeHigh: rangeHigh.toFixed(2),
              rangeLow: rangeLow.toFixed(2),
              timeframe: `${days}-day`,
              timestamp: new Date()
            }
          },
          upsert: true
        }
      });
    }

    if (bulkOps.length > 0) {
      await Model.bulkWrite(bulkOps);
    }

    return { 
      success: true,
      count: bulkOps.length,
      message: `Found ${bulkOps.length} ${days}-day range breakouts`,
      date: currentDate
    };

  } catch (error) {
    console.error(`${days}-day range breaker error:`, error);
    return {
      success: false,
      message: `Failed to process ${days}-day range breakers`,
      error: error.message
    };
  }
};

const fiveDayRangeBreakers = async (req, res) => {
  const result = await processRangeBreakers(5, FiveDayRangeBreakerModel);
  
  if (res) {
    // Called as API route
    return res.status(result.success ? 200 : 500).json(result);
  }
  
  // Called from job
  return result;
};

const tenDayRangeBreakers = async (req, res) => {
  const result = await processRangeBreakers(10, TenDayRangeBreakerModel);
  
  if (res) {
    // Called as API route
    return res.status(result.success ? 200 : 500).json(result);
  }
  
  // Called from job
  return result;
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
      const response = { message: "Need at least 3 trading days" };
      return res ? res.status(400).json(response) : response;
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
      const { dayOpen: currOpen, dayClose: currClose } = data.current;
      
      // Previous candle values
      const { dayOpen: prevOpen, dayClose: prevClose } = data.prev;
      
      // Pre-previous candle values
      const { dayClose: prevPrevClose } = data.prevPrev;
      
      // Skip if any invalid values
      if ([currOpen, currClose, prevOpen, prevClose, prevPrevClose].some(v => v === undefined || v === 0)) continue;
      
      // Skip low-priced stocks
      if (prevClose < 1 || prevPrevClose < 1) continue;

      // Calculate percentage changes
      const prevCandleChange = ((prevClose - prevPrevClose) / prevPrevClose) * 100;
      const currCandleChange = ((currClose - prevClose) / prevClose) * 100;
      
      // Absolute values for comparison
      const absPrevChange = Math.abs(prevCandleChange);
      const absCurrChange = Math.abs(currCandleChange);
      
      // Minimum 2% movement in previous candle
      if (absPrevChange < 2) continue;
      
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
    
    return res ? res.status(200).json(response) : response;

  } catch (error) {
    console.error("Daily reversal error:", error);
    const response = { 
      success: false,
      message: "Internal server error",
      error: error.message 
    };
    return res ? res.status(500).json(response) : response;
  }
};
const AIContraction = async (req, res) => {
  try {
    // 1. Get last 7 trading days
    const tradingDays = await MarketDetailData.aggregate([
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } },
      { $limit: 7 }
    ]);

    if (tradingDays.length < 7) {
      return res?.status(400).json({ 
        success: false,
        message: "Need at least 7 trading days" 
      }) || { 
        success: false,
        message: "Need at least 7 trading days" 
      };
    }

    const dates = tradingDays.map(d => d._id);
    const currentDate = dates[0];

    // 2. Fetch market data with required fields
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

    // 4. Organize data by security and calculate candle bodies
    const securityData = new Map();
    
    marketData.forEach(entry => {
      if (!securityData.has(entry.securityId)) {
        securityData.set(entry.securityId, {
          candles: []
        });
      }
      
      const candleData = entry.data[0];
      securityData.get(entry.securityId).candles.push({
        date: entry.date,
        open: candleData.dayOpen,
        close: candleData.dayClose,
        latestPrice: candleData.latestTradedPrice,
        bodySize: Math.abs(candleData.dayOpen - candleData.dayClose)
      });
    });

    // 5. Find contraction patterns (smallest body only)
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
      
      // Check if current candle has the smallest body
      const isSmallestBody = previousCandles.every(c => 
        currentCandle.bodySize < c.bodySize
      );

      if (isSmallestBody) {
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
                currentRange: "0.00", 
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
      message: `Found ${bulkOps.length} stocks with smallest body today`,
      date: currentDate
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
  const response = {
    success: false,
    message: "",
    data: null,
    count: 0
  };

  try {
    // 1. Get last 5 trading days (reference day + 3 consolidation days + current day)
    const tradingDays = await MarketDetailData.aggregate([
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } },
      { $limit: 5 }
    ]);

    if (tradingDays.length < 5) {
      response.message = "Need at least 5 trading days of data";
      return res?.status(400).json(response) || response;
    }

    const dates = tradingDays.map(d => d._id);
    const [currentDate, prevDate1, prevDate2, prevDate3, refDate] = dates;

    // 2. Fetch only closing prices for efficiency
    const marketData = await MarketDetailData.find(
      { date: { $in: dates } },
      {
        securityId: 1,
        "data.dayClose": 1,
        date: 1
      }
    ).lean();

    // 3. Get stock metadata
    const stockMap = new Map();
    (await StocksDetail.find({}, { 
      SECURITY_ID: 1, 
      UNDERLYING_SYMBOL: 1, 
      SYMBOL_NAME: 1 
    })).forEach(stock => {
      stockMap.set(stock.SECURITY_ID, stock);
    });

    // 4. Organize data by security
    const securityData = new Map();
    marketData.forEach(entry => {
      if (!securityData.has(entry.securityId)) {
        securityData.set(entry.securityId, {});
      }
      securityData.get(entry.securityId)[entry.date] = entry.data[0].dayClose;
    });

    // 5. Analyze for breakout/breakdown patterns
    const results = [];
    
    for (const [securityId, closes] of securityData) {
      // Skip if we don't have all 5 days of data
      if (Object.keys(closes).length !== 5) continue;

      const refClose = closes[refDate];
      const upperBound = refClose * 1.02;  // 2% upper buffer
      const lowerBound = refClose * 0.98;  // 2% lower buffer

      // Check if middle 3 days are within the 2% range
      const consolidationDays = [prevDate3, prevDate2, prevDate1];
      const isConsolidating = consolidationDays.every(date => {
        const close = closes[date];
        return close >= lowerBound && close <= upperBound;
      });

      if (!isConsolidating) continue;

      // Check current day for breakout/breakdown
      const currentClose = closes[currentDate];
      let trend = null;
      
      if (currentClose > upperBound) {
        trend = "BULLISH";
      } else if (currentClose < lowerBound) {
        trend = "BEARISH";
      }

      if (trend) {
        const stock = stockMap.get(securityId);
        const prevDayChange = ((currentClose - closes[prevDate1]) / closes[prevDate1] * 100);
        const refChange = ((currentClose - refClose) / refClose * 100);

        results.push({
          securityId,
          SYMBOL_NAME: stock?.SYMBOL_NAME || "Unknown",
          UNDERLYING_SYMBOL: stock?.UNDERLYING_SYMBOL || "Unknown",
          fstPreviousDayChange: parseFloat(prevDayChange.toFixed(2)),
          persentageChange: parseFloat(refChange.toFixed(2)),
          trend,
          timestamp: new Date()
        });
      }
    }

    // 6. Bulk upsert results
    if (results.length > 0) {
      const bulkOps = results.map(item => ({
        updateOne: {
          filter: { securityId: item.securityId },
          update: { $set: item },
          upsert: true
        }
      }));
      await CandleBreakoutBreakdown.bulkWrite(bulkOps);
    }

    // 7. Prepare final response
    response.success = true;
    response.count = results.length;
    response.message = `Found ${results.length} breakout patterns`;
    response.data = results;

    return res?.json(response) || response;

  } catch (error) {
    console.error("Breakout detection error:", error);
    response.message = "Internal server error";
    response.error = error.message;
    return res?.status(500).json(response) || response;
  }
};




export {
  fiveDayRangeBreakers,//change check with the dayClose instead of latestTradedPrice
  tenDayRangeBreakers,//change check with the dayClose instead of latestTradedPrice
  dailyCandleReversal,
  AIContraction,
  candleBreakoutBreakdown
};
