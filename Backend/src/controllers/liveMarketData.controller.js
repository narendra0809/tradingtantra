import WebSocket from "ws";
import connectDB from "../config/db.js";
import StocksDetail from "../models/stocksDetail.model.js";
import parseBinaryData from "../utils/parseBinaryData.js";
import {
  fetchHistoricalData,
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
    setTimeout(startWebSocket, 4000);
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
    if (!rawData?.timestamp?.length) {
      console.warn(`[CandleProcess] No timestamp data for interval ${interval}`);
      return null;
    }

    const timestampsIST = rawData.timestamp.map(convertToIST);
    const validIndexes = timestampsIST
      .map((time, index) => (isCandleComplete(time, interval) ? index : -1))
      .filter((index) => index !== -1);

    if (validIndexes.length < n) {
      console.warn(`[CandleProcess] Insufficient valid candles for interval ${interval}: ${validIndexes.length}/${n}`);
      const lastIndexes = Array.from({ length: Math.min(n, rawData.timestamp.length) }, (_, i) => rawData.timestamp.length - 1 - i).reverse();
      return {
        open: lastIndexes.map((i) => rawData.open[i] || 0),
        high: lastIndexes.map((i) => rawData.high[i] || 0),
        low: lastIndexes.map((i) => rawData.low[i] || 0),
        close: lastIndexes.map((i) => rawData.close[i] || 0),
        volume: lastIndexes.map((i) => rawData.volume[i] || 0),
        timestamp: lastIndexes.map((i) => timestampsIST[i]),
      };
    }

    const lastValidIndexes = validIndexes.slice(-n);
    return {
      open: lastValidIndexes.map((i) => rawData.open[i] || 0),
      high: lastValidIndexes.map((i) => rawData.high[i] || 0),
      low: lastValidIndexes.map((i) => rawData.low[i] || 0),
      close: lastValidIndexes.map((i) => rawData.close[i] || 0),
      volume: lastValidIndexes.map((i) => rawData.volume[i] || 0),
      timestamp: lastValidIndexes.map((i) => timestampsIST[i]),
    };
  }

  function convertToTenMinCandles(fiveMinData) {
    if (!fiveMinData?.timestamp?.length || fiveMinData.timestamp.length < 2) {
      console.warn(`[TenMin] Insufficient 5-min candles for ${fiveMinData.securityId}: ${fiveMinData.timestamp?.length || 0}`);
      return null;
    }

    const tenMinCandles = [];
    const parseTimestamp = (ts) => {
      const [datePart, timePart] = ts.split(", ");
      const [day, month, year] = datePart.split("/");
      const [time, period] = timePart.split(" ");
      const [hours, minutes, seconds] = time.split(":");

      let hour = parseInt(hours);
      if (period.toLowerCase() === "pm" && hour !== 12) hour += 12;
      if (period.toLowerCase() === "am" && hour === 12) hour = 0;

      return new Date(year, month - 1, day, hour, minutes, seconds);
    };

    const timestamps = fiveMinData.timestamp.map(parseTimestamp);

    for (let i = 1; i < timestamps.length; i++) {
      if (timestamps[i] <= timestamps[i - 1]) {
        console.warn(`[TenMin] Non-chronological timestamps for ${fiveMinData.securityId}`);
        return null;
      }
    }

    const lastTimestamp = timestamps[timestamps.length - 1];
    const lastHour = lastTimestamp.getHours();
    const lastMinute = lastTimestamp.getMinutes();
    const isLastCandle325 = lastHour === 15 && lastMinute === 25;

    if (isLastCandle325) {
      if (timestamps.length >= 3) {
        const i1 = timestamps.length - 3; // 3:15 PM
        const i2 = timestamps.length - 2; // 3:20 PM
        if (
          i1 >= 0 &&
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
        }
      }
      tenMinCandles.push({
        timestamp: fiveMinData.timestamp[timestamps.length - 1],
        open: fiveMinData.open[timestamps.length - 1],
        close: fiveMinData.close[timestamps.length - 1],
        high: fiveMinData.high[timestamps.length - 1],
        low: fiveMinData.low[timestamps.length - 1],
        volume: fiveMinData.volume[timestamps.length - 1] || 0,
      });
    } else {
      for (let i = 0; i < timestamps.length - 1; i += 2) {
        const i1 = i;
        const i2 = i + 1;
        if (i2 >= fiveMinData.timestamp.length) break;
        const timeDiff = (timestamps[i2] - timestamps[i1]) / (1000 * 60);
        if (timeDiff !== 5) {
          console.warn(`[TenMin] Invalid interval for ${fiveMinData.securityId}: ${timeDiff}min`);
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

    tenMinCandles.sort((a, b) => parseTimestamp(a.timestamp) - parseTimestamp(b.timestamp));
    if (tenMinCandles.length === 0) {
      console.warn(`[TenMin] No 10-min candles generated for ${fiveMinData.securityId}`);
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
    } catch (error) {
      console.error(`❌ [MongoDB] Error saving ${interval}-min data for ${formattedData.securityId}:`, error.message);
    }
  }

  try {
    // Clear Redis cache to ensure fresh data
    for (const id of securityIds) {
      await redis.del(`stockFiveMinCandle:${id}:${fromDate}-${toDate}`);
    }

    // === STEP 1: Process 5-Minute Candles ===
    for (let i = 0; i < securityIds.length; i++) {
      const id = securityIds[i];
      const redisKey5 = `stockFiveMinCandle:${id}:${fromDate}-${toDate}`;
      let data5 = await redis.get(redisKey5);

      if (data5) {
        data5 = JSON.parse(data5);
      } else {
        const rawData = await fetchHistoricalData(id, fromDate, toDate, i, "5");
        if (rawData) {
          const formatted5 = getLastNCompleteCandles(rawData, 5);
          if (!formatted5) {
            console.warn(`[CandleProcess] Failed to format 5-min candles for ${id}`);
            continue;
          }
          formatted5.securityId = id;
          await redis.set(redisKey5, JSON.stringify(formatted5), "EX", 120);
          await saveToMongo(formatted5, 5);
          data5 = formatted5;
        } else {
          console.warn(`⚠️ [API] No 5-min data for ${id}`);
          continue;
        }
      }

      // === STEP 2: Process 10-Minute Candles ===
      const redisKey10 = `stockTenMinCandle:${id}:${fromDate}-${toDate}`;
      let data10 = await redis.get(redisKey10);

      if (!data10) {
        const formatted10 = convertToTenMinCandles(data5);
        if (formatted10) {
          await redis.set(redisKey10, JSON.stringify(formatted10), "EX", 240);
          await saveToMongo(formatted10, 10);
        } else {
          console.warn(`⚠️ [TenMin] No 10-min data for ${id}`);
        }
      }

      await delay(200);
    }

    console.log("✅ Completed 5-minute and 10-minute candle data.");

    // === STEP 3: Process 15-Minute Candles ===
    for (let i = 0; i < securityIds.length; i++) {
      const id = securityIds[i];
      const redisKey15 = `stockFifteenMinCandle:${id}:${fromDate}-${toDate}`;
      let data15 = await redis.get(redisKey15);

      if (!data15) {
        const rawData = await fetchHistoricalData(id, fromDate, toDate, i, "15");
        if (rawData) {
          const formatted15 = getLastNCompleteCandles(rawData, 15);
          if (!formatted15) {
            console.warn(`[CandleProcess] Failed to format 15-min candles for ${id}`);
            continue;
          }
          formatted15.securityId = id;
          await redis.set(redisKey15, JSON.stringify(formatted15), "EX", 300);
          await saveToMongo(formatted15, 15);
        } else {
          console.warn(`⚠️ [API] No 15-min data for ${id}`);
        }
      }

      await delay(200);
    }

    console.log("✅ Completed 15-minute candle data.");
  } catch (error) {
    console.error("❌ Error in getData:", error.message);
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
        // console.warn(`No sufficient data for Security 5minmoment ID: ${securityId}`);
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
        updatedData: updatedDataFromDB.slice(0, 30),
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
        updatedAt: -1,
        previousHigh: 1,
        previousLow: 1,
        previousOpen: 1,
        previousClose: 1,
        currentOpen: 1,
        currentClose: 1,
        _id: 0,
      }
    )
      .sort({ updatedAt: -1 }) // Ensure descending order by timestamp
      .lean();

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

    // return {
    //     message: momentumStocks.length ? "Momentum stocks found" : "No momentum signals",
    //     count: momentumStocks.length,
    //     data: momentumStocks
    // };
    const allMomentumStocks = await MomentumStockTenMin.find(
      {},
      {
        securityId: 1,
        symbol_name: 1,
        symbol: 1,
        momentumType: 1,
        timestamp: 1,
        percentageChange: 1,
        updatedAt: -1,
        previousHigh: 1,
        previousLow: 1,
        currentOpen: 1,
        currentClose: 1,
        period: 1,
        _id: 0,
      }
    )
      .sort({ updatedAt: -1 }) // Sort by timestamp in descending order
      .lean();

    return {
      message: "Momentum stocks fetched successfully",
      count: allMomentumStocks.length,
      data: allMomentumStocks,
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
        data = await FiveMinCandles.findOne({ securityId }).lean();
      }

      if (!data || !data.open || !data.close || data.open.length < 5) {
        // console.warn(`No sufficient data for Security 5min reversal ID: ${securityId}`);

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

    // const fullData = await IntradayReversalFiveMin.find(
    //   {},
    //   {
    //     _id: 0,
    //     __v: 0,
    //     lastTradePrice: 0,
    //     previousClosePrice: 0,
    //     updatedAt: 0,
    //   }
    // )
    //   .sort({ timestamp: -1 });


    // if (fullData.length === 0) {
    //   return {
    //     message: "No momentum signals detected",
    //     data: [],
    //   };
    // }

    const allMomentumStocks = await IntradayReversalFiveMin.find(
      {},
      {
        securityId: 1,
        stockSymbol: 1,
        stockName: 1,
        type: 1,
        timestamp: 1,
        updatedAt: -1,
        overAllPercentageChange: 1,
        _id: 0,
      }
    )
      .sort({ updatedAt: -1 }) // Sort by timestamp in descending order
      .lean();

    return {
      message: "Intraday reversal stocks fetched successfully",
      count: allMomentumStocks.length,
      data: allMomentumStocks,
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
      } else {
        // console.log(`Data for ${securityId} not found in Redis, fetching from database`);
        data = await FifteenMinCandles.findOne({ securityId }).lean();
        //  console.log(`Data fetched from database for ${securityId}:`, data);
      }

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
    createdAt: 0
    // Removed timestamp
  }
)
.sort({ updatedAt: -1 })
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

const DailyRangeBreakout = async (req, res) => {
  try {
    // Helper function to format timestamp to Indian format
    function validateAndFormatTimestamp(timestamp) {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.error("Invalid timestamp:", timestamp);
        return null;
      }
      return date.toISOString(); // Convert to ISO 8601 format
    }

    // Get latest market date
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date")
      .limit(1);

    if (!latestEntry) {
      return res.status(404).json({ message: "No stock data available" });
    }

    const latestDate = latestEntry.date;

    // Get previous trading day
    const previousEntry = await MarketDetailData.findOne({
      date: { $lt: latestDate },
    })
      .sort({ date: -1 })
      .limit(1);

    if (!previousEntry) {
      return res.status(404).json({ message: "No previous date available" });
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
      return res.status(404).json({ message: "No latest stock data available" });
    }

    if (!previousData || previousData.length === 0) {
      return res.status(404).json({ message: "No previous stock data available" });
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
      return res.status(404).json({ message: "No stocks data found" });
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
        data = await FiveMinCandles.findOne({ securityId }).lean();
      }

      if (!data || !data.open || !data.close || data.high.length < 5) {
        console.warn(`No sufficient data for Security ID: ${securityId}`);
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

      // 5th candle data (index 4)
      const latestOpen = opens[4];
      const latestClose = closes[4];
      const latestHigh = highs[4];
      const latestLow = lows[4];
      const latestTimestamp = timestamps[4];

      // Calculate 5th candle return
      const candleReturnBullish = ((latestClose - latestOpen) / latestOpen) * 100;
      const candleReturnBearish = ((latestOpen - latestClose) / latestOpen) * 100;

      // Check middle candles range
      const areMiddleCandlesInRange = [1, 2, 3].every((i) => {
        return (
          opens[i] <= firstCandleHigh &&
          opens[i] >= firstCandleLow &&
          closes[i] <= firstCandleHigh &&
          closes[i] >= firstCandleLow
        );
      });



      // Breakout logic
      if (areMiddleCandlesInRange) {
        // Calculate percentage change
        const percentageChange =
          latestTradedPrice && previousDayClose
            ? ((latestTradedPrice - previousDayClose) / previousDayClose) * 100
            : 0;

        // Bullish breakout: 5th candle closes above first candle high
        if (latestClose > firstCandleHigh) {
          if (candleReturnBullish >= 0.5) {
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
              candleReturn: candleReturnBullish.toFixed(2),
              timestamp: latestTimestamp,
              breakoutTime: validateAndFormatTimestamp(Math.floor(Date.now() / 1000)),
              date: latestDate,
            });
          } else {
            // console.log(`[BreakoutSkip] ${securityId} Bullish breakout skipped: Insufficient candle return (${candleReturnBullish.toFixed(2)}% < 0.5%)`);
          }
        }
        // Bearish breakout: 5th candle closes below first candle low
        else if (latestClose < firstCandleLow) {
          if (candleReturnBearish >= 0.5) {
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
              candleReturn: candleReturnBearish.toFixed(2),
              timestamp: latestTimestamp,
              breakoutTime: validateAndFormatTimestamp(Math.floor(Date.now() / 1000)),
              date: latestDate,
            });
          } else {
            // console.log(`[BreakoutSkip] ${securityId} Bearish breakout skipped: Insufficient candle return (${candleReturnBearish.toFixed(2)}% < 0.5%)`);
          }
        }
      } else if (latestClose > firstCandleHigh || latestClose < firstCandleLow) {
        // console.log(`[BreakoutSkip] ${securityId} Breakout skipped: Middle candles not in range`);
      }
    }

    // Save ALL breakout signals to database (both bullish and bearish)
    if (breakoutStocks.length > 0) {
      const bulkOps = breakoutStocks.map((signal) => ({
        updateOne: {
          filter: {
            securityId: signal.securityId,
            date: latestDate,
            type: signal.type,
          },
          update: {
            $set: signal,
          },
          upsert: true,
        },
      }));

      try {
        await DailyRangeBreakouts.bulkWrite(bulkOps);
        // console.log(
        //   `Saved ${breakoutStocks.length} breakouts (${breakoutStocks.filter((b) => b.type === "Bullish").length} bullish, ${
        //     breakoutStocks.filter((b) => b.type === "Bearish").length
        //   } bearish)`
        // );
      } catch (dbError) {
        console.error("Error saving breakouts:", dbError);
        return res.status(500).json({
          message: "Error saving to database",
          error: dbError.message,
        });
      }
    }

    // Get all breakout signals for the latest date
    const fullData = await DailyRangeBreakouts.find(
      {},
      { _id: 0, __v: 0, updatedAt: 0, createdAt: 0 }
    )
      .sort({ timestamp: -1 }) // Already sorted
      .lean();

    // Sort currentBreakouts by timestamp in descending order
    breakoutStocks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      message: breakoutStocks.length > 0 ? "Breakout analysis complete" : "No breakout signals detected",
      data: fullData,
      currentBreakouts: breakoutStocks,
      stats: {
        total: breakoutStocks.length,
        bullish: breakoutStocks.filter((b) => b.type === "Bullish").length,
        bearish: breakoutStocks.filter((b) => b.type === "Bearish").length,
      },
    };
  } catch (error) {
    console.error("Error in DailyRangeBreakout:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const DayHighLowReversal = async () => {
  try {
    // Get the latest trading day
    const latestTradingDay = await MarketDetailData.aggregate([
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);

    if (!latestTradingDay || latestTradingDay.length === 0) {
      throw new Error("No trading data found");
    }

    const latestDate = latestTradingDay[0]._id;

    // Get the previous trading day
    const previousTradingDay = await MarketDetailData.aggregate([
      { $match: { date: { $lt: latestDate } } },
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);

    const previousDate = previousTradingDay[0]?._id;

    // Fetch stock data for the latest and previous trading day
    const [stockData, previousStockData] = await Promise.all([
      MarketDetailData.find(
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
      ),
      previousDate
        ? MarketDetailData.find(
          { date: previousDate },
          {
            securityId: 1,
            "data.dayClose": 1,
            date: 1,
            _id: 0,
          }
        )
        : [],
    ]);

    if (!stockData || stockData.length === 0) {
      throw new Error("No stock data found for the latest date");
    }

    // Fetch stock details
    const stockDetails = await StocksDetail.find(
      {},
      { SECURITY_ID: 1, SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1 }
    );

    if (!stockDetails) {
      throw new Error("No stocks info found");
    }

    const stockDetailsMap = new Map();
    stockDetails.forEach((item) => {
      stockDetailsMap.set(item.SECURITY_ID, {
        symbolName: item.SYMBOL_NAME || "N/A",
        underlyingSymbol: item.UNDERLYING_SYMBOL || "N/A",
      });
    });

    const securityIds = stockData.map((item) => item.securityId);
    const stockDataMap = new Map();
    stockData.forEach((item) => {
      stockDataMap.set(item.securityId, {
        securityId: item.securityId,
        dayOpen: item.data?.dayOpen?.[0] || 0,
        dayClose: item.data?.dayClose?.[0] || 0,
        dayHigh: item.data?.dayHigh?.[0] || 0,
        dayLow: item.data?.dayLow?.[0] || 0,
        date: item.date,
        latestTradedPrice: item.data?.latestTradedPrice?.[0] || 0,
      });
    });

    const previousStockDataMap = new Map();
    previousStockData.forEach((item) => {
      previousStockDataMap.set(item.securityId, {
        dayClose: item.data?.dayClose?.[0] || 0,
      });
    });

    const responseData = [];

    // Process each security for the last 5-minute candle
    for (const securityId of securityIds) {
      // Optional: Check if stock already has a reversal recorded for today
      const existingReversal = await HighLowReversal.findOne({
        securityId,
        date: latestDate,
      });
      if (existingReversal) {
        continue; // Skip if already recorded
      }

      const redisKey = `stockFiveMinCandle:${securityId}:${latestDate}`;
      let redisData;
      const cachedData = await redis.get(redisKey);
      if (cachedData) {
        redisData = JSON.parse(cachedData);
      } else {
        redisData = await FiveMinCandles.findOne({ securityId }).lean();
      }

      if (!redisData || !redisData.high || redisData.high.length === 0) {
        console.warn(`No sufficient candle data for securityId: ${securityId}`);
        continue;
      }

      const stockInfo = stockDataMap.get(securityId);
      const stocksDetail = stockDetailsMap.get(securityId);
      const previousDayData = previousStockDataMap.get(securityId);

      if (!stockInfo || !stocksDetail || !stockInfo.dayHigh || !stockInfo.dayLow) {
        continue;
      }

      const dayHigh = stockInfo.dayHigh;
      const dayLow = stockInfo.dayLow;
      const highThreshold = dayHigh * 0.9975; // Within 0.25% of day high
      const lowThreshold = dayLow * 1.0025; // Within 0.25% of day low
      const latestTradedPrice = stockInfo.latestTradedPrice;
      const previousDayClose = previousDayData?.dayClose || 0;
      const percentageChange =
        latestTradedPrice && previousDayClose
          ? ((latestTradedPrice - previousDayClose) / previousDayClose * 100).toFixed(2)
          : 0;

      // Get the last 5-minute candle
      const lastIndex = redisData.high.length - 1;
      const candleOpen = redisData.open[lastIndex];
      const candleClose = redisData.close[lastIndex];
      const candleHigh = redisData.high[lastIndex];
      const candleLow = redisData.low[lastIndex];
      const candleTimestamp = redisData.timestamp[lastIndex];

      const isRedCandle = candleOpen > candleClose; // Bearish
      const isGreenCandle = candleOpen < candleClose; // Bullish

      // Bearish reversal: Red candle near day high
      if (candleHigh >= highThreshold && isRedCandle) {
        responseData.push({
          securityId,
          symbolName: stocksDetail.symbolName,
          underlyingSymbol: stocksDetail.underlyingSymbol,
          type: "Bearish",
          reversalPrice: candleClose,
          dayHigh,
          timestamp: candleTimestamp,
          percentageChange: parseFloat(percentageChange),
          date: latestDate,
        });
      }
      // Bullish reversal: Green candle near day low
      else if (candleLow <= lowThreshold && isGreenCandle) {
        responseData.push({
          securityId,
          symbolName: stocksDetail.symbolName,
          underlyingSymbol: stocksDetail.underlyingSymbol,
          type: "Bullish",
          reversalPrice: candleClose,
          dayLow,
          timestamp: candleTimestamp,
          percentageChange: parseFloat(percentageChange),
          date: latestDate,
        });
      }
    }

    // Store results in database
    if (responseData.length > 0) {
      const bulkOps = responseData.map((item) => ({
        updateOne: {
          filter: { securityId: item.securityId, date: latestDate, type: item.type },
          update: { $set: item },
          upsert: true,
        },
      }));
      await HighLowReversal.bulkWrite(bulkOps);
    }

    // Fetch final data
    const data = await HighLowReversal.find(
      {},
      {
        securityId: 1,
        symbolName: 1,
        underlyingSymbol: 1,
        type: 1,
        timestamp: 1,
        reversalPrice: 1,
        percentageChange: 1,
        updatedAt: -1,
        _id: 0,
      }
    )
      .sort({ updatedAt: -1 }) // Already sorted by timestamp in descending order
      .lean();

    return {
      message: responseData.length > 0 ? "Day High Low Reversal analysis complete" : "No reversals detected",
      data,
    };
  } catch (error) {
    console.error("Error in DayHighLowReversal:", error);
    return { success: false, message: error.message };
  }
};

const twoDayHLBreak = async () => {
  try {
    // Get the latest 3 unique trading days
    const uniqueTradingDays = await MarketDetailData.aggregate([
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } },
      { $limit: 3 },
    ]);

    if (!uniqueTradingDays || uniqueTradingDays.length < 3) {
      throw new Error("Not enough historical data found");
    }

    const latestDate = uniqueTradingDays[0]._id;
    const firstPrevTargetDate = uniqueTradingDays[1]._id;
    const secondPrevTargetDate = uniqueTradingDays[2]._id;

    // Fetch stock data for the two previous days
    const [firstPrevStockData, secondPrevStockData] = await Promise.all([
      MarketDetailData.find(
        { date: firstPrevTargetDate },
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
      ),
      MarketDetailData.find(
        { date: secondPrevTargetDate },
        {
          securityId: 1,
          "data.dayOpen": 1,
          "data.dayClose": 1,
          "data.dayHigh": 1,
          "data.dayLow": 1,
          date: 1,
          _id: 0,
        }
      ),
    ]);

    if (!firstPrevStockData.length || !secondPrevStockData.length) {
      throw new Error("No stock data found for the selected dates");
    }

    // Create maps for stock data
    const securityIds = firstPrevStockData.map((item) => item.securityId);
    const firstPrevStockDataMap = new Map();
    firstPrevStockData.forEach((item) => {
      firstPrevStockDataMap.set(item.securityId, {
        securityId: item.securityId,
        dayOpen: item.data?.dayOpen?.[0] || 0,
        dayClose: item.data?.dayClose?.[0] || 0,
        dayHigh: item.data?.dayHigh?.[0] || 0,
        dayLow: item.data?.dayLow?.[0] || 0,
        date: item.date,
        latestTradedPrice: item.data?.latestTradedPrice?.[0] || 0,
      });
    });

    const secondPrevStockDataMap = new Map();
    secondPrevStockData.forEach((item) => {
      secondPrevStockDataMap.set(item.securityId, {
        securityId: item.securityId,
        dayOpen: item.data?.dayOpen?.[0] || 0,
        dayClose: item.data?.dayClose?.[0] || 0,
        dayHigh: item.data?.dayHigh?.[0] || 0,
        dayLow: item.data?.dayLow?.[0] || 0,
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
        symbolName: item.SYMBOL_NAME || "N/A",
        underlyingSymbol: item.UNDERLYING_SYMBOL || "N/A",
      });
    });

    const responseData = [];

    // Process each security
    for (const securityId of securityIds) {
      // Check if stock already has a breakout recorded for today
      const existingBreak = await TwoDayHighLowBreak.findOne({
        securityId,
        date: latestDate,
      });
      if (existingBreak) {
        continue; // Skip if already recorded
      }

      const redisKey = `stockFiveMinCandle:${securityId}:${latestDate}`;
      let redisData;
      const cachedData = await redis.get(redisKey);
      if (cachedData) {
        redisData = JSON.parse(cachedData);
      } else {
        redisData = await FiveMinCandles.findOne({ securityId }).lean();
      }

      if (!redisData || !redisData.high || redisData.high.length === 0) {
        console.warn(`No sufficient candle data for securityId: ${securityId}`);
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

      // Get the last 5-minute candle
      const lastIndex = redisData.high.length - 1;
      const candleHigh = redisData.high[lastIndex];
      const candleLow = redisData.low[lastIndex];
      const candleClose = redisData.close[lastIndex];
      const candleTimestamp = redisData.timestamp[lastIndex];

      // Bullish break: high > threshold and close > threshold
      if (candleHigh > highThreshold && candleClose > highThreshold) {
        responseData.push({
          securityId,
          symbolName: stocksDetail.symbolName,
          underlyingSymbol: stocksDetail.underlyingSymbol,
          type: "Bullish",
          breakPrice: candleHigh,
          maxHigh,
          timestamp: candleTimestamp,
          percentageChange: parseFloat(((latestTradedPrice - secondPrevDayClose) / secondPrevDayClose * 100).toFixed(2)),
          date: latestDate,
        });
      }
      // Bearish break: low < threshold and close < threshold
      else if (candleLow < lowThreshold && candleClose < lowThreshold) {
        responseData.push({
          securityId,
          symbolName: stocksDetail.symbolName,
          underlyingSymbol: stocksDetail.underlyingSymbol,
          type: "Bearish",
          breakPrice: candleLow,
          minLow,
          timestamp: candleTimestamp,
          percentageChange: parseFloat(((latestTradedPrice - secondPrevDayClose) / secondPrevDayClose * 100).toFixed(2)),
          date: latestDate,
        });
      }
    }

    // Store results in database
    if (responseData.length > 0) {
      const bulkOps = responseData.map((item) => ({
        updateOne: {
          filter: { securityId: item.securityId, date: latestDate, type: item.type },
          update: { $set: item },
          upsert: true,
        },
      }));
      await TwoDayHighLowBreak.bulkWrite(bulkOps);
    }

    // Fetch final data
    const data = await TwoDayHighLowBreak.find(
      {},
      {
        securityId: 1,
        symbolName: 1,
        underlyingSymbol: 1,
        type: 1,
        timestamp: 1,
        breakPrice: 1,
        percentageChange: 1,
        updatedAt: -1,
        _id: 0,
      }
    )
      .sort({ updatedAt: -1 }) // Already sorted by timestamp in descending order
      .lean();

    return {
      message: responseData.length > 0 ? "Two Day High Low Break analysis complete" : "No breakouts detected",
      data,
    };
  } catch (error) {
    console.error("Error in twoDayHLBreak:", error);
    return { success: false, message: error.message };
  }
};
export {
  startWebSocket,
  getData,
  AIIntradayReversalFiveMins, //done with database👍socket  cross checked ✅
  AIMomentumCatcherFiveMins, //done with database👍socket   cross checked ✅
  AIMomentumCatcherTenMins, //done with database👍socket    cross checked ✅
  AIIntradayReversalDaily, //done with database👍socket     cross checked ✅
  DailyRangeBreakout, //done with database👍socket          cross checked ✅
  DayHighLowReversal, //done with database👍socket          cross checked ✅
  twoDayHLBreak, //done with data base 👍 socket            cross checked ✅
};
