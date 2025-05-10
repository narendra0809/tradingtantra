import WebSocket from "ws";
import connectDB from "../config/db.js";
import StocksDetail from "../models/stocksDetail.model.js";
import parseBinaryData from "../utils/parseBinaryData.js";
import {fetchHistoricalData,
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
import TenMinCandles from "../models/tenMinCandles.model.js";
import FifteenMinCandles from "../models/fifteenMinCandles.model.js";
import IntradayReversalFiveMin from "../models/fiveMinMomentumSignal.model.js";
import redis from "../config/redisClient.js"; 
const ACCESS_TOKEN = process.env.DHAN_ACCESS_TOKEN;
const CLIENT_ID = process.env.DHAN_CLIENT_ID;
const WS_URL = `wss://api-feed.dhan.co?version=2&token=${ACCESS_TOKEN}&clientId=${CLIENT_ID}&authType=2`;


const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


let securityIdList = [];
let securityIdMap = new Map();
let marketDataBuffer = new Map();
let receivedSecurityIds = new Set();
let totalSecurityIds = 0;
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
      .filter((index) => index !== -1);

    const lastValidIndexes = validIndexes.slice(-n);

    return {
      open: lastValidIndexes.map((i) => rawData.open[i]),
      high: lastValidIndexes.map((i) => rawData.high[i]),
      low: lastValidIndexes.map((i) => rawData.low[i]),
      close: lastValidIndexes.map((i) => rawData.close[i]),
      volume: lastValidIndexes.map((i) => rawData.volume[i] || 0),
      timestamp: lastValidIndexes.map((i) => timestampsIST[i]),
    };
  }

  function convertToTenMinCandles(fiveMinData) {
    if (fiveMinData.timestamp.length < 2) {
      console.warn(`Insufficient 5-min candles for 10-min conversion: ${fiveMinData.securityId}`);
      return null;
    }

    const tenMinCandles = [];

    // Parse timestamps in the format "9/5/2025, 3:05:00 pm"
    const parseTimestamp = (ts) => {
      const [datePart, timePart] = ts.split(', ');
      const [day, month, year] = datePart.split('/');
      const [time, period] = timePart.split(' ');
      const [hours, minutes, seconds] = time.split(':');

      let hour = parseInt(hours);
      if (period.toLowerCase() === 'pm' && hour !== 12) hour += 12;
      if (period.toLowerCase() === 'am' && hour === 12) hour = 0;

      return new Date(year, month - 1, day, hour, minutes, seconds);
    };

    const timestamps = fiveMinData.timestamp.map(parseTimestamp);

    // Validate chronological order
    for (let i = 1; i < timestamps.length; i++) {
      if (timestamps[i] <= timestamps[i - 1]) {
        console.warn(`Non-chronological timestamps for ${fiveMinData.securityId}`);
        return null;
      }
    }

    // Check if the last candle is at 3:25 PM
    const lastTimestamp = timestamps[timestamps.length - 1];
    const lastHour = lastTimestamp.getHours();
    const lastMinute = lastTimestamp.getMinutes();
    const isLastCandle325 = lastHour === 15 && lastMinute === 25;

    if (isLastCandle325) {
      console.log(`3:25 PM candle detected for ${fiveMinData.securityId}, treating as 10-min candle`);

      // Merge the previous two candles (3:15 PM + 3:20 PM) if available
      if (timestamps.length >= 3) {
        const i1 = timestamps.length - 3; // 3:15 PM
        const i2 = timestamps.length - 2; // 3:20 PM
        if (
          i1 >= 0 &&
          i2 < fiveMinData.timestamp.length &&
          timestamps[i1].getHours() === 15 &&
          timestamps[i1].getMinutes() === 15 &&
          timestamps[i2].getHours() === 15 &&
          timestamps[i2].getMinutes() === 20
        ) {
          tenMinCandles.push({
            timestamp: fiveMinData.timestamp[i1],
            open: fiveMinData.open[i1],
            close: fiveMinData.close[i2],
            high: Math.max(fiveMinData.high[i1], fiveMinData.high[i2]),
            low: Math.min(fiveMinData.low[i1], fiveMinData.low[i2]),
            volume: (fiveMinData.volume[i1] || 0) + (fiveMinData.volume[i2] || 0),
          });
        } else {
          console.warn(`Invalid indices or timestamps for 10-min merge (3:15+3:20) for ${fiveMinData.securityId}: [${i1}, ${i2}]`);
        }
      }

      // Add the 3:25 PM candle as a standalone 10-minute candle
      tenMinCandles.push({
        timestamp: fiveMinData.timestamp[timestamps.length - 1],
        open: fiveMinData.open[timestamps.length - 1],
        close: fiveMinData.close[timestamps.length - 1],
        high: fiveMinData.high[timestamps.length - 1],
        low: fiveMinData.low[timestamps.length - 1],
        volume: fiveMinData.volume[timestamps.length - 1] || 0,
      });
    } else {
      // Merge pairs of 5-min candles, starting from the earliest pair
      for (let i = 0; i < timestamps.length - 1; i += 2) {
        const i1 = i; // First candle of the pair
        const i2 = i + 1; // Second candle of the pair
        if (i2 >= fiveMinData.timestamp.length) {
          break;
        }
        // Verify 5-minute interval between candles
        const timeDiff = (timestamps[i2] - timestamps[i1]) / (1000 * 60);
        if (timeDiff !== 5) {
          console.warn(`Invalid time interval between candles for ${fiveMinData.securityId}: ${timeDiff} minutes`);
          continue;
        }
        tenMinCandles.push({
          timestamp: fiveMinData.timestamp[i1],
          open: fiveMinData.open[i1],
          close: fiveMinData.close[i2],
          high: Math.max(fiveMinData.high[i1], fiveMinData.high[i2]),
          low: Math.min(fiveMinData.low[i1], fiveMinData.low[i2]),
          volume: (fiveMinData.volume[i1] || 0) + (fiveMinData.volume[i2] || 0),
        });
      }
    }

    // Sort candles by timestamp in ascending order (earliest first) to match 5-min candle order
    tenMinCandles.sort((a, b) => parseTimestamp(a.timestamp) - parseTimestamp(b.timestamp));

    if (tenMinCandles.length === 0) {
      console.warn(`No 10-min candles generated for ${fiveMinData.securityId}`);
      return null;
    }

    return {
      securityId: fiveMinData.securityId,
      timestamp: tenMinCandles.map((c) => c.timestamp),
      open: tenMinCandles.map((c) => c.open),
      high: tenMinCandles.map((c) => c.high),
      low: tenMinCandles.map((c) => c.low),
      close: tenMinCandles.map((c) => c.close),
      volume: tenMinCandles.map((c) => c.volume),
    };
  }

  async function saveToMongo(formattedData, interval) {
    const Model = interval === 5 ? FiveMinCandles : interval === 10 ? TenMinCandles : FifteenMinCandles;
    try {
      await Model.updateOne(
        { securityId: formattedData.securityId },
        {
          $set: {
            timestamp: formattedData.timestamp,
            open: formattedData.open,
            high: formattedData.high,
            low: formattedData.low,
            close: formattedData.close,
            volume: formattedData.volume,
          },
        },
        { upsert: true }
      );
      console.log(`💾 [MongoDB] ${interval}-min data saved for ${formattedData.securityId}`);
    } catch (error) {
      console.error(`❌ [MongoDB] Error saving ${interval}-min data for ${formattedData.securityId}:`, error.message);
    }
  }

  try {
    // === STEP 1: Process 5-Minute Candles ===
    for (let i = 0; i < securityIds.length; i++) {
      const id = securityIds[i];
      const redisKey5 = `stockFiveMinCandle:${id}:${fromDate}-${toDate}`;
      let data5 = await redis.get(redisKey5);

      if (data5) {
        console.log(`🔁 [Redis] 5-min data fetched from redis ${id} (${i + 1}/${securityIds.length})`);
        data5 = JSON.parse(data5);
      } else {
        // Fallback to database
        const dbData = await FiveMinCandles.findOne({ securityId: id }).lean();
        if (dbData) {
          console.log(`🔁 [MongoDB] 5-min data fetched from database for ${id} (${i + 1}/${securityIds.length})`);
          data5 = dbData;
          // Save to Redis
          await redis.set(redisKey5, JSON.stringify(data5), "EX", 120);
        } else {
          const rawData = await fetchHistoricalData(id, fromDate, toDate, i, "5");
          if (rawData) {
            const formatted5 = getLastNCompleteCandles(rawData, 5);
            formatted5.securityId = id;

            // Save to Redis
            await redis.set(redisKey5, JSON.stringify(formatted5), "EX", 120);
            console.log(`🌐 [API] 5-min data fetched & stored in redis for ${id} (${i + 1}/${securityIds.length})`);

            // Save to MongoDB
            await saveToMongo(formatted5, 5);

            data5 = formatted5;
          } else {
            console.warn(`⚠️ [API] No 5-min data for ${id}`);
            continue;
          }
        }
      }

      // === STEP 2: Process 10-Minute Candles ===
      const redisKey10 = `stockTenMinCandle:${id}:${fromDate}-${toDate}`;
      let data10 = await redis.get(redisKey10);

      if (data10) {
        console.log(`🔁 [Redis] 10-min data fetched from redis ${id} (${i + 1}/${securityIds.length})`);
      } else {
        const formatted10 = convertToTenMinCandles(data5);
        if (formatted10) {
          // Save to Redis
          await redis.set(redisKey10, JSON.stringify(formatted10), "EX", 240);
          console.log(`🌐 [Redis] 10-min data generated & stored in redis for ${id} (${i + 1}/${securityIds.length})`);

          // Save to MongoDB
          await saveToMongo(formatted10, 10);
        } else {
          console.warn(`⚠️ [Redis] No 10-min data generated for ${id}`);
        }
      }

      await delay(200);
    }

    console.log("✅ Completed all 5-minute and 10-minute candle data for all stocks.");

    // === STEP 3: Process 15-Minute Candles ===
    for (let i = 0; i < securityIds.length; i++) {
      const id = securityIds[i];
      const redisKey15 = `stockFifteenMinCandle:${id}:${fromDate}-${toDate}`;
      let data15 = await redis.get(redisKey15);

      if (data15) {
        console.log(`🔁 [Redis] 15-min data fetched from redis ${id} (${i + 1}/${securityIds.length})`);
      } else {
        const rawData = await fetchHistoricalData(id, fromDate, toDate, i, "15");
        if (rawData) {
          const formatted15 = getLastNCompleteCandles(rawData, 15);
          formatted15.securityId = id;

          // Save to Redis
          await redis.set(redisKey15, JSON.stringify(formatted15), "EX", 300);
          console.log(`🌐 [API] 15-min data fetched & stored in redis for ${id} (${i + 1}/${securityIds.length})`);

          // Save to MongoDB
          await saveToMongo(formatted15, 15);
        } else {
          console.warn(`⚠️ [API] No 15-min data for ${id}`);
        }
      }

      await delay(200); // Keep 200ms delay for 15-min candles
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
        console.warn(`No sufficient data for Security 5minmoment ID: ${securityId}`);
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
  .sort({ timestamp: -1 });

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
      // 1. Fetch stock metadata
      const stocks = await StocksDetail.find({}, { SECURITY_ID: 1, SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1, _id: 0 });
      if (!stocks?.length) return { message: "No stocks data found" };

      // 2. Create stock mapping
      const stockMap = new Map(stocks.map(entry => [
          entry.SECURITY_ID, 
          {
              UNDERLYING_SYMBOL: entry.UNDERLYING_SYMBOL,
              SYMBOL_NAME: entry.SYMBOL_NAME
          }
      ]));
      const securityIds = stocks.map(stock => stock.SECURITY_ID);

      // 3. Get latest market data
      const latestEntry = await MarketDetailData.findOne().sort({ date: -1 }).select("date");
      if (!latestEntry) return { message: "No stock data available" };

      const latestDate = latestEntry.date;
      const [latestData, previousDayEntry] = await Promise.all([
          MarketDetailData.find({ date: latestDate }),
          MarketDetailData.findOne({ date: { $lt: latestDate } }, { date: 1 }).sort({ date: -1 })
      ]);

      if (!latestData.length) return { message: "No stock data available for the latest date" };
      if (!previousDayEntry) return { message: "No previous stock data available" };

      // 4. Prepare price maps
      const createPriceMap = (data, priceField) => new Map(
          data.map(entry => [entry.securityId, entry.data?.[priceField]?.[0] || 0])
      );
      const latestDataMap = createPriceMap(latestData, 'latestTradedPrice');
      const yesterdayMap = createPriceMap(await MarketDetailData.find({ date: previousDayEntry.date }), 'dayClose');

      // 5. Convert 5-min to 10-min candles with strict pairing
      const convertToStrictTenMinCandles = (fiveMinCandles) => {
          const tenMinCandles = [];
          const len = fiveMinCandles.length;
          
          for (let i = 0; i < len - 1; i++) {
              const c1 = fiveMinCandles[i];
              const c2 = fiveMinCandles[i + 1];
              
              const c1Min = c1.timestamp.getMinutes();
              const c2Min = c2.timestamp.getMinutes();
              
              if (c1Min % 10 === 5 && c2Min === c1Min + 5) {
                  tenMinCandles.push({
                      timestamp: c1.timestamp,
                      periodEnd: new Date(c1.timestamp.getTime() + 10 * 60 * 1000),
                      open: c1.open,
                      close: c2.close,
                      high: Math.max(c1.high, c2.high),
                      low: Math.min(c1.low, c2.low),
                      isComplete: true
                  });
                  i++; // Skip next
              }
          }
      
          return tenMinCandles;
      };
      

      // 6. Process each security
      const momentumStocks = [];
      const tomorrowFormatted = new Date(latestDate);
      tomorrowFormatted.setDate(tomorrowFormatted.getDate() + 1);

      for (const securityId of securityIds) {
          const redisKey = `stockFiveMinCandle:${securityId}:${latestDate}-${tomorrowFormatted.toISOString().split("T")[0]}`;
          const cachedData = await redis.get(redisKey);
          if (!cachedData) continue;

          const data = JSON.parse(cachedData);
          if (!data?.high?.length || data.high.length < 4) continue;

          // Prepare candle data
          const candleData = data.timestamp.map((ts, i) => ({
              timestamp: new Date(ts),
              high: data.high[i],
              low: data.low[i],
              open: data.open[i],
              close: data.close[i]
          }));

          const tenMinCandles = convertToStrictTenMinCandles(candleData);
          if (tenMinCandles.length < 2) continue;

          // Analyze last two 10-min periods
          const current = tenMinCandles[tenMinCandles.length - 1];
          const previous = tenMinCandles[tenMinCandles.length - 2];
          
          const currentBody = Math.abs(current.close - current.open);
          const previousRange = previous.high - previous.low;
          const hasMomentum = currentBody >= previousRange * 2 && previousRange > 0.1;
          
          if (hasMomentum) {
              const stockInfo = stockMap.get(securityId) || {};
              const pctChange = ((latestDataMap.get(securityId) - yesterdayMap.get(securityId)) / yesterdayMap.get(securityId)) * 100 || 0;
              
              momentumStocks.push({
                  securityId,
                  symbol_name: stockInfo.SYMBOL_NAME || "Unknown",
                  symbol: stockInfo.UNDERLYING_SYMBOL || "Unknown",
                  previousHigh: previous.high,
                  previousLow: previous.low,
                  currentOpen: current.open,
                  currentClose: current.close,
                  momentumType: current.close > current.open ? "Bullish" : "Bearish",
                  priceChange: currentBody,
                  percentageChange: pctChange.toFixed(2),
                  timestamp: current.timestamp.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
                  period: `${previous.timestamp.toLocaleTimeString()} - ${current.timestamp.toLocaleTimeString()}`
              });
          }
      }

      // 7. Save and return results
      if (momentumStocks.length) {
          await MomentumStockTenMin.bulkWrite(
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
          message: momentumStocks.length ? "Momentum stocks found" : "No momentum signals",
          count: momentumStocks.length,
          data: momentumStocks
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
        console.warn(`No sufficient data for Security 5min reversal ID: ${securityId}`);
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
      .sort({ timestamp: -1 });
      

    if (fullData.length === 0) {
      return {
        message: "No momentum signals detected",
        data: [],
      };
    }

    return {
      message: "Momentum analysis complete",
      data: fullData,
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
        console.warn(`No sufficient data for Security 15min reversal ID: ${securityId}`);
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
      .sort({ timestamp: -1 });

    if (fullData.length === 0) {
      return {
        message: "No momentum signals detected",
        data: [],
      };
    }

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

const DailyRangeBreakout = async (req, res) => {
  try {
    // Helper function to format timestamp to Indian format
    const formatIndianDateTime = (unixTimestamp) => {
      const date = new Date(unixTimestamp * 1000);
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    };

    // Get latest market date
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date")
      .limit(1);

    if (!latestEntry) {
      return { message: "No stock data available" };
    }

    const latestDate = latestEntry.date;

    // Get previous trading day
    const previousEntry = await MarketDetailData.findOne({
      date: { $lt: latestDate },
    })
      .sort({ date: -1 })
      .limit(1);

    if (!previousEntry) {
      return { message: "No previous date available" };
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

    if (!latestData || latestData.length === 0) {
      return { message: "No latest stock data available" };
    }

    if (!previousData || previousData.length === 0) {
      return { message: "No previous stock data available" };
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

    // Get 5-minute candle data for all securities
    const updatedData = [];
    for (const securityId of securityIds) {
      const redisKey = `stockFiveMinCandle:${securityId}:${latestDate}`;
      let data;

      // Try Redis cache first
      const cachedData = await redis.get(redisKey);
      if (cachedData) {
        data = JSON.parse(cachedData);
      } else {
        // Fallback to database
        data = await FiveMinCandles.findOne({ securityId, date: latestDate }).lean();
      }

      if (!data || !data.open || !data.close || data.high.length < 5) {
        console.warn(`No sufficient data for Securityrangebreak ID: ${securityId}`);
        continue;
      }

      // Get the last 5 candles
      const lastFiveCandles = {
        timestamp: data.timestamp.slice(-5),
        open: data.open.slice(-5),
        close: data.close.slice(-5),
        high: data.high.slice(-5),
        low: data.low.slice(-5),
        volume: data.volume.slice(-5),
      };

      updatedData.push({
        securityId,
        ...lastFiveCandles,
      });
    }

    if (updatedData.length === 0) {
      return { message: "No candle data found" };
    }

    // Analyze each security for breakout pattern
    let breakoutStocks = [];
    for (const item of updatedData) {
      const securityId = item.securityId;
      const stock = stockMap.get(securityId);
      const latestTradedPrice = latestDataMap.get(securityId);
      const previousDayClose = previousDayDataMap.get(securityId);

      // Get the 5 candles data
      const highs = item.high;
      const lows = item.low;
      const opens = item.open;
      const closes = item.close;
      const timestamps = item.timestamp;

      // First candle range (index 0)
      const firstCandleHigh = highs[0];
      const firstCandleLow = lows[0];

      // Check if candles 2-4 (indices 1-3) open and close within first candle's range
      const areMiddleCandlesInRange = [1, 2, 3].every((i) => {
        return (
          opens[i] <= firstCandleHigh &&
          opens[i] >= firstCandleLow &&
          closes[i] <= firstCandleHigh &&
          closes[i] >= firstCandleLow
        );
      });

      if (areMiddleCandlesInRange) {
        // Latest (5th) candle data (index 4)
        const latestHigh = highs[4];
        const latestLow = lows[4];
        const latestOpen = opens[4];
        const latestClose = closes[4];
        const latestTimestamp = timestamps[4];

        // Calculate percentage change
        const percentageChange =
          latestTradedPrice && previousDayClose
            ? ((latestTradedPrice - previousDayClose) / previousDayClose) * 100
            : 0;

        // Bullish breakout: 5th candle closes above first candle high
        if (latestClose > firstCandleHigh) {
          const candleReturn = ((latestClose - latestOpen) / latestOpen) * 100;
          if (candleReturn >= 0.5) { // Ensure significant candle movement
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
              todayHigh: latestHigh,
              todayLow: latestLow,
              candleReturn: candleReturn.toFixed(2),
              timestamp: formatIndianDateTime(latestTimestamp),
              breakoutTime: formatIndianDateTime(Math.floor(Date.now() / 1000)),
            });
          }
        }
        // Bearish breakout: 5th candle closes below first candle low
        else if (latestClose < firstCandleLow) {
          const candleReturn = ((latestOpen - latestClose) / latestOpen) * 100;
          if (candleReturn >= 0.5) { // Ensure significant candle movement
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
              todayHigh: latestHigh,
              todayLow: latestLow,
              candleReturn: candleReturn.toFixed(2),
              timestamp: formatIndianDateTime(latestTimestamp),
              breakoutTime: formatIndianDateTime(Math.floor(Date.now() / 1000)),
            });
          }
        }
      }
    }

    // Save breakout signals to database
    if (breakoutStocks.length > 0) {
      await Promise.all(
        breakoutStocks.map(async (signal) => {
          try {
            await DailyRangeBreakouts.findOneAndUpdate(
              { securityId: signal.securityId, date: latestDate },
              { $set: { ...signal, date: latestDate } },
              { upsert: true, new: true }
            );
          } catch (dbError) {
            console.error(`Error saving ${signal.securityId}:`, dbError);
          }
        })
      );
    }

    // Get all breakout signals for the latest date
    const fullData = await DailyRangeBreakouts.find(
      { date: latestDate },
      { _id: 0, __v: 0, updatedAt: 0, createdAt: 0 }
    )
      .sort({ timestamp: -1 })

    return {
      message: breakoutStocks.length > 0
        ? "Breakout analysis complete"
        : "No breakout signals detected",
      data: fullData,
      currentBreakouts: breakoutStocks,
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
    // Get the latest trading day
    const latestTradingDay = await MarketDetailData.aggregate([
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);

    if (!latestTradingDay || latestTradingDay.length === 0) {
      return { message: "No trading data found" };
    }

    const latestDate = latestTradingDay[0]._id;
    const tomorrow = new Date(latestDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split("T")[0];

    // Fetch stock data for the latest trading day
    const stockData = await MarketDetailData.find(
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
    );

    if (!stockData || stockData.length === 0) {
      return { message: "No stock data found for the latest date" };
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
        symbolName: item.SYMBOL_NAME,
        underlyingSymbol: item.UNDERLYING_SYMBOL,
      });
    });

    const securityIds = stockData.map((item) => item.securityId);
    const stockDataMap = new Map();
    stockData.forEach((item) => {
      stockDataMap.set(item.securityId, {
        securityId: item.securityId,
        dayOpen: item.data?.dayOpen?.[0],
        dayClose: item.data?.dayClose?.[0],
        dayHigh: item.data?.dayHigh?.[0],
        dayLow: item.data?.dayLow?.[0],
        date: item.date,
        latestTradedPrice: item.data?.latestTradedPrice?.[0],
      });
    });

    const responseData = [];

    // Process each security for 5-minute candle data
    for (const securityId of securityIds) {
      const redisKey = `stockFiveMinCandle:${securityId}:${latestDate}-${tomorrowFormatted}`;
      const cachedData = await redis.get(redisKey);
      let redisData = cachedData ? JSON.parse(cachedData) : null;

      if (!redisData) {
        console.warn(`No 5-min data found for Security ID: ${securityId}`);
        continue;
      }

      const stockInfo = stockDataMap.get(securityId);
      const stocksDetail = stockDetailsMap.get(securityId);

      if (!stockInfo || !stocksDetail) {
        continue;
      }

      const dayHigh = stockInfo.dayHigh;
      const dayLow = stockInfo.dayLow;
      const highThreshold = dayHigh * 0.995; // Within 0.5% of day high
      const lowThreshold = dayLow * 1.005; // Within 0.5% of day low

      // Check 5-minute candles for reversal patterns
      for (let i = 0; i < redisData.high.length; i++) {
        const candleOpen = redisData.open[i];
        const candleClose = redisData.close[i];
        const candleHigh = redisData.high[i];
        const candleLow = redisData.low[i];
        const candleTimestamp = redisData.timestamp[i];

        const isRedCandle = candleClose < candleOpen;
        const isGreenCandle = candleClose > candleOpen;

        // Bearish reversal: Red candle near day high
        if (candleHigh >= highThreshold && isRedCandle) {
          responseData.push({
            securityId,
            ...stocksDetail,
            reversalPrice: candleClose,
            type: "Bearish",
            dayHigh,
            timestamp: candleTimestamp,
            percentageFromHigh: ((dayHigh - candleClose) / dayHigh) * 100,
          });
          break; // Store only the first occurrence
        }
        // Bullish reversal: Green candle near day low
        else if (candleLow <= lowThreshold && isGreenCandle) {
          responseData.push({
            securityId,
            ...stocksDetail,
            reversalPrice: candleClose,
            type: "Bullish",
            dayLow,
            timestamp: candleTimestamp,
            percentageFromLow: ((candleClose - dayLow) / dayLow) * 100,
          });
          break; // Store only the first occurrence
        }
      }
    }

    // Store results in database
    const bulkOps = responseData.map((item) => ({
      updateOne: {
        filter: { securityId: item.securityId, date: latestDate },
        update: { $set: { ...item, date: latestDate } },
        upsert: true,
      },
    }));

    await DayHighLowReversal.bulkWrite(bulkOps);

    // Fetch final data
    const data = await DayHighLowReversal.find(
      { date: latestDate },
      {
        securityId: 1,
        symbolName: 1,
        underlyingSymbol: 1,
        type: 1,
        timestamp: 1,
        reversalPrice: 1,
        percentageFromHigh: 1,
        percentageFromLow: 1,
        _id: 0,
      }
    );

    return {
      message: "Day High Low Reversal analysis complete",
      data,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const twoDayHLBreak = async (req, res) => {
  try {
    // Get the latest 3 unique trading days
    const uniqueTradingDays = await MarketDetailData.aggregate([
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } },
      { $limit: 3 },
    ]);

    if (!uniqueTradingDays || uniqueTradingDays.length < 3) {
      return { message: "Not enough historical data found" };
    }

    const latestDate = uniqueTradingDays[0]._id;
    const tomorrow = new Date(latestDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split("T")[0];
    const firstPrevTargetDate = uniqueTradingDays[1]._id;
    const secondPrevTargetDate = uniqueTradingDays[2]._id;

    // Fetch stock data for the two previous days
    const [firstPrevStockData, secondPrevStockData] = await Promise.all([
      MarketDetailData.find(
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
      ),
      MarketDetailData.find(
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
      ),
    ]);

    if (!firstPrevStockData.length || !secondPrevStockData.length) {
      return { message: "No stock data found for the selected dates" };
    }

    // Create maps for stock data
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

    // Fetch stock details
    const stockDetails = await StocksDetail.find(
      {},
      { SECURITY_ID: 1, SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1 }
    );
    const stockDetailsMap = new Map();
    stockDetails.forEach((item) => {
      stockDetailsMap.set(item.SECURITY_ID, {
        symbolName: item.SYMBOL_NAME,
        underlyingSymbol: item.UNDERLYING_SYMBOL,
      });
    });

    const responseData = [];

    // Process each security
    for (const securityId of securityIds) {
      const redisKey = `stockFiveMinCandle:${securityId}:${latestDate}-${tomorrowFormatted}`;
      const cachedData = await redis.get(redisKey);
      let redisData = cachedData ? JSON.parse(cachedData) : null;

      if (!redisData) {
        console.warn(`No 5-min data found for Security ID: ${securityId}`);
        continue;
      }

      const firstPrevDayData = firstPrevStockDataMap.get(securityId);
      const secondPrevDayData = secondPrevStockDataMap.get(securityId);
      const stocksDetail = stockDetailsMap.get(securityId);

      if (!firstPrevDayData || !secondPrevDayData || !stocksDetail) {
        continue;
      }

      // Calculate 2-day high/low with 1% tolerance
      const firstPrevDayHigh = firstPrevDayData.dayHigh;
      const firstPrevDayLow = firstPrevDayData.dayLow;
      const secondPrevDayHigh = secondPrevDayData.dayHigh;
      const secondPrevDayLow = secondPrevDayData.dayLow;
      const secondPrevDayClose = secondPrevDayData.dayClose;
      const latestTradedPrice = firstPrevDayData.latestTradedPrice;

      const maxHigh = Math.max(firstPrevDayHigh, secondPrevDayHigh);
      const minLow = Math.min(firstPrevDayLow, secondPrevDayLow);
      const highThreshold = maxHigh * 1.01; // 1% above max high
      const lowThreshold = minLow * 0.99; // 1% below min low

      let breakRecorded = false;
      let breakType = null;
      let breakTimestamp = null;
      let breakPrice = null;
      let percentageChange = ((latestTradedPrice - secondPrevDayClose) / secondPrevDayClose) * 100;

      // Check 5-min candles for breaks
      for (let i = 0; i < redisData.high.length; i++) {
        const candleHigh = redisData.high[i];
        const candleLow = redisData.low[i];
        const candleClose = redisData.close[i];
        const candleTimestamp = redisData.timestamp[i];

        if (breakRecorded) break; // Only record first break of the day

        // Bullish break: high > threshold and close > threshold
        if (candleHigh > highThreshold && candleClose > highThreshold) {
          breakRecorded = true;
          breakType = "Bullish";
          breakTimestamp = candleTimestamp;
          breakPrice = candleHigh;
          responseData.push({
            securityId,
            ...stocksDetail,
            breakPrice,
            type: breakType,
            maxHigh,
            timestamp: breakTimestamp,
            percentageChange,
          });
        }
        // Bearish break: low < threshold and close < threshold
        else if (candleLow < lowThreshold && candleClose < lowThreshold) {
          breakRecorded = true;
          breakType = "Bearish";
          breakTimestamp = candleTimestamp;
          breakPrice = candleLow;
          responseData.push({
            securityId,
            ...stocksDetail,
            breakPrice,
            type: breakType,
            minLow,
            timestamp: breakTimestamp,
            percentageChange,
          });
        }
      }
    }

    // Store results in database
    const bulkOps = responseData.map((item) => ({
      updateOne: {
        filter: { securityId: item.securityId, date: latestDate },
        update: { $set: { ...item, date: latestDate } },
        upsert: true,
      },
    }));

    await TwoDayHighLowBreak.bulkWrite(bulkOps);

    // Fetch final data
    const data = await TwoDayHighLowBreak.find(
      { date: latestDate },
      {
        securityId: 1,
        symbolName: 1,
        underlyingSymbol: 1,
        type: 1,
        timestamp: 1,
        percentageChange: 1,
        breakPrice: 1,
        _id: 0,
      }
    );
    

    return {
      message: "Two Day High Low Break analysis complete",
      data,
    };
  } catch (error) {
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
