import WebSocket from "ws";
import connectDB from "../config/db.js";
import StocksDetail from "../models/stocksDetail.model.js";
import parseBinaryData from "../utils/parseBinaryData.js";
import { stocksData } from "../f&o.js";
import {
  fetchDailyHistoricalData,
  fetchHistoricalData,
  fetchHistoricalDataforTenMin,
} from "../utils/fetchData.js";
import DailyMomentumSignal from "../models/dailyMomentumSignal.model.js";
import MarketDetailData from "../models/marketData.model.js";
import MomentumStockFiveMin from "../models/momentumStockFiveMin.model.js";
import MomentumStockTenMin from "../models/momentumStockTenMin.model.js";
import DailyRangeBreakouts from "../models/dailyRangeBreakout.model.js";
import { getDayHighBreak, getDayLowBreak } from "../utils/DayHighLow.js";
import HighLowReversal from "../models/highLowReversal.model.js";
import TwoDayHighLowBreak from "../models/twoDayHighLowBreak.model.js";
import FiveMinCandles from "../models/fiveMinCandles.model.js";
import IntradayReversalFiveMin from "../models/fiveMinMomentumSignal.model.js";

const ACCESS_TOKEN = process.env.DHAN_ACCESS_TOKEN;
const CLIENT_ID = process.env.DHAN_CLIENT_ID;
const WS_URL = `wss://api-feed.dhan.co?version=2&token=${ACCESS_TOKEN}&clientId=${CLIENT_ID}&authType=2`;


const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

import redis from "../config/redisClient.js"; 

let securityIdList = [];
let totalSecurityIds = 0;
const securityIdMap = new Map();
let marketDataBuffer = new Map();

let receivedSecurityIds = new Set();
let isProcessingSave = false;

const fetchSecurityIds = async () => {
  try {
    const stocks = await StocksDetail.find({}, { SECURITY_ID: 1, _id: 0 });
    securityIdList = stocks.map((stock) => stock.SECURITY_ID);
    totalSecurityIds = securityIdList.length;
  } catch (error) {
    console.error("❌ Error fetching security IDs:", error);
    throw error;
  }
};

const splitIntoBatches = (array, batchSize) => {
  const batches = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i + 0, i + batchSize));
  }
  return batches;
};

const calculateTurnover = (avgPrice, volume) => {
  return Number(avgPrice * volume).toFixed(2);
};

const saveMarketData = async () => {
  console.log("📝 Saving market data to MongoDB");
  const todayDate = new Date().toISOString().split("T")[0];
  let successCount = 0;
  let errorCount = 0;

  for (const [securityId, marketData] of marketDataBuffer.entries()) {
    if (!marketData || !marketData.length || !marketData[0]) continue;

    const turnover = calculateTurnover(
      marketData[0].avgTradePrice,
      marketData[0].volume
    );

    try {
      await MarketDetailData.findOneAndUpdate(
        { date: todayDate, securityId },
        { $set: { data: marketData, turnover } },
        { upsert: true, new: true }
      );
      successCount++;
    } catch (err) {
      console.error(`❌ DB error for ${securityId}: ${err.message}`);
      errorCount++;
    }
  }

  console.log(
    `✅ Saved to DB | Success: ${successCount}, Errors: ${errorCount}`
  );
  marketDataBuffer.clear();
  receivedSecurityIds.clear();
  isProcessingSave = false;
};

const saveToRedis = async (securityId, data) => {
  try {
    await redis.set(`market:${securityId}`, JSON.stringify(data));
    // Optional TTL: await redis.expire(`market:${securityId}`, 300);
  } catch (err) {
    console.error(`❌ Redis Save Error for ${securityId}: ${err.message}`);
  }
};

async function startWebSocket() {
  console.log("🔄 Fetching security IDs...");
  await fetchSecurityIds();

  if (securityIdList.length === 0) {
    console.error("❌ No security IDs found. WebSocket will not start.");
    return;
  }

  const batchSize = 100;
  const securityIdBatches = splitIntoBatches(securityIdList, batchSize);

  const ws = new WebSocket(WS_URL, {
    perMessageDeflate: false,
    maxPayload: 1024 * 1024,
  });

  ws.on("open", () => {
    console.log("✅ Connected to WebSocket");

    securityIdBatches.forEach((batch, index) => {
      setTimeout(() => {
        securityIdMap.set(index, batch);

        const subscriptionRequest = {
          RequestCode: 21,
          InstrumentCount: batch.length,
          InstrumentList: batch.map((securityId) => ({
            ExchangeSegment: "NSE_EQ",
            SecurityId: securityId,
          })),
        };

        ws.send(JSON.stringify(subscriptionRequest));
        console.log(`📩 Subscribed Batch ${index + 1}`);
      }, index * 5000);
    });
  });

  ws.on("message", async (data) => {
    if (isProcessingSave) return;

    try {
      const marketData = parseBinaryData(data);

      if (marketData && marketData.securityId) {
        const securityId = marketData.securityId;

        if (!marketDataBuffer.has(securityId)) {
          marketDataBuffer.set(securityId, []);
        }

        marketDataBuffer.get(securityId).push(marketData);
        receivedSecurityIds.add(securityId);

        // ✅ Check if all expected security IDs received at least one data
        if (receivedSecurityIds.size === totalSecurityIds) {
          console.log("✅ All market data received. Saving to Redis...");
          isProcessingSave = true;

          for (const [secId, data] of marketDataBuffer.entries()) {
            await saveToRedis(secId, data);
          }

          console.log("⏳ Waiting 5 minutes before saving to MongoDB...");
          setTimeout(async () => {
            await saveMarketData();
          }, 5 * 60 * 1000);
        }
      } else {
        console.warn("⚠️ Invalid market data received.");
      }
    } catch (error) {
      console.error("❌ Error processing market data:", error.message);
    }
  });

  ws.on("error", (error) => {
    console.error("❌ WebSocket Error:", error.message);
  });

  ws.on("close", () => {
    console.log("🔄 WebSocket disconnected. Reconnecting...");
    isProcessingSave = false;
    receivedSecurityIds.clear();
    setTimeout(startWebSocket, 2000);
  });
}

const getData = async (fromDate, toDate) => {
    const stocks = await StocksDetail.find({}, { SECURITY_ID: 1, _id: 0 });
    const securityIds = stocks.map((stock) => stock.SECURITY_ID.trim().toString());
  
    function convertToIST(unixTimestamp) {
      const date = new Date(unixTimestamp * 1000);
      return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    }
  
    try {
      // === STEP 1: Process 5-Minute Candles ===
      for (let i = 0; i < securityIds.length; i++) {
        const id = securityIds[i];
        const redisKey5 = `stockFiveMinCandle:${id}:${fromDate}-${toDate}`;
        let data5 = await redis.get(redisKey5);
  
        if (data5) {
          console.log(`🔁 [Redis] 5-min data fetched for ${id} (${i + 1}/${securityIds.length})`);
        } else {
          const rawData = await fetchHistoricalData(id, fromDate, toDate, i, "5");
          if (rawData) {
            const formatted5 = {
              open: rawData.open.slice(-5),
              high: rawData.high.slice(-5),
              low: rawData.low.slice(-5),
              close: rawData.close.slice(-5),
              volume: rawData.volume.slice(-5),
              timestamp: rawData.timestamp.slice(-5).map(convertToIST),
              securityId: id,
            };
  
            await redis.set(redisKey5, JSON.stringify(formatted5), "EX", 300);
            console.log(`🌐 [API] 5-min data fetched & cached for ${id} (${i + 1}/${securityIds.length})`);
          } else {
            console.warn(`⚠️ [API] No 5-min data for ${id}`);
          }
        }
  
        await delay(200);
      }
  
      console.log("✅ Completed all 5-minute candle data for all stocks.");
  
      // === STEP 2: Process 15-Minute Candles ===
      for (let i = 0; i < securityIds.length; i++) {
        const id = securityIds[i];
        const redisKey15 = `stockFifteenMinCandle:${id}:${fromDate}-${toDate}`;
        let data15 = await redis.get(redisKey15);
  
        if (data15) {
          console.log(`🔁 [Redis] 15-min data fetched for ${id} (${i + 1}/${securityIds.length})`);
        } else {
          const rawData = await fetchHistoricalData(id, fromDate, toDate, i, "15");
          if (rawData) {
            const formatted15 = {
              open: rawData.open.slice(-5),
              high: rawData.high.slice(-5),
              low: rawData.low.slice(-5),
              close: rawData.close.slice(-5),
              volume: rawData.volume.slice(-5),
              timestamp: rawData.timestamp.slice(-5).map(convertToIST),
              securityId: id,
            };
  
            await redis.set(redisKey15, JSON.stringify(formatted15), "EX", 900);
            console.log(`🌐 [API] 15-min data fetched & cached for ${id} (${i + 1}/${securityIds.length})`);
          } else {
            console.warn(`⚠️ [API] No 15-min data for ${id}`);
          }
        }
  
        await delay(200);
      }
  
      console.log("✅ Completed all 15-minute candle data for all stocks.");
    } catch (error) {
      console.error("❌ Error in getData:", error.message);
    }
  };
  
  
  

const getDataForTenMin = async (fromDate, toDate) => {
  const stocks = await StocksDetail.find({}, { SECURITY_ID: 1, _id: 0 });
  const securityIds = stocks.map((stock) =>
    stock.SECURITY_ID.trim().toString()
  );

  function convertToIST(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  }

  try {
    const convertFiveToTenMinCandle = (fiveMinCandles) => {
      const tenMinCandle = [];

      const len = fiveMinCandles.open.length;
      const isOdd = len % 2 !== 0;
      const loopUntil = isOdd ? len - 1 : len;

      // Process full 10-min candles
      for (let i = 0; i < loopUntil; i += 2) {
        tenMinCandle.push({
          open: fiveMinCandles.open[i],
          close: fiveMinCandles.close[i + 1],
          high: Math.max(fiveMinCandles.high[i], fiveMinCandles.high[i + 1]),
          low: Math.min(fiveMinCandles.low[i], fiveMinCandles.low[i + 1]),
          volume: fiveMinCandles.volume[i] + fiveMinCandles.volume[i + 1],
          timestamp: fiveMinCandles.timestamp[i],
        });
      }

      // Handle last remaining 5-min candle as-is
      if (isOdd) {
        const i = len - 1;
        tenMinCandle.push({
          open: fiveMinCandles.open[i],
          close: fiveMinCandles.close[i],
          high: fiveMinCandles.high[i],
          low: fiveMinCandles.low[i],
          volume: fiveMinCandles.volume[i],
          timestamp: fiveMinCandles.timestamp[i], // This should be "9/4/2025, 3:25:00 pm"
        });
      }

      return tenMinCandle;
    };

    const finalData = [];

    for (let i = 0; i < securityIds.length; i++) {
      const securityId = securityIds[i];
      const redisKey = `stockTenMinCandle:${securityId}:${fromDate}-${toDate}`;

      let redisFormattedData;

      const cachedData = false; //await redis.get(redisKey);
      if (cachedData) {
        // console.log(`Fetched from Redis: ${securityId}`);
        redisFormattedData = JSON.parse(cachedData);
      } else {
        const rawData = await fetchHistoricalData(
          securityId,
          fromDate,
          toDate,
          i
        );

        if (!rawData || !rawData.timestamp?.length) {
        //   console.warn(`No data for: ${securityId}`);
          continue;
        }

        const formattedData = {
          open: rawData.open,
          high: rawData.high,
          low: rawData.low,
          close: rawData.close,
          volume: rawData.volume,
          timestamp: rawData.timestamp.map(convertToIST),
        };

        const tenMinCandles = convertFiveToTenMinCandle(formattedData);

        if (!tenMinCandles.length) continue;

        // Get last 5 ten-min candles
        const latest = tenMinCandles.slice(-5);

        redisFormattedData = {
          open: latest.map((c) => c.open),
          high: latest.map((c) => c.high),
          low: latest.map((c) => c.low),
          close: latest.map((c) => c.close),
          volume: latest.map((c) => c.volume),
          timestamp: latest.map((c) => c.timestamp),
          securityId: securityId,
        };

        // Store in Redis in your required format
        await redis.set(
          redisKey,
          JSON.stringify(redisFormattedData),
          "EX",
          600
        );
        // console.log(`Fetched from API and cached: ${securityId}`);
      }

      finalData.push(redisFormattedData);
      await delay(200);
    }

    if (finalData.length > 0) {
      console.log(`Formatted and cached data for ${finalData.length} stocks.`);
      return finalData;
    } else {
      console.log("No valid data to return.");
      return [];
    }
  } catch (error) {
    console.error("Error in getDataForTenMin:", error.message);
    return [];
  }
};


function getFormattedTimestamp() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  let hours = now.getHours();
  const rawMinutes = now.getMinutes();
  const roundedMinutes = Math.floor(rawMinutes / 5) * 5;
  const minutes = String(roundedMinutes).padStart(2, "0");

  // Convert to 12-hour format
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12; // 0 should be 12 in 12-hour format

  const formattedHours = String(hours).padStart(2, "0");

  return `${year}-${month}-${day} ${formattedHours}:${minutes} ${period}`;
}

const AIIntradayReversalFiveMins = async (req, res) => {
  try {
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date")
      .limit(1);

    if (!latestEntry) {
      return { message: "No stock data available" };
      // res.status(404).json({ message: "No stock data available" });
    }

    const latestDate = latestEntry.date;

    const tomorrow = new Date(latestDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrowFormatted = tomorrow.toISOString().split("T")[0];

    const previousEntry = await MarketDetailData.findOne({
      date: { $lt: latestDate },
    })
      .sort({ date: -1 })
      .limit(1);

    if (!previousEntry || previousEntry.length === 0) {
      return { message: "Can't get data because date is not available" };
      //  res
      //   .status(404)
      //   .json({ message: "Can't get data because date is not available" });
    }

    const latestData = await MarketDetailData.find(
      { date: latestDate },
      {
        securityId: 1,
        data: 1,
        _id: 0,
      }
    );

    if (!latestData || latestData.length === 0) {
      return res
        .status(404)
        .json({ message: "No latest stock data available" });
    }

    const latestDataMap = new Map();
    const securityIds = [];

    latestData.forEach((entry) => {
      securityIds.push(entry.securityId.trim().toString());
      latestDataMap.set(
        entry.securityId,
        entry.data?.latestTradedPrice?.[0] || 0
      );
    });

    const previousDate = previousEntry.date;

    const previousData = await MarketDetailData.find(
      { date: previousDate },
      {
        securityId: 1,
        data: 1,
        _id: 0,
      }
    );

    if (!previousData || previousData.length === 0) {
      return res
        .status(404)
        .json({ message: "No previous stock data available" });
    }

    const previousDayDataMap = new Map();

    previousData.forEach((entry) => {
      // console.log('entry',entry.data.dayClose?.[0]);
      previousDayDataMap.set(entry.securityId, entry.data?.dayClose?.[0] || 0);
    });

    function convertToIST(unixTimestamp) {
      const date = new Date(unixTimestamp * 1000); // Convert to milliseconds
      return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    }

    const updatedData = [];
    let data;
    for (let i = 0; i < securityIds.length; i++) {
      // const data = await fetchHistoricalData(
      //   securityIds[i],
      //   fromDate,
      //   toDate,
      //   i
      // );
      const redisKey = `stockFiveMinCandle:${securityIds[i]}:${latestDate}-${tomorrowFormatted}`;

      // Check Redis cache
      const cachedData = await redis.get(redisKey);
      if (cachedData) {
        // console.log(`Fetched from Redis: ${securityIds[i]}`);
        data = JSON.parse(cachedData);
      }

      if (!data) {
        console.warn(`No data found for Security ID: ${securityIds[i]}`);
        const data = await IntradayReversalFiveMin.find().lean()
        return { message: "data found",data:data.slice(0,30) };
          // Skip if data is missing
      }

      // Prepare the updated data
      updatedData.push({
        securityId: securityIds[i],
        timestamp: data.timestamp.slice(-5), // Convert all timestamps
        open: data.open.slice(-5),
        high: data.high.slice(-5),
        low: data.low.slice(-5),
        close: data.close.slice(-5),
        volume: data.volume.slice(-5),
      });
    }

    // Check if data is valid and a Map
    if (!updatedData) {
      return { message: "Invalid data format" }; //res.status(400).json({ message: "Invalid data format" });
    }
    // console.log("data from databse", data);
    // Convert Map to an array
    const dataArray = Array.from(updatedData.values());

    if (dataArray.length === 0) {
      return { message: "No data found" }; // res.status(404).json({ message: "No data found" });
    }

    // Fetch stock details
    const stocks = await StocksDetail.find(
      {},
      { SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1, SECURITY_ID: 1, _id: 0 }
    );
    if (!stocks || stocks.length === 0) {
      return { message: "No stocks data found" }; // res.status(404).json({ message: "No stocks data found" });
    }

    // Create a map for stock details
    const stockmap = new Map();
    stocks.forEach((entry) => {
      stockmap.set(entry.SECURITY_ID, {
        UNDERLYING_SYMBOL: entry.UNDERLYING_SYMBOL,
        SYMBOL_NAME: entry.SYMBOL_NAME,
      });
    });

    // Process data to detect momentum signals
    const results = dataArray.map((item) => {
      const momentumSignals = [];
      const securityId = item.securityId;
      const stock = stockmap.get(securityId);
      const latestTradedPrice = latestDataMap.get(securityId);
      const previousDayClose = previousDayDataMap.get(securityId);
      const latestTimestamp = item.timestamp[4];
      // Validate candle data structure
      if (
        !item.open ||
        !item.close ||
        item.open.length < 5 ||
        item.close.length < 5
      ) {
        console.warn(`Skipping ${securityId} due to insufficient data`);
        return [];
      }

      // Get last 5 candles (4 previous + latest)
      const lastFiveOpen = item.open.slice(-5);
      const lastFiveClose = item.close.slice(-5);

      // Extract latest candle
      const latestOpen = lastFiveOpen[4];
      const latestClose = lastFiveClose[4];

      // Get previous 4 candles
      const prevFourHigh = lastFiveOpen.slice(0, 4);
      const prevFourLow = lastFiveClose.slice(0, 4);

      const overAllPercentageChange =
        ((latestTradedPrice - previousDayClose) / previousDayClose) * 100; //this compare with prev day close and today latest price

      // Calculate percentage changes for previous 4 candles
      const percentageChanges = prevFourLow
        .map((low, i) =>
          i > 0 ? ((low - prevFourLow[i - 1]) / prevFourLow[i - 1]) * 100 : 0
        )
        .slice(1); // [change from 0->1, 1->2, 2->3]

      // Check bearish momentum loss (4 negative candles followed by positive)
      const allBearish = percentageChanges.every((change) => change < 0);
      const decreasingMomentum = percentageChanges.every(
        (change, i) =>
          i === 0 || Math.abs(change) < Math.abs(percentageChanges[i - 1])
      );
      const latestPositive = latestOpen > lastFiveOpen[3];

      // Debug logging for Bullish Reversal

      if (allBearish && decreasingMomentum && latestPositive) {
        momentumSignals.push({
          type: "Bullish",
          securityId,
          stockSymbol: stock?.UNDERLYING_SYMBOL || "N/A",
          stockName: stock?.SYMBOL_NAME || "N/A",
          lastTradePrice: latestOpen,
          previousClosePrice: lastFiveClose[3],
          overAllPercentageChange,
          timestamp: latestTimestamp,
        });
      }

      const percentageChangesForHigh = prevFourHigh
        .map((low, i) =>
          i > 0 ? ((low - prevFourHigh[i - 1]) / prevFourHigh[i - 1]) * 100 : 0
        )
        .slice(1);

      // Check bullish momentum loss (4 positive candles followed by negative)
      const allBullish = percentageChangesForHigh.every((change) => change > 0);
      const decreasingBullMomentum = percentageChangesForHigh.every(
        (change, i) => i === 0 || change < percentageChangesForHigh[i - 1]
      );
      const latestNegative = latestClose < lastFiveClose[3];

      if (allBullish && decreasingBullMomentum && latestNegative) {
        momentumSignals.push({
          type: "Bearish",
          securityId,
          stockSymbol: stock?.UNDERLYING_SYMBOL || "N/A",
          stockName: stock?.SYMBOL_NAME || "N/A",
          lastTradePrice: latestClose,

          overAllPercentageChange,
          timestamp: latestTimestamp,
        });
      }

      return momentumSignals;
    });

    // Flatten the results array and filter out empty entries
    const finalResults = results.flat().filter((signal) => signal.length !== 0);

    if (finalResults.length > 0) {
      const savePromises = finalResults.map(async (signal) => {
        try {
          await IntradayReversalFiveMin.findOneAndUpdate(
            { securityId: signal.securityId }, // Find by securityId
            {
              $set: {
                type: signal.type,
                stockSymbol: signal.stockSymbol,
                stockName: signal.stockName,
                lastTradePrice: signal.lastTradePrice,
                previousClosePrice: signal.previousClosePrice,
                percentageChange: signal.percentageChange,
                overAllPercentageChange: signal.overAllPercentageChange,
                timestamp: signal.timestamp,
              },
            },
            { upsert: true, new: true } // Upsert: insert if not found, update if found; return updated doc
          );
        } catch (dbError) {
          console.error(`Error saving/updating ${signal.securityId}:`, dbError);
        }
      });

      await Promise.all(savePromises);
    }
    const fullData = await IntradayReversalFiveMin.find(
      {},
      {
        _id: 0,
        __v: 0,
        lastTradePrice: 0,
        previousClosePrice: 0,
        updatedAt: 0,
      }
    )
      .sort({ timestamp: -1 })
      .lean();
    // Send response
    if (fullData.length === 0) {
      return res.status(200).json({
        message: "No momentum signals detected",
        data: [],
      });
    }

    return {
      message: "Momentum analysis complete",
      data: fullData.slice(0, 30),
    };

    // res.status(200).json({
    //   message: "Momentum analysis complete",
    //   data: fullData,
    // });
  } catch (error) {
    return {
      message: "Internal server error",
      error: error.message,
    };

    // res.status(500).json({
    //   message: "Internal server error",
    //   error: error.message,
    // });
  }
};

const AIIntradayReversalDaily = async (req, res) => {
  try {
    // Fetch the latest 5 trading days
    const uniqueTradingDays = await MarketDetailData.aggregate([
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } },
      { $limit: 5 },
    ]);

    if (uniqueTradingDays.length < 5) {
      return { message: "Not enough historical data found" };
    }

    const targetDates = uniqueTradingDays.map(
      (day) => new Date(day._id).toISOString().split("T")[0]
    );

    const latestDate = targetDates[0];
    const previousFormatted = targetDates[1];

    // Fetch historical data for target dates
    const historicalData = await MarketDetailData.find(
      { date: { $in: targetDates } },
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
    ).lean();

    if (!historicalData || historicalData.length === 0) {
      return { message: "No data found for the target dates" };
    }

    // Group data by dates
    const groupedData = targetDates.reduce((acc, date) => {
      const dateStr = date;
      acc[dateStr] = historicalData.filter((entry) => {
        const entryDateStr = new Date(entry.date).toISOString().split("T")[0];
        return entryDateStr === dateStr;
      });
      return acc;
    }, {});

    // Create maps for latest data and previous day close
    const latestDataMap = new Map();
    const prevDayCloseMap = new Map();

    groupedData[latestDate].forEach((entry) => {
      latestDataMap.set(entry.securityId, {
        latestTradedPrice: entry.data?.[0]?.latestTradedPrice ?? 0,
        dayOpen: entry.data?.[0]?.dayOpen ?? 0,
        dayClose: entry.data?.[0]?.dayClose ?? 0,
        dayHigh: entry.data?.[0]?.dayHigh ?? 0,
        dayLow: entry.data?.[0]?.dayLow ?? 0,
      });
    });

    groupedData[previousFormatted].forEach((entry) => {
      prevDayCloseMap.set(entry.securityId, {
        dayClose: entry.data?.[0]?.dayClose ?? 0,
      });
    });

    // Fetch stock details
    const stocks = await StocksDetail.find(
      {},
      { SECURITY_ID: 1, SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1, _id: 0 }
    );

    // Create stock map
    const stockMap = new Map();
    stocks.forEach((entry) => {
      stockMap.set(entry.SECURITY_ID, {
        UNDERLYING_SYMBOL: entry.UNDERLYING_SYMBOL || "N/A",
        SYMBOL_NAME: entry.SYMBOL_NAME || "N/A",
      });
    });

    let momentumSignals = [];
    const securityIds = [
      ...new Set(historicalData.map((item) => item.securityId)),
    ];

    for (const securityId of securityIds) {
      const stockData = targetDates.map((date) => {
        return groupedData[date].find(
          (entry) => entry.securityId === securityId
        );
      });

      if (stockData.length < 5 || stockData.some((day) => !day)) continue;

      const todayData = latestDataMap.get(securityId);
      const preCloseData = prevDayCloseMap.get(securityId);

      if (!todayData || !preCloseData) continue;

      // Extract closing prices for analysis - first 4 entries are previous days, last one is today
      // We'll use the closing prices to determine the candle direction
      const closePrices = stockData
        .map((day) => day.data?.[0]?.dayClose ?? 0)
        .reverse();

      const openPrices = stockData
        .map((day) => day.data?.[0]?.dayOpen ?? 0)
        .reverse();

      // Calculate candle directions (positive or negative) for previous 4 days
      const candleDirections = [];
      for (let i = 0; i < 4; i++) {
        // Positive candle if close > open, negative otherwise
        candleDirections.push(closePrices[i] > openPrices[i] ? 1 : -1);
      }

      // Calculate percentage changes between consecutive days for previous 4 days
      const percentageChanges = [];
      for (let i = 1; i < 4; i++) {
        const change =
          ((closePrices[i] - closePrices[i - 1]) / closePrices[i - 1]) * 100;
        percentageChanges.push(change);
      }

      // Latest day (today)
      const todayDirection = closePrices[4] > openPrices[4] ? 1 : -1;
      const latestTradedPrice = todayData.latestTradedPrice;
      const previousDayClose = preCloseData.dayClose;

      // Check for bearish momentum loss (4 negative candles with decreasing momentum, followed by positive)
      const allBearish = candleDirections.every((dir) => dir < 0);

      // Check if bearish momentum is decreasing (each negative percentage change is smaller in magnitude)
      const decreasingBearishMomentum =
        percentageChanges.length === 3 &&
        percentageChanges.every(
          (change, i) =>
            i === 0 || Math.abs(change) < Math.abs(percentageChanges[i - 1])
        );

      // Check if today's candle is positive
      const latestPositive = todayDirection > 0;

      if (allBearish && decreasingBearishMomentum && latestPositive) {
        momentumSignals.push({
          type: "Bullish ",
          securityId,
          stockSymbol: stockMap.get(securityId)?.UNDERLYING_SYMBOL || "N/A",
          stockName: stockMap.get(securityId)?.SYMBOL_NAME || "N/A",
          lastTradePrice: latestTradedPrice,
          previousClosePrice: previousDayClose,
          timestamp: getFormattedTimestamp(),
          percentageChange:
            ((latestTradedPrice - previousDayClose) / previousDayClose) * 100,
        });
      }

      // Check for bullish momentum loss (4 positive candles with decreasing momentum, followed by negative)
      const allBullish = candleDirections.every((dir) => dir > 0);

      // Check if bullish momentum is decreasing (each positive percentage change is smaller)
      const decreasingBullishMomentum =
        percentageChanges.length === 3 &&
        percentageChanges.every(
          (change, i) => i === 0 || change < percentageChanges[i - 1]
        );

      // Check if today's candle is negative
      const latestNegative = todayDirection < 0;

      if (allBullish && decreasingBullishMomentum && latestNegative) {
        momentumSignals.push({
          type: "Bearish ",
          securityId,
          stockSymbol: stockMap.get(securityId)?.UNDERLYING_SYMBOL || "N/A",
          stockName: stockMap.get(securityId)?.SYMBOL_NAME || "N/A",
          lastTradePrice: latestTradedPrice,
          previousClosePrice: previousDayClose,
          timestamp: getFormattedTimestamp(),
          percentageChange:
            ((latestTradedPrice - previousDayClose) / previousDayClose) * 100,
        });
      }
    }

    // Save momentum signals to database
    if (momentumSignals.length > 0) {
      await Promise.all(
        momentumSignals.map(async (signal) => {
          await DailyMomentumSignal.findOneAndUpdate(
            { securityId: signal.securityId },
            {
              $set: {
                type: signal.type,
                stockSymbol: signal.stockSymbol,
                stockName: signal.stockName,
                lastTradePrice: signal.lastTradePrice,
                previousClosePrice: signal.previousClosePrice,
                percentageChange: signal.percentageChange,
                timestamp: signal.timestamp,
              },
            },
            { upsert: true, new: true }
          );
        })
      );
    }

    const fullData = await DailyMomentumSignal.find(
      {},
      {
        _id: 0,
        __v: 0,
        lastTradePrice: 0,
        previousClosePrice: 0,
        updatedAt: 0,
        createdAt: 0,
      }
    )
      .sort({ timestamp: -1 })
      .lean();

    return {
      message: "Momentum analysis complete",
      data: fullData,
    };
  } catch (error) {
    console.error("Error in AIIntradayReversalDaily:", error);
    return {
      message: "Internal server error",
      error: error.message,
    };
  }
};

const AIMomentumCatcherFiveMins = async (req, res) => {
  try {
    const stocks = await StocksDetail.find(
      {},
      { SECURITY_ID: 1, SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1, _id: 0 }
    );
    if (!stocks || stocks.length === 0) {
      return { message: "No stocks data found" };
    }

    const stockmap = new Map();
    stocks.forEach((entry) => {
      stockmap.set(entry.SECURITY_ID, {
        UNDERLYING_SYMBOL: entry.UNDERLYING_SYMBOL,
        SYMBOL_NAME: entry.SYMBOL_NAME,
      });
    });

    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date");

    if (!latestEntry) {
      return { message: "No stock data available" };
    }

    const latestDate = latestEntry.date;
    const latestData = await MarketDetailData.find({ date: latestDate });

    if (latestData.length === 0) {
      return { message: "No stock data available for the latest date" };
    }

    const previousDayEntry = await MarketDetailData.findOne(
      { date: { $lt: latestDate } },
      { date: 1 }
    ).sort({ date: -1 });

    if (!previousDayEntry) {
      return { message: "No previous stock data available" };
    }

    const previousDayDate = previousDayEntry.date;
    const yesterdayData = await MarketDetailData.find({
      date: previousDayDate,
    });
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

    const tomorrow = new Date(latestDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split("T")[0];

    const updatedData = [];
    let data;
    
    for (let i = 0; i < securityIds.length; i++) {
      const redisKey = `stockFiveMinCandle:${securityIds[i]}:${latestDate}-${tomorrowFormatted}`;

      // Check Redis cache
      const cachedData = await redis.get(redisKey);
      if (cachedData) {
        // console.log(`Fetched from Redis: ${securityIds[i]}`);
        data = JSON.parse(cachedData);
      }

      if (!data) {
        continue; // Skip if no data found
      }

      // Ensure we have at least 2 candles to compare
      if (data.high.length < 2 || data.low.length < 2) {
        continue;
      }

      // Get the last two candles
      const lastCandle = {
        high: data.high[data.high.length - 1],
        low: data.low[data.low.length - 1],
        close: data.close[data.close.length - 1],
        open: data.open[data.open.length - 1],
        timestamp: data.timestamp[data.timestamp.length - 1]
      };

      const secondLastCandle = {
        high: data.high[data.high.length - 2],
        low: data.low[data.low.length - 2],
        close: data.close[data.close.length - 2],
        open: data.open[data.open.length - 2],
        timestamp: data.timestamp[data.timestamp.length - 2]
      };

      // Prepare the updated data
      updatedData.push({
        securityId: securityIds[i],
        timestamp: [secondLastCandle.timestamp, lastCandle.timestamp],
        open: [secondLastCandle.open, lastCandle.open],
        high: [secondLastCandle.high, lastCandle.high],
        low: [secondLastCandle.low, lastCandle.low],
        close: [secondLastCandle.close, lastCandle.close],
        volume: data.volume.slice(-2),
      });
    }

    if (updatedData.length === 0) {
      const updatedDataFromDB = await MomentumStockFiveMin.find(
        {},
        {
          securityId: 1,
          symbol_name: 1,
          symbol: 1,
          _id: 0,
          momentumType: 1,
          timestamp: 1,
          percentageChange: 1,
        }
      );
      return {
        message: "No recent candle data found, returning existing momentum stocks",
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

        const preHighLowDiff = preHigh - preLow;
        const currentCloseOpenDiff = Math.abs(crrClose - crrOpen);
        
        // Check if the close-open difference of the last candle is twice the high-low difference of the second-to-last candle
        const hasMomentum = currentCloseOpenDiff === preHighLowDiff * 2;

        const isBullish = crrClose > crrOpen;
        const isBearish = crrClose < crrOpen;

        if (hasMomentum && (isBullish || isBearish)) {
          const stockDetails = stockmap.get(entry.securityId) || {};
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
            currentHigh: crrHigh,
            currentLow: crrLow,
            previousHigh: preHigh,
            previousLow: preLow,
            momentumType: isBullish ? "Bullish" : "Bearish",
            priceChange: currentCloseOpenDiff,
            percentageChange: percentageChange.toFixed(2),
            timestamp: latestTimestamp,
            candleTimeDiff: `${new Date(entry.timestamp[0]).toLocaleTimeString()} - ${new Date(entry.timestamp[1]).toLocaleTimeString()}`
          };
        }
        return null;
      })
      .filter((stock) => stock !== null);

    momentumStocks.sort(
      (a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange)
    );

    // Bulk update in MongoDB
    const bulkUpdates = momentumStocks.map((stock) => ({
      updateOne: {
        filter: { securityId: stock.securityId },
        update: { $set: stock },
        upsert: true,
      },
    }));
    
    if (bulkUpdates.length > 0) {
      await MomentumStockFiveMin.bulkWrite(bulkUpdates);
    }

    const updatedDataFromDB = await MomentumStockFiveMin.find(
      {},
      {
        securityId: 1,
        symbol_name: 1,
        symbol: 1,
        _id: 0,
        momentumType: 1,
        timestamp: 1,
        percentageChange: 1,
      }
    ).sort({ percentageChange: -1 }).limit(20);

    return {
      message: "Momentum stocks found and saved",
      count: momentumStocks.length,
      updatedData: updatedDataFromDB,
    };
  } catch (error) {
    console.error("Error in AIMomentumCatcherFiveMins:", error);
    return {
      message: "Internal server error",
      error: error.message,
    };
  }
};

const AIMomentumCatcherTenMins = async (req, res) => {
  try {
    const stocks = await StocksDetail.find(
      {},
      { SECURITY_ID: 1, SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1, _id: 0 }
    );
    if (!stocks || stocks.length === 0) {
      return { message: "No stocks data found" };
    }

    const stockmap = new Map();
    const securityIds = stocks.map(stock => stock.SECURITY_ID);
    stocks.forEach((entry) => {
      stockmap.set(entry.SECURITY_ID, {
        UNDERLYING_SYMBOL: entry.UNDERLYING_SYMBOL,
        SYMBOL_NAME: entry.SYMBOL_NAME,
      });
    });

    // Get latest market date
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date");
    if (!latestEntry) {
      return { message: "No stock data available" };
    }

    const latestDate = latestEntry.date;
    const latestData = await MarketDetailData.find({ date: latestDate });
    if (latestData.length === 0) {
      return { message: "No stock data available for the latest date" };
    }

    // Get previous day data for percentage change calculation
    const previousDayEntry = await MarketDetailData.findOne(
      { date: { $lt: latestDate } },
      { date: 1 }
    ).sort({ date: -1 });
    if (!previousDayEntry) {
      return { message: "No previous stock data available" };
    }

    const previousDayDate = previousDayEntry.date;
    const yesterdayData = await MarketDetailData.find({ date: previousDayDate });

    // Create maps for price data
    const latestDataMap = new Map(
      latestData.map(entry => [
        entry.securityId, 
        entry.data?.latestTradedPrice?.[0] || 0
      ])
    );

    const yesterdayMap = new Map(
      yesterdayData.map(entry => [
        entry.securityId, 
        entry.data?.dayClose?.[0] || 0
      ])
    );

    // Prepare date range for Redis key
    const tomorrow = new Date(latestDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split("T")[0];

    const momentumStocks = [];
    
    for (const securityId of securityIds) {
      const redisKey = `stockFiveMinCandle:${securityId}:${latestDate}-${tomorrowFormatted}`;

      // Check Redis cache
      const cachedData = await redis.get(redisKey);
      if (!cachedData) {
        console.warn(`No data found for Security ID: ${securityId}`);
        continue;
      }

      const data = JSON.parse(cachedData);

      // We need at least 4 candles for comparison (9:15, 9:25, 9:35, 9:45)
      if (data.high.length < 4 || data.low.length < 4) {
        continue;
      }

      // Process candles based on timestamp
      let hasMomentum = false;
      let currentHigh, currentLow, previousHigh, previousLow, momentumType, priceChange, timestamp, candleTimeRange, currentCandleTime;

      // Convert timestamps to comparable format and find indices for required times
      const candleData = data.timestamp.map((ts, index) => ({
        timestamp: new Date(ts),
        high: data.high[index],
        low: data.low[index],
        open: data.open[index],
        close: data.close[index]
      }));

      // Helper function to find candle by time
      const findCandleByTime = (hour, minute) => {
        return candleData.find(candle => {
          const time = candle.timestamp;
          return time.getHours() === hour && time.getMinutes() === minute;
        });
      };

      // Regular case: Check 9:15, 9:25, 9:35, 9:45 candles
      const candle915 = findCandleByTime(9, 15);
      const candle925 = findCandleByTime(9, 25);
      const candle935 = findCandleByTime(9, 35);
      const candle945 = findCandleByTime(9, 45);

      if (candle915 && candle925 && candle935 && candle945) {
        // Merge 9:15 and 9:25 candles
        previousHigh = Math.max(candle915.high, candle925.high);
        previousLow = Math.min(candle915.low, candle925.low);
        const previousRange = previousHigh - previousLow;

        // Check 9:35 open and 9:45 close difference
        const currentDiff = Math.abs(candle935.open - candle945.close);

        // Check conditions: previous range = 10 Rs, current diff = 20 Rs
        if (previousRange === 10 && currentDiff === 20) {
          hasMomentum = true;
          currentHigh = candle945.high;
          currentLow = candle945.low;
          const isBullish = candle945.close > candle935.open;
          const isBearish = candle945.close < candle935.open;
          momentumType = isBullish ? "Bullish" : (isBearish ? "Bearish" : null);
          priceChange = currentDiff;
          timestamp = candle945.timestamp;
          candleTimeRange = `${new Date(candle915.timestamp).toLocaleTimeString()} - ${new Date(candle925.timestamp).toLocaleTimeString()}`;
          currentCandleTime = `${new Date(candle935.timestamp).toLocaleTimeString()} - ${new Date(candle945.timestamp).toLocaleTimeString()}`;
        }
      }

      // Special case: Check 3:25 candle (both 5-min and 10-min logic)
      const candle325 = findCandleByTime(15, 25);
      if (candle325) {
        const prevCandleIndex = candleData.findIndex(c => c.timestamp.getTime() === candle325.timestamp.getTime()) - 1;
        const prevCandle = prevCandleIndex >= 0 ? candleData[prevCandleIndex] : null;

        if (prevCandle) {
          // For 10-min logic: Merge with previous candle
          previousHigh = Math.max(prevCandle.high, candle325.high);
          previousLow = Math.min(prevCandle.low, candle325.low);
          const previousRange = previousHigh - previousLow;
          const currentDiff = candle325.high - candle325.low;

          if (previousRange === 10 && currentDiff === 20) {
            hasMomentum = true;
            currentHigh = candle325.high;
            currentLow = candle325.low;
            const isBullish = candle325.close > candle325.open;
            const isBearish = candle325.close < candle325.open;
            momentumType = isBullish ? "Bullish" : (isBearish ? "Bearish" : null);
            priceChange = currentDiff;
            timestamp = candle325.timestamp;
            candleTimeRange = `${new Date(prevCandle.timestamp).toLocaleTimeString()} - ${new Date(candle325.timestamp).toLocaleTimeString()}`;
            currentCandleTime = new Date(candle325.timestamp).toLocaleTimeString();
          }
        }
      }

      if (hasMomentum && (momentumType === "Bullish" || momentumType === "Bearish")) {
        const stockDetails = stockmap.get(securityId) || {};
        const dayClose = yesterdayMap.get(securityId);
        const latestTradedPrice = latestDataMap.get(securityId);

        const percentageChange = dayClose && latestTradedPrice
          ? ((latestTradedPrice - dayClose) / dayClose) * 100
          : 0;

        momentumStocks.push({
          securityId,
          symbol_name: stockDetails.SYMBOL_NAME || "Unknown",
          symbol: stockDetails.UNDERLYING_SYMBOL || "Unknown",
          currentHigh,
          currentLow,
          previousHigh,
          previousLow,
          momentumType,
          priceChange,
          percentageChange: percentageChange.toFixed(2),
          timestamp,
          candleTimeRange,
          currentCandleTime
        });
      }
    }

    // Sort by strongest momentum first
    momentumStocks.sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange));

    // Update database
    const bulkUpdates = momentumStocks.map(stock => ({
      updateOne: {
        filter: { securityId: stock.securityId },
        update: { $set: stock },
        upsert: true
      }
    }));

    if (bulkUpdates.length > 0) {
      await MomentumStockTenMin.bulkWrite(bulkUpdates);
    }

    // Get updated data from DB (sorted by percentage change)
    const updatedDataFromDB = await MomentumStockTenMin.find({}, {
      securityId: 1,
      symbol_name: 1,
      symbol: 1,
      _id: 0,
      momentumType: 1,
      timestamp: 1,
      percentageChange: 1,
      priceChange: 1
    }).sort({ percentageChange: -1 }).limit(30);

    return {
      message: "Momentum stocks found and saved",
      count: momentumStocks.length,
      data: updatedDataFromDB
    };
  } catch (error) {
    console.error("Error in AIMomentumCatcherTenMins:", error);
    return {
      message: "Internal server error",
      error: error.message
    };
  }
};

const DailyRangeBreakout = async (req, res) => {
  try {
    const uniqueTradingDays = await MarketDetailData.aggregate([
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } },
      { $limit: 5 },
    ]);

    if (uniqueTradingDays.length < 5) {
      return /* res.status(404).json({ message: "Not enough historical data found" }); */ {
        message: "Not enough historical data found",
      };
    }

    const targetDates = uniqueTradingDays.map(
      (day) => new Date(day._id).toISOString().split("T")[0]
    );

    const latestDate = targetDates[0];
    const previousFormatted = targetDates[1];

    const historicalData = await MarketDetailData.find(
      { date: { $in: targetDates } },
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
    ).lean();

    if (!historicalData || historicalData.length === 0) {
      return /* res.status(404).json({ message: "No data found for the target dates" }); */ {
        message: "No data found for the target dates",
      };
    }

    const groupedData = targetDates.reduce((acc, date) => {
      const dateStr = date;
      acc[dateStr] = historicalData.filter((entry) => {
        const entryDateStr = new Date(entry.date).toISOString().split("T")[0];
        return entryDateStr === dateStr;
      });
      return acc;
    }, {});

    const latestDataMap = new Map();
    const prevDayCloseMap = new Map();

    groupedData[latestDate].forEach((entry) => {
      latestDataMap.set(entry.securityId, {
        latestTradedPrice: entry.data?.[0]?.latestTradedPrice ?? 0,
        dayOpen: entry.data?.[0]?.dayOpen ?? 0,
        dayClose: entry.data?.[0]?.dayClose ?? 0,
        dayHigh: entry.data?.[0]?.dayHigh ?? 0,
        dayLow: entry.data?.[0]?.dayLow ?? 0,
      });
    });

    groupedData[previousFormatted].forEach((entry) => {
      prevDayCloseMap.set(entry.securityId, {
        dayClose: entry.data?.[0]?.dayClose ?? 0,
      });
    });

    const stocks = await StocksDetail.find(
      {},
      { SECURITY_ID: 1, SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1, _id: 0 }
    );

    const stockMap = new Map();
    stocks.forEach((entry) => {
      stockMap.set(entry.SECURITY_ID, {
        UNDERLYING_SYMBOL: entry.UNDERLYING_SYMBOL || "N/A",
        SYMBOL_NAME: entry.SYMBOL_NAME || "N/A",
      });
    });

    let breakoutStocks = [];
    const securityIds = [
      ...new Set(historicalData.map((item) => item.securityId)),
    ];

    for (const securityId of securityIds) {
      const stockData = targetDates.map((date) => {
        return groupedData[date].find(
          (entry) => entry.securityId === securityId
        );
      });

      if (stockData.length < 5 || stockData.some((day) => !day)) continue;

      const todayData = latestDataMap.get(securityId);
      const preCloseData = prevDayCloseMap.get(securityId);
      if (!todayData || !preCloseData) continue;

      const highs = stockData
        .map((day) => day.data?.[0]?.dayHigh ?? 0)
        .reverse();
      const lows = stockData.map((day) => day.data?.[0]?.dayLow ?? 0).reverse();

      const firstDayCandleHigh = highs[0];
      const firstDayCandleLow = lows[0];

      const inRange =
        highs.slice(1, 4).every((high) => high <= firstDayCandleHigh) &&
        lows.slice(1, 4).every((low) => low >= firstDayCandleLow);

      if (inRange) {
        const todayHigh = todayData.dayHigh;
        const todayLow = todayData.dayLow;
        const latestTradedPrice = todayData.latestTradedPrice;
        const preClose = preCloseData.dayClose;

        const breakoutAbove = todayHigh > firstDayCandleHigh;
        const breakoutBelow = todayLow < firstDayCandleLow;

        if (breakoutAbove || breakoutBelow) {
          const percentageChange = latestTradedPrice
            ? ((latestTradedPrice - preClose) / preClose) * 100
            : 0;

          breakoutStocks.push({
            type: breakoutAbove ? "Bullish" : "Bearish",
            securityId,
            stockSymbol: stockMap.get(securityId)?.UNDERLYING_SYMBOL || "N/A",
            stockName: stockMap.get(securityId)?.SYMBOL_NAME || "N/A",
            lastTradePrice: latestTradedPrice,
            previousClosePrice: preClose,
            percentageChange,
            rangeHigh: firstDayCandleHigh,
            rangeLow: firstDayCandleLow,
            todayHigh,
            todayLow,
          });
        }
      }
    }

    if (breakoutStocks.length > 0) {
      await Promise.all(
        breakoutStocks.map(async (signal) => {
          await DailyRangeBreakouts.findOneAndUpdate(
            { securityId: signal.securityId },
            {
              $set: {
                type: signal.type,
                stockSymbol: signal.stockSymbol,
                stockName: signal.stockName,
                percentageChange: signal.percentageChange,
                timestamp: getFormattedTimestamp(),
              },
            },
            { upsert: true, new: true }
          );
        })
      );
    }

    const fullData = await DailyRangeBreakouts.find(
      {},
      {
        _id: 0,
        __v: 0,
        updatedAt: 0,
        createdAt: 0,
        lastTradePrice: 0,
        previousClosePrice: 0,
      }
    )
      .sort({ timestamp: -1 })
      .lean();

    return /* res.status(200).json({ message: "Breakout analysis complete", data: fullData }); */ {
      message: "Breakout analysis complete",
      data: fullData.slice(0, 30),
    };
  } catch (error) {
    // console.error("Error in DailyRangeBreakout:", error);
    return /* res.status(500).json({ message: "Internal server error", error: error.message }); */ {
      message: "Internal server error",
      error: error.message,
    };
  }
};
const DayHighLowReversal = async () => {
    try {
      // 1. Get latest market data
      const latestEntry = await MarketDetailData.findOne().sort({ date: -1 });
      if (!latestEntry) return { success: false, message: "No market data available" };
  
      // 2. Fetch all required data in parallel
      const [marketData, stocksDetail, fiveMinCandles] = await Promise.all([
        MarketDetailData.find({ date: latestEntry.date }),
        StocksDetail.find(),
        FiveMinCandles.find()
      ]);
  
      if (!marketData.length || !stocksDetail.length || !fiveMinCandles.length) {
        return { success: false, message: "Incomplete data available" };
      }
  
      // 3. Create lookup maps
      const stockMap = new Map(stocksDetail.map(s => [s.SECURITY_ID, s]));
      const candleMap = new Map(fiveMinCandles.map(c => [c.securityId, c]));
  
      // 4. Threshold configuration
      const NEAR_THRESHOLD = 0.005; // 0.5% threshold for near high/low
      const CONFIRMATION_THRESHOLD = 0.01; // 1% move for confirmation
      const MIN_CANDLE_SIZE = 0.003; // 0.3% min candle size
  
      // 5. Process stocks in two phases
  
      // Phase 1: Identify stocks near day high/low
      const nearHighLow = marketData.map(data => {
        const securityId = data.securityId;
        const latestPrice = data.data?.latestTradedPrice?.[0] || 0;
        const dayHigh = data.data?.dayHigh?.[0] || 0;
        const dayLow = data.data?.dayLow?.[0] || 0;
        const dayClose = data.data?.dayClose?.[0] || 0;
        
        const stock = stockMap.get(securityId);
        if (!stock) return null;
  
        const isNearHigh = latestPrice >= dayHigh * (1 - NEAR_THRESHOLD);
        const isNearLow = latestPrice <= dayLow * (1 + NEAR_THRESHOLD);
  
        if (!isNearHigh && !isNearLow) return null;
  
        return {
          securityId,
          symbol: stock.UNDERLYING_SYMBOL || "N/A",
          name: stock.SYMBOL_NAME || "N/A",
          currentPrice: latestPrice,
          dayHigh,
          dayLow,
          dayClose,
          isNearHigh,
          isNearLow
        };
      }).filter(Boolean);
  
      // Phase 2: Check for reversal confirmation in 5-min candles
      const confirmedReversals = nearHighLow.map(stock => {
        const candleData = candleMap.get(stock.securityId);
        if (!candleData) return null;
  
        // Get last 3 candles for better confirmation
        const candles = {
          open: candleData.open.slice(-3),
          high: candleData.high.slice(-3),
          low: candleData.low.slice(-3),
          close: candleData.close.slice(-3),
          timestamp: candleData.timestamp.slice(-3)
        };
  
        // Check for BEARISH reversal (near high + red candle)
        if (stock.isNearHigh) {
          const latestClose = candles.close[2];
          const latestOpen = candles.open[2];
          
          // Valid red candle (open > close) with significant size
          if (latestOpen > latestClose && 
              (latestOpen - latestClose) >= latestOpen * MIN_CANDLE_SIZE &&
              latestClose <= stock.dayHigh * (1 - CONFIRMATION_THRESHOLD)) {
                
            return {
              ...stock,
              type: "BEARISH",
              confirmation: {
                candleType: "RED",
                priceDrop: ((stock.dayHigh - latestClose)/stock.dayHigh * 100).toFixed(2) + '%',
                candleSize: ((latestOpen - latestClose)/latestOpen * 100).toFixed(2) + '%',
                timestamp: candles.timestamp[2]
              }
            };
          }
        }
  
        // Check for BULLISH reversal (near low + green candle)
        if (stock.isNearLow) {
          const latestClose = candles.close[2];
          const latestOpen = candles.open[2];
          
          // Valid green candle (close > open) with significant size
          if (latestClose > latestOpen && 
              (latestClose - latestOpen) >= latestOpen * MIN_CANDLE_SIZE &&
              latestClose >= stock.dayLow * (1 + CONFIRMATION_THRESHOLD)) {
                
            return {
              ...stock,
              type: "BULLISH",
              confirmation: {
                candleType: "GREEN",
                priceRise: ((latestClose - stock.dayLow)/stock.dayLow * 100).toFixed(2) + '%',
                candleSize: ((latestClose - latestOpen)/latestOpen * 100).toFixed(2) + '%',
                timestamp: candles.timestamp[2]
              }
            };
          }
        }
  
        return null;
      }).filter(Boolean);
  
      // 6. Store results in DB
      if (confirmedReversals.length > 0) {
        const bulkOps = confirmedReversals.map(reversal => ({
          updateOne: {
            filter: { securityId: reversal.securityId },
            update: { 
              $set: {
                ...reversal,
                updatedAt: new Date()
              } 
            },
            upsert: true
          }
        }));
  
        await HighLowReversal.bulkWrite(bulkOps);
      }
  
      // 7. Format response
      return {
        success: true,
        message: confirmedReversals.length 
          ? `${confirmedReversals.length} reversals confirmed` 
          : "No confirmed reversals found",
        data: confirmedReversals.map(r => ({
          securityId: r.securityId,
          symbol: r.symbol,
          name: r.name,
          type: r.type,
          currentPrice: r.currentPrice,
          referencePrice: r.type === "BEARISH" ? r.dayHigh : r.dayLow,
          confirmation: r.confirmation,
          dailyChange: r.dayClose 
            ? ((r.currentPrice - r.dayClose)/r.dayClose * 100).toFixed(2) + '%' 
            : "N/A"
        }))
      };
  
    } catch (error) {
      return {
        success: false,
        message: "Internal server error",
        error: error.message
      };
    }
  };

// via sockets
const twoDayHLBreak = async (req, res) => {
  try {
    const uniqueTradingDays = await MarketDetailData.aggregate([
      { $group: { _id: "$date" } }, // Group by date to get unique trading days
      { $sort: { _id: -1 } }, // Sort by date in descending order (latest first)
      { $limit: 3 }, // Get the latest three unique dates
    ]);

    if (!uniqueTradingDays || uniqueTradingDays.length < 3) {
      // return res.status(404).json({ message: "Not enough historical data found" });
      return { message: "Not enough historical data found" };
    }

    const latestDate = uniqueTradingDays[0]._id;
    const tomorrow = new Date(latestDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split("T")[0];

    const firstPrevTargetDate = uniqueTradingDays[1]._id;
    const secondPrevTargetDate = uniqueTradingDays[2]._id;

    const firstPrevStockData = await MarketDetailData.find(
      { date: firstPrevTargetDate },
      {
        securityId: 1,
        "data.dayOpen": 1,
        date: 1,
        "data.dayClose": 1,
        "data.dayHigh": 1,
        "data.dayLow": 1,
        "data.latestTradedPrice": 1,
        _id: 0,
      }
    );
    if (!firstPrevStockData || firstPrevStockData.length === 0) {
      return { message: "No stock data found for the selected dates" };
    }

    const secondPrevStockData = await MarketDetailData.find(
      { date: secondPrevTargetDate },
      {
        securityId: 1,
        "data.dayOpen": 1,
        date: 1,
        "data.dayClose": 1,
        "data.dayHigh": 1,
        "data.dayLow": 1,
        _id: 0,
      }
    );

    if (!secondPrevStockData || secondPrevStockData.length === 0) {
      return { message: "No stock data found for the selected dates" };
    }
    const securityIds = [];
    const firstPrevStockDataMap = new Map();
    firstPrevStockData.forEach((item) => {
      securityIds.push(item.securityId);
      firstPrevStockDataMap.set(item.securityId, {
        securityId: item.securityId,
        dayOpen: item.data?.dayOpen?.[0],
        dayClose: item.data?.dayClose?.[0],
        dayHigh: item.data?.dayHigh?.[0],
        dayLow: item.data?.dayLow?.[0],
        date: item.date,
        latestTradedPrice: item.data?.latestTradedPrice?.[0],
      });
    });

    const secondPrevStockDataMap = new Map();
    secondPrevStockData.forEach((item) => {
      secondPrevStockDataMap.set(item.securityId, {
        securityId: item.securityId,
        dayOpen: item.data?.dayOpen?.[0],
        dayClose: item.data?.dayClose?.[0],
        dayHigh: item.data?.dayHigh?.[0],
        dayLow: item.data?.dayLow?.[0],
        date: item.date,
      });
    });

    const updatedData = [];
    let redisData;
    for (let i = 0; i < securityIds.length; i++) {
      const redisKey = `stockFiveMinCandle:${securityIds[i]}:${latestDate}-${tomorrowFormatted}`;

      // Check Redis cache
      const cachedData = await redis.get(redisKey);
      if (cachedData) {
        // console.log(`Fetched from Redis: ${securityIds[i]}`);
        redisData = JSON.parse(cachedData);
      }

      if (!redisData) {
        console.warn(`No data found for Security ID: ${securityIds[i]}`);
        const data = await TwoDayHighLowBreak.find(
          {},
          {
            securityId: 1,
            symbolName: 1,
            underlyingSymbol: 1,
            type: 1,
            timestamp: 1,
            percentageChange: 1,
            _id: 0,
          }
        );
        return {
          message: "Two Day High Low Break analysis complete",
          data,
        };
          // Skip if data is missing
      }

      // Prepare the updated data
      updatedData.push({
        securityId: securityIds[i],
        timestamp: redisData.timestamp.slice(-5), // Convert all timestamps
        open: redisData.open.slice(-5),
        high: redisData.high.slice(-5),
        low: redisData.low.slice(-5),
        close: redisData.close.slice(-5),
        volume: redisData.volume.slice(-5),
      });
    }

    // Check if data is valid and a Map
    if (!updatedData) {
      return { message: "Invalid data format" }; //res.status(400).json({ message: "Invalid data format" });
    }

    const dataArray = updatedData;
    if (dataArray.length === 0) {
      return { message: "No data found" };
    }
    const stockDetails = await StocksDetail.find(
      {},
      { SECURITY_ID: 1, SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1 }
    );

    if (!stockDetails) {
      // return res.status(404).json({ success: false, message: "No stocks info found" });
      return { success: false, message: "No stocks info found" };
    }

    const stockDetailsMap = new Map();
    stockDetails.forEach((item) => {
      stockDetailsMap.set(item.SECURITY_ID, {
        symbolName: item.SYMBOL_NAME,
        underlyingSymbol: item.UNDERLYING_SYMBOL,
      });
    });

    let responseData = [];

    // the main logic
    dataArray.map((item) => {
      const securityId = item.securityId;
      const firstPrevDayData = firstPrevStockDataMap.get(securityId);
      const secondPrevDayData = secondPrevStockDataMap.get(securityId);
      const stocksDetail = stockDetailsMap.get(securityId);
      const fiveMinHigh = item?.high?.slice(-1)[0];
      const fiveMinLow = item?.low?.slice(-1);
      const fiveMinOpen = item?.open?.slice(-1);
      const fiveMinClose = item?.close?.slice(-1);
      const firstPrevDayHigh = firstPrevDayData?.dayHigh;
      const firstPrevDayLow = firstPrevDayData?.dayLow;
      const secondPrevDayHigh = secondPrevDayData?.dayHigh;
      const secondPrevDayLow = secondPrevDayData?.dayLow;
      const secondPrevDayClose = secondPrevDayData?.dayClose;
      const latestTradedPrice = firstPrevDayData?.latestTradedPrice;
      const latestTimestamp = item.timestamp[4];
      const percentageChange =
        ((latestTradedPrice - secondPrevDayClose) / secondPrevDayClose) * 100;
      // console.log("percentageChange", percentageChange);

      if (
        (firstPrevDayHigh <= secondPrevDayHigh + secondPrevDayHigh * 0.01 &&
          firstPrevDayHigh >= secondPrevDayHigh) ||
        (secondPrevDayHigh <= firstPrevDayHigh + firstPrevDayHigh * 0.01 &&
          secondPrevDayHigh >= firstPrevDayHigh)
      ) {
        const maxHigh = Math.max(firstPrevDayHigh, secondPrevDayHigh);

        if (fiveMinHigh > maxHigh) {
          const timestamp = getFormattedTimestamp();
          responseData.push({
            securityId,
            ...stocksDetail,
            fiveMinHigh,
            type: "Bullish",
            maxHigh,
            timestamp: timestamp,
            percentageChange,
          });
        }
      }

      if (
        (firstPrevDayLow >= secondPrevDayLow - secondPrevDayLow * 0.01 &&
          firstPrevDayLow <= secondPrevDayLow) ||
        (secondPrevDayLow >= firstPrevDayLow - firstPrevDayLow * 0.01 &&
          secondPrevDayLow <= firstPrevDayLow)
      ) {
        const minLow = Math.min(firstPrevDayLow, secondPrevDayLow);

        if (fiveMinLow < minLow) {
          const timestamp = getFormattedTimestamp();
          responseData.push({
            securityId,
            ...stocksDetail,
            fiveMinHigh,
            type: "Bearish",
            minLow,
            timestamp: timestamp,
            percentageChange,
          });
        }
      }
    });

    const bulkOps = responseData.map((item) => ({
      updateOne: {
        filter: { securityId: item.securityId },
        update: { $set: item },
        upsert: true,
      },
    }));

    await TwoDayHighLowBreak.bulkWrite(bulkOps);

    const data = await TwoDayHighLowBreak.find(
      {},
      {
        securityId: 1,
        symbolName: 1,
        underlyingSymbol: 1,
        type: 1,
        timestamp: 1,
        percentageChange: 1,
        _id: 0,
      }
    );

    // return res.status(200).json({ message: "Two Day High Low Break analysis complete", data });
    return {
      message: "Two Day High Low Break analysis complete",
      data,
    };
  } catch (error) {
    // return res.status(500).json({ success: false, message: error.message });
    return { success: false, message: error.message };
  }
};

export {
  startWebSocket,
  getData,
  getDataForTenMin,
  AIIntradayReversalFiveMins, //done with database👍socket  cross checked ✅
  AIMomentumCatcherFiveMins, //done with database👍socket   cross checked ✅
  AIMomentumCatcherTenMins, //done with database👍socket    cross checked ✅
  AIIntradayReversalDaily, //done with database👍socket     cross checked ✅
  DailyRangeBreakout, //done with database👍socket          cross checked ✅
  DayHighLowReversal, //done with database👍socket          cross checked ✅
  twoDayHLBreak, //done with data base 👍 socket            cross checked ✅
};
