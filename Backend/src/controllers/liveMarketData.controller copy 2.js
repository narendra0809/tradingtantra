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
  
    function isCandleComplete(candleTime, intervalMinutes) {
      const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      const current = new Date(now);
      const candle = new Date(candleTime);
      const diffInMs = current - candle;
      const intervalMs = intervalMinutes * 60 * 1000;
      return diffInMs >= intervalMs;
    }
  
    function getLastNCompleteCandles(rawData, interval, n = 5) {
      const timestampsIST = rawData.timestamp.map(convertToIST);
      const validIndexes = timestampsIST
        .map((time, index) => (isCandleComplete(time, interval) ? index : -1))
        .filter(index => index !== -1);
  
      const lastValidIndexes = validIndexes.slice(-n);
  
      return {
        open: lastValidIndexes.map(i => rawData.open[i]),
        high: lastValidIndexes.map(i => rawData.high[i]),
        low: lastValidIndexes.map(i => rawData.low[i]),
        close: lastValidIndexes.map(i => rawData.close[i]),
        volume: lastValidIndexes.map(i => rawData.volume[i]),
        timestamp: lastValidIndexes.map(i => timestampsIST[i]),
      };
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
            const formatted5 = getLastNCompleteCandles(rawData, 5);
            formatted5.securityId = id;
  
            await redis.set(redisKey5, JSON.stringify(formatted5), "EX", 300);
            console.log(`🌐 [API] 5-min data fetched & cached for ${id} (${i + 1}/${securityIds.length})`);
          } else {
            console.warn(`⚠️ [API] No 5-min data for ${id}`);
          }
        }
  
        await delay(500);
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
            const formatted15 = getLastNCompleteCandles(rawData, 15);
            formatted15.securityId = id;
  
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
      // console.log(`Formatted and cached data for ${finalData.length} stocks.`);
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
const AIMomentumCatcherFiveMins = async (req, res) => {
    try {
      const stocks = await StocksDetail.find(
        {},
        { SECURITY_ID: 1, SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1, _id: 0 }
      );
      if (!stocks || stocks.length === 0) {
        return { message: "No stocks data found" };
      }
  
      const stockMap = new Map();
      stocks.forEach((entry) => {
        stockMap.set(entry.SECURITY_ID, {
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
  
      function convertToIST(unixTimestamp) {
        const date = new Date(unixTimestamp * 1000);
        return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      }
  
      const updatedData = [];
      for (const securityId of securityIds) {
        const redisKey = `stockFiveMinCandle:${securityId}:${latestDate}-${tomorrowFormatted}`;
        let data;
  
        // Check Redis cache
        const cachedData = await redis.get(redisKey);
        if (cachedData) {
          data = JSON.parse(cachedData);
        } else {
          // Fallback to database
          data = await FiveMinCandles.findOne({ securityId, date: latestDate }).lean();
        }
  
        if (!data || !data.open || !data.close || data.open.length < 2) {
          console.warn(`No sufficient data for Security ID: ${securityId}`);
          continue;
        }
  
        // Get the last two candles
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
          volume: data.volume.slice(-2),
          currentBody,
          previousRange,
        });
      }
  
      if (updatedData.length === 0) {
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
  
          // Check if current candle's body is at least double the previous candle's range
          const hasMomentum = Number(entry.currentBody.toFixed(4)) >= Number((entry.previousRange * 2).toFixed(4)) && entry.previousRange > 0.1;
  
          const isBullish = crrClose > crrOpen;
          const isBearish = crrClose < crrOpen;
  
          if (hasMomentum && (isBullish || isBearish)) {
            const stockDetails = stockMap.get(entry.securityId) || {};
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
            };
          }
          return null;
        })
        .filter((stock) => stock !== null);
  
      momentumStocks.sort(
        (a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange)
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
      )
        .sort({ percentageChange: -1 })
        .limit(20);
  
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
  
      const stockMap = new Map();
      const securityIds = stocks.map(stock => stock.SECURITY_ID);
      stocks.forEach((entry) => {
        stockMap.set(entry.SECURITY_ID, {
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
      const yesterdayData = await MarketDetailData.find({ date: previousDayDate });
  
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
  
      const tomorrow = new Date(latestDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowFormatted = tomorrow.toISOString().split("T")[0];
  
      // Helper: Convert 5-min candles to 10-min candles
      const convertToTenMinCandles = (candleData) => {
        const merged = [];
        for (let i = 0; i < candleData.length; i += 2) {
          const c1 = candleData[i];
          const c2 = candleData[i + 1];
  
          if (c1 && c2) {
            // Merge two 5-minute candles
            merged.push({
              timestamp: c1.timestamp,
              open: c1.open,
              close: c2.close,
              high: Math.max(c1.high, c2.high),
              low: Math.min(c1.low, c2.low)
            });
          } else if (c1 && !c2) {
            // Handle last unpaired candle
            merged.push({
              timestamp: c1.timestamp,
              open: c1.open,
              close: c1.close,
              high: c1.high,
              low: c1.low
            });
          }
        }
        return merged;
      };
  
      function convertToIST(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      }
  
      const momentumStocks = [];
  
      for (const securityId of securityIds) {
        const redisKey = `stockFiveMinCandle:${securityId}:${latestDate}-${tomorrowFormatted}`;
        const cachedData = await redis.get(redisKey);
        if (!cachedData) continue;
  
        const data = JSON.parse(cachedData);
  
        if (!data || !data.high || !data.low || !data.open || !data.close || data.high.length < 4) {
          console.warn(`No sufficient data for Security ID: ${securityId}`);
          continue;
        }
  
        const candleData = data.timestamp.map((ts, index) => ({
          timestamp: new Date(ts),
          high: data.high[index],
          low: data.low[index],
          open: data.open[index],
          close: data.close[index]
        }));
  
        const tenMinCandles = convertToTenMinCandles(candleData);
        if (tenMinCandles.length < 2) {
          console.warn(`Not enough 10-min candles for Security ID: ${securityId}`);
          continue;
        }
  
        // Get the last two 10-min candles
        const currentCandle = tenMinCandles[tenMinCandles.length - 1];
        const previousCandle = tenMinCandles[tenMinCandles.length - 2];
  
        // Calculate current body and previous range
        const currentBody = Math.abs(currentCandle.close - currentCandle.open);
        const previousRange = previousCandle.high - previousCandle.low;
  
        // Check if current candle's body is at least double the previous candle's range
        const hasMomentum = Number(currentBody.toFixed(4)) >= Number((previousRange * 2).toFixed(4)) && previousRange > 0.1;
  
        const isBullish = currentCandle.close > currentCandle.open;
        const isBearish = currentCandle.close < currentCandle.open;
  
        if (hasMomentum && (isBullish || isBearish)) {
          const stockDetails = stockMap.get(securityId) || {};
          const dayClose = yesterdayMap.get(securityId);
          const latestTradedPrice = latestDataMap.get(securityId);
  
          const percentageChange = dayClose && !isNaN(dayClose) && !isNaN(latestTradedPrice)
            ? ((latestTradedPrice - dayClose) / dayClose) * 100
            : 0;
  
          momentumStocks.push({
            securityId,
            symbol_name: stockDetails.SYMBOL_NAME || "Unknown",
            symbol: stockDetails.UNDERLYING_SYMBOL || "Unknown",
            previousHigh: previousCandle.high,
            previousLow: previousCandle.low,
            previousOpen: previousCandle.open,
            previousClose: previousCandle.close,
            currentOpen: currentCandle.open,
            currentClose: currentCandle.close,
            momentumType: isBullish ? "Bullish" : "Bearish",
            priceChange: currentBody,
            percentageChange: percentageChange.toFixed(2),
            timestamp: convertToIST(currentCandle.timestamp)
          });
        }
      }
  
      momentumStocks.sort((a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange));
  
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
  
      const updatedDataFromDB = await MomentumStockTenMin.find(
        {},
        {
          securityId: 1,
          symbol_name: 1,
          symbol: 1,
          momentumType: 1,
          timestamp: 1,
          percentageChange: 1,
          priceChange: 1,
          previousHigh: 1,
          previousLow: 1,
          previousOpen: 1,
          previousClose: 1,
          currentOpen: 1,
          currentClose: 1,
          _id: 0
        }
      ).sort({ percentageChange: -1 }).limit(30);
  
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
  const AIIntradayReversalFiveMins = async (req, res) => {
    try {
      const latestEntry = await MarketDetailData.findOne()
        .sort({ date: -1 })
        .select("date")
        .limit(1);
  
      if (!latestEntry) {
        return { message: "No stock data available" };
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
  
      if (!previousEntry) {
        return { message: "No previous date available" };
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
        return { message: "No latest stock data available" };
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
        return { message: "No previous stock data available" };
      }
  
      const previousDayDataMap = new Map();
      previousData.forEach((entry) => {
        previousDayDataMap.set(entry.securityId, entry.data?.dayClose?.[0] || 0);
      });
  
      function convertToIST(unixTimestamp) {
        const date = new Date(unixTimestamp * 1000);
        return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      }
  
      const updatedData = [];
      for (const securityId of securityIds) {
        const redisKey = `stockFiveMinCandle:${securityId}:${latestDate}-${tomorrowFormatted}`;
        let data;
  
        // Check Redis cache
        const cachedData = await redis.get(redisKey);
        if (cachedData) {
          data = JSON.parse(cachedData);
        } else {
          // Fallback to database
          data = await FiveMinCandles.findOne({ securityId, date: latestDate }).lean();
        }
  
        if (!data || !data.open || !data.close || data.open.length < 5) {
          console.warn(`No sufficient data for Security ID: ${securityId}`);
          continue;
        }
  
        updatedData.push({
          securityId,
          timestamp: data.timestamp.slice(-5),
          open: data.open.slice(-5),
          high: data.high.slice(-5),
          low: data.low.slice(-5),
          close: data.close.slice(-5),
          volume: data.volume.slice(-5),
        });
      }
  
      if (updatedData.length === 0) {
        return { message: "No candle data found" };
      }
  
      const stocks = await StocksDetail.find(
        {},
        { SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1, SECURITY_ID: 1, _id: 0 }
      );
  
      if (!stocks || stocks.length === 0) {
        return { message: "No stocks data found" };
      }
  
      const stockMap = new Map();
      stocks.forEach((entry) => {
        stockMap.set(entry.SECURITY_ID, {
          UNDERLYING_SYMBOL: entry.UNDERLYING_SYMBOL,
          SYMBOL_NAME: entry.SYMBOL_NAME,
        });
      });
  
      const results = updatedData.map((item) => {
        const momentumSignals = [];
        const securityId = item.securityId;
        const stock = stockMap.get(securityId);
        const latestTradedPrice = latestDataMap.get(securityId);
        const previousDayClose = previousDayDataMap.get(securityId);
        const latestTimestamp = item.timestamp[4];
  
        if (
          !item.open ||
          !item.close ||
          item.open.length < 5 ||
          item.close.length < 5
        ) {
          console.warn(`Skipping ${securityId} due to insufficient data`);
          return momentumSignals;
        }
  
        const lastFiveOpen = item.open.slice(-5);
        const lastFiveClose = item.close.slice(-5);
  
        // Calculate percentage change for each candle: (Close - Open) / Open * 100
        const candleReturns = lastFiveOpen.map((open, i) => {
          const close = lastFiveClose[i];
          return ((close - open) / open) * 100;
        });
  
        // Previous 4 candles
        const prevFourReturns = candleReturns.slice(0, 4);
        const latestReturn = candleReturns[4];
  
        // Latest candle direction
        const latestOpen = lastFiveOpen[4];
        const latestClose = lastFiveClose[4];
        const isLatestBullish = latestClose > latestOpen;
        const isLatestBearish = latestClose < latestOpen;
  
        // Overall percentage change (latest price vs. previous day close)
        const overAllPercentageChange =
          previousDayClose && latestTradedPrice && !isNaN(previousDayClose) && !isNaN(latestTradedPrice)
            ? ((latestTradedPrice - previousDayClose) / previousDayClose) * 100
            : 0;
  
        // Bearish Reversal: 4 bullish candles (strictly decreasing gains) + 1 bearish candle
        const allBullish = prevFourReturns.every((ret) => ret > 0);
        const strictlyDecreasingBullish = prevFourReturns.every(
          (ret, i) => i === 0 || ret < prevFourReturns[i - 1]
        );
  
        if (allBullish && strictlyDecreasingBullish && isLatestBearish) {
        //   console.log(`Bearish Reversal for ${securityId}: prevReturns=${prevFourReturns}, latestReturn=${latestReturn}`);
          momentumSignals.push({
            type: "Bearish",
            securityId,
            stockSymbol: stock?.UNDERLYING_SYMBOL || "N/A",
            stockName: stock?.SYMBOL_NAME || "N/A",
            lastTradePrice: latestClose,
            previousClosePrice: lastFiveClose[3],
            overAllPercentageChange: overAllPercentageChange.toFixed(2),
            timestamp: latestTimestamp,
          });
        }
  
        // Bullish Reversal: 4 bearish candles (strictly decreasing losses) + 1 bullish candle
        const allBearish = prevFourReturns.every((ret) => ret < 0);
        const strictlyDecreasingBearish = prevFourReturns.every(
          (ret, i) => i === 0 || Math.abs(ret) < Math.abs(prevFourReturns[i - 1])
        );
  
        if (allBearish && strictlyDecreasingBearish && isLatestBullish) {
        //   console.log(`Bullish Reversal for ${securityId}: prevReturns=${prevFourReturns}, latestReturn=${latestReturn}`);
          momentumSignals.push({
            type: "Bullish",
            securityId,
            stockSymbol: stock?.UNDERLYING_SYMBOL || "N/A",
            stockName: stock?.SYMBOL_NAME || "N/A",
            lastTradePrice: latestClose,
            previousClosePrice: lastFiveClose[3],
            overAllPercentageChange: overAllPercentageChange.toFixed(2),
            timestamp: latestTimestamp,
          });
        }
  
        return momentumSignals;
      });
  
      const finalResults = results.flat().filter((signal) => signal.length !== 0);
  
      if (finalResults.length > 0) {
        const savePromises = finalResults.map(async (signal) => {
          try {
            await IntradayReversalFiveMin.findOneAndUpdate(
              { securityId: signal.securityId },
              {
                $set: {
                  type: signal.type,
                  stockSymbol: signal.stockSymbol,
                  stockName: signal.stockName,
                  lastTradePrice: signal.lastTradePrice,
                  previousClosePrice: signal.previousClosePrice,
                  overAllPercentageChange: signal.overAllPercentageChange,
                  timestamp: signal.timestamp,
                },
              },
              { upsert: true, new: true }
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
  
      if (fullData.length === 0) {
        return {
          message: "No momentum signals detected",
          data: [],
        };
      }
  
      return {
        message: "Momentum analysis complete",
        data: fullData.slice(0, 30),
      };
    } catch (error) {
      console.error("Error in AIIntradayReversalFiveMins:", error);
      return {
        message: "Internal server error",
        error: error.message,
      };
    }
  };

  const AIIntradayReversalDaily = async (req, res) => {
    try {
      const latestEntry = await MarketDetailData.findOne()
        .sort({ date: -1 })
        .select("date")
        .limit(1);
  
      if (!latestEntry) {
        return { message: "No stock data available" };
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
  
      if (!previousEntry) {
        return { message: "No previous date available" };
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
        return { message: "No latest stock data available" };
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
        return { message: "No previous stock data available" };
      }
  
      const previousDayDataMap = new Map();
      previousData.forEach((entry) => {
        previousDayDataMap.set(entry.securityId, entry.data?.dayClose?.[0] || 0);
      });
  
      function convertToIST(unixTimestamp) {
        const date = new Date(unixTimestamp * 1000);
        return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      }
  
      const updatedData = [];
      for (const securityId of securityIds) {
        const redisKey = `stockFifteenMinCandle:${securityId}:${latestDate}-${tomorrowFormatted}`;
        let data;
  
        // Check Redis cache
        const cachedData = await redis.get(redisKey);
        if (cachedData) {
          data = JSON.parse(cachedData);
        } 
  
        if (!data || !data.open || !data.close || data.open.length < 5) {
          console.warn(`No sufficient data for Security ID: ${securityId}`);
          continue;
        }
  
        updatedData.push({
          securityId,
          timestamp: data.timestamp.slice(-5),
          open: data.open.slice(-5),
          close: data.close.slice(-5),
          high: data.high.slice(-5),
          low: data.low.slice(-5),
          volume: data.volume.slice(-5),
        });
      }
  
      if (updatedData.length === 0) {
        return { message: "No candle data found" };
      }
  
      const stocks = await StocksDetail.find(
        {},
        { SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1, SECURITY_ID: 1, _id: 0 }
      );
  
      if (!stocks || stocks.length === 0) {
        return { message: "No stocks data found" };
      }
  
      const stockMap = new Map();
      stocks.forEach((entry) => {
        stockMap.set(entry.SECURITY_ID, {
          UNDERLYING_SYMBOL: entry.UNDERLYING_SYMBOL,
          SYMBOL_NAME: entry.SYMBOL_NAME,
        });
      });
  
      const results = updatedData.map((item) => {
        const momentumSignals = [];
        const securityId = item.securityId;
        const stock = stockMap.get(securityId);
        const latestTradedPrice = latestDataMap.get(securityId);
        const previousDayClose = previousDayDataMap.get(securityId);
        const latestTimestamp = item.timestamp[4];
  
        if (
          !item.open ||
          !item.close ||
          item.open.length < 5 ||
          item.close.length < 5
        ) {
          console.warn(`Skipping ${securityId} due to insufficient data`);
          return momentumSignals;
        }
  
        const lastFiveOpen = item.open.slice(-5);
        const lastFiveClose = item.close.slice(-5);
  
        // Calculate percentage change for each candle: (Close - Open) / Open * 100
        const candleReturns = lastFiveOpen.map((open, i) => {
          const close = lastFiveClose[i];
          return ((close - open) / open) * 100;
        });
  
        // Previous 4 candles
        const prevFourReturns = candleReturns.slice(0, 4);
        const latestReturn = candleReturns[4];
  
        // Latest candle direction
        const latestOpen = lastFiveOpen[4];
        const latestClose = lastFiveClose[4];
        const isLatestBullish = latestClose > latestOpen;
        const isLatestBearish = latestClose < latestOpen;
  
        // Overall percentage change (latest price vs. previous day close)
        const percentageChange =
          previousDayClose && latestTradedPrice && !isNaN(previousDayClose) && !isNaN(latestTradedPrice)
            ? ((latestTradedPrice - previousDayClose) / previousDayClose) * 100
            : 0;
  
        // Bearish Reversal: 4 bullish candles (strictly decreasing gains) + 1 bearish candle
        const allBullish = prevFourReturns.every((ret) => ret > 0);
        const strictlyDecreasingBullish = prevFourReturns.every(
          (ret, i) => i === 0 || ret < prevFourReturns[i - 1]
        );
  
        if (allBullish && strictlyDecreasingBullish && isLatestBearish) {
        //   console.log(`Bearish Reversal for ${securityId}: prevReturns=${prevFourReturns}, latestReturn=${latestReturn}`);
          momentumSignals.push({
            type: "Bearish",
            securityId,
            stockSymbol: stock?.UNDERLYING_SYMBOL || "N/A",
            stockName: stock?.SYMBOL_NAME || "N/A",
            lastTradePrice: latestClose,
            previousClosePrice: lastFiveClose[3],
            percentageChange: percentageChange.toFixed(2),
            timestamp: latestTimestamp,
          });
        }
  
        // Bullish Reversal: 4 bearish candles (strictly decreasing losses) + 1 bullish candle
        const allBearish = prevFourReturns.every((ret) => ret < 0);
        const strictlyDecreasingBearish = prevFourReturns.every(
          (ret, i) => i === 0 || Math.abs(ret) < Math.abs(prevFourReturns[i - 1])
        );
  
        if (allBearish && strictlyDecreasingBearish && isLatestBullish) {
        //   console.log(`Bullish Reversal for ${securityId}: prevReturns=${prevFourReturns}, latestReturn=${latestReturn}`);
          momentumSignals.push({
            type: "Bullish",
            securityId,
            stockSymbol: stock?.UNDERLYING_SYMBOL || "N/A",
            stockName: stock?.SYMBOL_NAME || "N/A",
            lastTradePrice: latestClose,
            previousClosePrice: lastFiveClose[3],
            percentageChange: percentageChange.toFixed(2),
            timestamp: latestTimestamp,
          });
        }
  
        return momentumSignals;
      });
  
      const finalResults = results.flat().filter((signal) => signal.length !== 0);
  
      if (finalResults.length > 0) {
        const savePromises = finalResults.map(async (signal) => {
          try {
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
          } catch (dbError) {
            console.error(`Error saving/updating ${signal.securityId}:`, dbError);
          }
        });
  
        await Promise.all(savePromises);
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
  
      if (fullData.length === 0) {
        return {
          message: "No momentum signals detected",
          data: [],
        };
      }
  
      return {
        message: "Momentum analysis complete",
        data: fullData.slice(0, 30),
      };
    } catch (error) {
      console.error("Error in AIIntradayReversalDaily:", error);
      return {
        message: "Internal server error",
        error: error.message,
      };
    }
  };

  const DailyRangeBreakout = async (req, res) => {
    try {
      const latestEntry = await MarketDetailData.findOne()
        .sort({ date: -1 })
        .select("date")
        .limit(1);
  
      if (!latestEntry) {
        return { message: "No stock data available" };
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
  
      if (!previousEntry) {
        return { message: "No previous date available" };
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
        return { message: "No latest stock data available" };
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
        return { message: "No previous stock data available" };
      }
  
      const previousDayDataMap = new Map();
      previousData.forEach((entry) => {
        previousDayDataMap.set(entry.securityId, entry.data?.dayClose?.[0] || 0);
      });
  
      function convertToIST(unixTimestamp) {
        const date = new Date(unixTimestamp * 1000);
        return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      }
  
      const updatedData = [];
      for (const securityId of securityIds) {
        const redisKey = `stockFiveMinCandle:${securityId}:${latestDate}-${tomorrowFormatted}`;
        let data;
  
        // Check Redis cache
        const cachedData = await redis.get(redisKey);
        if (cachedData) {
          data = JSON.parse(cachedData);
        } else {
          // Fallback to database
          data = await FiveMinCandles.findOne({ securityId, date: latestDate }).lean();
        }
  
        if (!data || !data.open || !data.close || data.high.length < 5) {
          console.warn(`No sufficient data for Security ID: ${securityId}`);
          continue;
        }
  
        updatedData.push({
          securityId,
          timestamp: data.timestamp.slice(-5),
          open: data.open.slice(-5),
          close: data.close.slice(-5),
          high: data.high.slice(-5),
          low: data.low.slice(-5),
          volume: data.volume.slice(-5),
        });
      }
  
      if (updatedData.length === 0) {
        return { message: "No candle data found" };
      }
  
      const stocks = await StocksDetail.find(
        {},
        { SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1, SECURITY_ID: 1, _id: 0 }
      );
  
      if (!stocks || stocks.length === 0) {
        return { message: "No stocks data found" };
      }
  
      const stockMap = new Map();
      stocks.forEach((entry) => {
        stockMap.set(entry.SECURITY_ID, {
          UNDERLYING_SYMBOL: entry.UNDERLYING_SYMBOL || "N/A",
          SYMBOL_NAME: entry.SYMBOL_NAME || "N/A",
        });
      });
  
      let breakoutStocks = [];
      for (const item of updatedData) {
        const securityId = item.securityId;
        const stock = stockMap.get(securityId);
        const latestTradedPrice = latestDataMap.get(securityId);
        const previousDayClose = previousDayDataMap.get(securityId);
  
        if (
          !item.high ||
          !item.low ||
          !item.open ||
          !item.close ||
          item.high.length < 5
        ) {
          console.warn(`Skipping ${securityId} due to insufficient data`);
          continue;
        }
  
        const highs = item.high.slice(-5);
        const lows = item.low.slice(-5);
        const opens = item.open.slice(-5);
        const closes = item.close.slice(-5);
        const latestTimestamp = item.timestamp[4];
  
        const firstCandleHigh = highs[0];
        const firstCandleLow = lows[0];
  
        // Check if candles 2, 3, 4 are within the range of first candle
        const inRange =
          highs.slice(1, 4).every((high) => high <= firstCandleHigh) &&
          lows.slice(1, 4).every((low) => low >= firstCandleLow);
  
        if (inRange) {
          const todayHigh = highs[4];
          const todayLow = lows[4];
          const todayOpen = opens[4];
          const todayClose = closes[4];
  
          const breakoutAbove = todayHigh > firstCandleHigh;
          const breakoutBelow = todayLow < firstCandleLow;
          const isBullish = todayClose > todayOpen;
          const todayReturn = ((todayClose - todayOpen) / todayOpen) * 100;
  
          if (breakoutAbove && isBullish && todayReturn >= 0.5) {
            // Bullish breakout with big green candle (minimum 0.5% return)
            const percentageChange =
              latestTradedPrice && previousDayClose && !isNaN(previousDayClose) && !isNaN(latestTradedPrice)
                ? ((latestTradedPrice - previousDayClose) / previousDayClose) * 100
                : 0;
  
            // console.log(`Bullish Breakout for ${securityId}: rangeHigh=${firstCandleHigh}, todayHigh=${todayHigh}, return=${todayReturn}%`);
            breakoutStocks.push({
              type: "Bullish",
              securityId,
              stockSymbol: stock?.UNDERLYING_SYMBOL || "N/A",
              stockName: stock?.SYMBOL_NAME || "N/A",
              lastTradePrice: latestTradedPrice,
              previousClosePrice: previousDayClose,
              percentageChange: percentageChange.toFixed(2),
              rangeHigh: firstCandleHigh,
              rangeLow: firstCandleLow,
              todayHigh,
              todayLow,
              timestamp: latestTimestamp,
            });
          } else if (breakoutBelow) {
            // Bearish breakout
            const percentageChange =
              latestTradedPrice && previousDayClose && !isNaN(previousDayClose) && !isNaN(latestTradedPrice)
                ? ((latestTradedPrice - previousDayClose) / previousDayClose) * 100
                : 0;
  
            // console.log(`Bearish Breakout for ${securityId}: rangeLow=${firstCandleLow}, todayLow=${todayLow}`);
            breakoutStocks.push({
              type: "Bearish",
              securityId,
              stockSymbol: stock?.UNDERLYING_SYMBOL || "N/A",
              stockName: stock?.SYMBOL_NAME || "N/A",
              lastTradePrice: latestTradedPrice,
              previousClosePrice: previousDayClose,
              percentageChange: percentageChange.toFixed(2),
              rangeHigh: firstCandleHigh,
              rangeLow: firstCandleLow,
              todayHigh,
              todayLow,
              timestamp: latestTimestamp,
            });
          }
        }
      }
  
      if (breakoutStocks.length > 0) {
        await Promise.all(
          breakoutStocks.map(async (signal) => {
            try {
              await DailyRangeBreakouts.findOneAndUpdate(
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
            } catch (dbError) {
              console.error(`Error saving/updating ${signal.securityId}:`, dbError);
            }
          })
        );
      }
  
      const fullData = await DailyRangeBreakouts.find(
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
  
      if (fullData.length === 0) {
        return {
          message: "No breakout signals detected",
          data: [],
        };
      }
  
      return {
        message: "Breakout analysis complete",
        data: fullData.slice(0, 30),
      };
    } catch (error) {
      console.error("Error in DailyRangeBreakout:", error);
      return {
        message: "Internal server error",
        error: error.message,
      };
    }
  };

const DayHighLowReversal = async (req, res) => {
  try {
    const dayHighData = await getDayHighBreak();
    const dayLowData = await getDayLowBreak();

    if (!dayHighData && !dayLowData) {
      return { success: false, message: "No data found for day high and low" };
    }

    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date");

    if (!latestEntry) {
      return { message: "No stock data available" };
    }

    const latestDate = latestEntry.date;
    const tomorrow = new Date(latestDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split("T")[0];

    const data = await FiveMinCandles.find();
    const dataArray = Array.from(data.values());

    if (dataArray.length === 0) {
      return { message: "No data found" };
    }

    const dayHighBreakMap = new Map();
    const dayLowBreakMap = new Map();

    dayHighData?.dayHighBreak?.forEach((item) => {
      dayHighBreakMap.set(item.securityId, item);
    });

    dayLowData?.dayLowBreak?.forEach((item) => {
      dayLowBreakMap.set(item.securityId, item);
    });

    let highLowReversal = [];

    dataArray.forEach((item) => {
      const securityId = item.securityId;
      const High = item.high?.slice(-1);
      const Low = item.low?.slice(-1);
      const Open = item.open?.slice(-1);
      const Close = item.close?.slice(-1);
      const latestTimestamp = item.timestamp[4]; //try for the

      const dayHighBreak = dayHighBreakMap.get(securityId);
      const dayLowBreak = dayLowBreakMap.get(securityId);

      const changePriceForHigh = dayHighBreak?.dayHigh * 0.01;
      const changePriceForLow = dayLowBreak?.dayLow * 0.01;

      let stockData = {
        securityId,
        stockSymbol: "N/A",
        stockName: "N/A",
        high: High,
        low: Low,
        open: Open,
        close: Close,
        type: "",
        percentageChange: "",
        timestamp: "",
      };

      if (dayHighBreak) {
        stockData.stockSymbol = dayHighBreak?.stock?.UNDERLYING_SYMBOL;
        stockData.stockName = dayHighBreak?.stock?.SYMBOL_NAME;
      } else if (dayLowBreak) {
        stockData.stockSymbol = dayLowBreak?.stock?.UNDERLYING_SYMBOL;
        stockData.stockName = dayLowBreak?.stock?.SYMBOL_NAME;
      }

      if (
        dayHighBreak &&
        High >= dayHighBreak.dayHigh &&
        Close <= dayHighBreak.dayHigh &&
        Open > Close &&
        Close > dayHighBreak.dayHigh - changePriceForHigh
      ) {
        stockData.timestamp = getFormattedTimestamp();
        stockData.type = "Bearish";
        stockData.dayHigh = dayHighBreak.dayHigh;
        stockData.percentageChange = dayHighBreak.percentageChange;
      }

      if (
        dayLowBreak &&
        Low <= dayLowBreak.dayLow &&
        Close >= dayLowBreak.dayLow &&
        Open < Close &&
        Close < dayLowBreak.dayLow + changePriceForLow
      ) {
        stockData.timestamp = getFormattedTimestamp();
        stockData.type = "Bullish";
        stockData.dayLow = dayLowBreak.dayLow;
        stockData.percentageChange = dayLowBreak.percentageChange;
      }

      if (stockData.type) {
        highLowReversal.push(stockData);
      }
    });

    if (highLowReversal.length === 0) {
      return { success: true, message: "No reversal data found." };
    }

    // **Bulk upsert to save or update data**
    const bulkOps = highLowReversal.map((item) => ({
      updateOne: {
        filter: { securityId: item.securityId },
        update: { $set: item },
        upsert: true,
      },
    }));

    await HighLowReversal.bulkWrite(bulkOps);

    const highLowReversalData = await HighLowReversal.find(
      {},
      {
        securityId: 1,
        stockName: 1,
        stockSymbol: 1,
        type: 1,
        timestamp: 1,
        percentageChange: 1,
        _id: 0,
      }
    );

    if (!highLowReversalData) {
      return { success: false, message: "No data found" };
    }

    // res.json({
    //   success: true,
    //   message: "High-Low Reversal data updated successfully.",
    //   data: highLowReversalData,
    // });

    return {
      success: true,
      message: "High-Low Reversal data updated successfully.",
      data: highLowReversalData.slice(0, 30),
    };
  } catch (error) {
    // console.log("Error in DayHighLowReversal:", error.message);
    return {
      success: false,
      message: "Internal server error",
      error: error.message,
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
        
          responseData.push({
            securityId,
            ...stocksDetail,
            fiveMinHigh,
            type: "Bullish",
            maxHigh,
            timestamp: latestTimestamp,
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
          
          responseData.push({
            securityId,
            ...stocksDetail,
            fiveMinHigh,
            type: "Bearish",
            minLow,
            timestamp: latestTimestamp,
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
