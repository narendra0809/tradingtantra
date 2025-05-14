import WebSocket from "ws";
import connectDB from "../config/db.js";
import StocksDetail from "../models/stocksDetail.model.js";
import parseBinaryData from "../utils/parseBinaryData.js";
import {
  fetchHistoricalData,
} from "../utils/fetchData.js";
import moment from 'moment';
import DailyMomentumSignal from "../models/dailyMomentumSignal.model.js";
import MarketDetailData from "../models/marketData.model.js";
import MomentumStockFiveMin from "../models/momentumStockFiveMin.model.js";
import MomentumStockTenMin from "../models/momentumStockTenMin.model.js";
import DailyRangeBreakouts from "../models/dailyRangeBreakout.model.js";
import HighLowReversal from "../models/highLowReversal.model.js";
import TwoDayHighLowBreak from "../models/twoDayHighLowBreak.model.js";
import FiveMinCandles from "../models/fiveMinCandles.model.js";
import TenMinCandles from "../models/tenMinCandles.model.js";
import FifteenMinCandles from "../models/fifteenMinCandles.model.js";
import IntradayReversalFiveMin from "../models/fiveMinMomentumSignal.model.js";
import redis from "../config/redisClient.js";
import MarketHoliday from "../models/holidays.model.js";
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
const formatTimestamp = (unixTimestamp) => {
  const date = new Date(unixTimestamp * 1000);
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  };
  const formatted = date
    .toLocaleString("en-IN", options)
    .replace(/(\d+)\/(\d+)\/(\d+), (\d+:\d+:\d+ [AP]M)/, "$1/$2/$3, $4")
    .toLowerCase();
 
  return formatted;
};

// Calculate minute difference between two timestamps
const getMinuteDifference = (currentTime, candleTimestamp) => {
  const current = new Date(currentTime);
  const candle = new Date(candleTimestamp * 1000);
  const diffMs = current - candle;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  return diffMinutes;
};

// Get previous trading day, skipping weekends and holidays
const getPreviousTradingDay = async (date) => {
  let prevDay = new Date(date);
  prevDay.setDate(prevDay.getDate() - 1);

  while (true) {
    const isWeekend = prevDay.getDay() === 0 || prevDay.getDay() === 6;
    const holiday = await MarketHoliday.findOne({
      date: {
        $gte: new Date(prevDay.setHours(0, 0, 0, 0)),
        $lt: new Date(prevDay.setHours(23, 59, 59, 999)),
      },
      closed_exchanges: "NSE",
    });

    if (!isWeekend && !holiday) {
      console.log(`[Date] Previous trading day: ${prevDay.toLocaleDateString("en-IN")}`);
      return prevDay;
    }
    prevDay.setDate(prevDay.getDate() - 1);
  }
};

// Helper function to merge 5-minute candles into 10-minute candles
const mergeToTenMinCandles = (securityId, fiveMinCandles, currentTime) => {
  let tenMinCandles = [];
  let allFiveMinCandles = [...fiveMinCandles];

  // Validate data consistency
  const minLength = Math.min(
    allFiveMinCandles.length,
    allFiveMinCandles.filter(c => c.open != null).length,
    allFiveMinCandles.filter(c => c.high != null).length,
    allFiveMinCandles.filter(c => c.low != null).length,
    allFiveMinCandles.filter(c => c.close != null).length
  );
  if (minLength < allFiveMinCandles.length) {
    console.warn(`[Merge] Inconsistent data for ${securityId}: Truncating to ${minLength} candles`);
    allFiveMinCandles = allFiveMinCandles.slice(0, minLength);
  }

  // Check if the last 5-minute candle is complete
  if (allFiveMinCandles.length > 0) {
    const lastCandleTimestamp = allFiveMinCandles[allFiveMinCandles.length - 1].timestamp;
    const minuteDiff = getMinuteDifference(currentTime, lastCandleTimestamp);
    if (minuteDiff < 5) {

      allFiveMinCandles.pop();
    }
  }

  // Sort candles by timestamp to ensure chronological order
  allFiveMinCandles.sort((a, b) => a.timestamp - b.timestamp);

  // Merge candles for 10-minute intervals (:15+:20, :25+:30, :35+:40, :45+:50, :55+:00)
  for (let i = 0; i < allFiveMinCandles.length - 1; i++) {
    const firstCandle = allFiveMinCandles[i];
    const firstCandleDate = new Date(formatTimestamp(firstCandle.timestamp).replace(/(\d+)\/(\d+)\/(\d+), (\d+:\d+:\d+ [ap]m)/, "$3-$2-$1 $4"));
    const firstMinutes = firstCandleDate.getMinutes();

    // Check if first candle is at :15, :25, :35, :45, or :55
    if ([15, 25, 35, 45, 55].includes(firstMinutes)) {
      const secondCandle = allFiveMinCandles[i + 1];
      if (secondCandle) {
        const secondCandleDate = new Date(formatTimestamp(secondCandle.timestamp).replace(/(\d+)\/(\d+)\/(\d+), (\d+:\d+:\d+ [ap]m)/, "$3-$2-$1 $4"));
        const timeDiffMinutes = (secondCandleDate - firstCandleDate) / (1000 * 60);

        // Ensure second candle is exactly 5 minutes later
        if (timeDiffMinutes === 5) {
          tenMinCandles.push({
            timestamp: firstCandle.timestamp,
            open: firstCandle.open,
            high: Math.max(firstCandle.high, secondCandle.high),
            low: Math.min(firstCandle.low, secondCandle.high),
            close: secondCandle.close,
          });

          i++; // Skip the second candle since it's used
        }
      }
    }
  }

  // Handle the last complete candle as a standalone 10-minute candle
  if (allFiveMinCandles.length > 0) {
    const lastCandle = allFiveMinCandles[allFiveMinCandles.length - 1];
    const lastCandleDate = new Date(formatTimestamp(lastCandle.timestamp).replace(/(\d+)\/(\d+)\/(\d+), (\d+:\d+:\d+ [ap]m)/, "$3-$2-$1 $4"));
    const lastMinutes = lastCandleDate.getMinutes();

    // Add last candle as standalone if complete and not already merged
    if (!tenMinCandles.some(c => c.timestamp === lastCandle.timestamp)) {
      tenMinCandles.push({
        timestamp: lastCandle.timestamp,
        open: lastCandle.open,
        high: lastCandle.high,
        low: lastCandle.low,
        close: lastCandle.close,
      });
      //console.log(`[Merge] Added standalone 10-min candle for ${securityId} at ${formatTimestamp(lastCandle.timestamp)}`);
    }
  }

  // Sort 10-minute candles by timestamp
  tenMinCandles.sort((a, b) => a.timestamp - b.timestamp);

  // Take the last 5 complete 10-minute candles
  if (tenMinCandles.length >= 5) {
    tenMinCandles = tenMinCandles.slice(-5);
  } else {
    console.warn(`[Merge] Insufficient 10-min candles for ${securityId}: ${tenMinCandles.length}/5`);
    return null;
  }

  return tenMinCandles;
};

const getData = async (fromDate, toDate) => {
  const stocks = await StocksDetail.find({}, { SECURITY_ID: 1, _id: 0 });
  const securityIds = stocks.map((stock) => stock.SECURITY_ID.trim().toString());

  //console.log(`[Main] Starting getData with fromDate: ${fromDate}, toDate: ${toDate}`);

  let normalizedFromDate = fromDate;
  let normalizedToDate = toDate;

  if (!fromDate.includes(" ")) {
    normalizedFromDate = fromDate.includes("T") ? fromDate : `${fromDate} 09:30:00`;
   // console.log(`[Main] Normalized fromDate to ${normalizedFromDate}`);
  }
  if (!toDate.includes(" ")) {
    normalizedToDate = toDate.includes("T") ? toDate : `${toDate} 15:30:00`;
    //console.log(`[Main] Normalized toDate to ${normalizedToDate}`);
  }

  normalizedFromDate = normalizedFromDate.replace("T", " ");
  normalizedToDate = normalizedToDate.replace("T", " ");

  try {
    // Validate date range
    const fromDateObj = new Date(normalizedFromDate.replace(" ", "T") + "+05:30");
    const toDateObj = new Date(normalizedToDate.replace(" ", "T") + "+05:30");
    const tradingStart = new Date(`${normalizedFromDate.split(" ")[0]}T09:15:00+05:30`);
    const tradingEnd = new Date(`${normalizedFromDate.split(" ")[0]}T15:30:00+05:30`);



    if (fromDateObj < tradingStart || toDateObj > tradingEnd) {
      console.warn(`[Validation] Date range ${normalizedFromDate} to ${normalizedToDate} is outside NSE trading hours`);
      throw new Error("Date range outside NSE trading hours");
    }

    const toDateStr = toDateObj.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
    if (!toDateStr.includes("14/5/2025")) {
      console.warn(`[Validation] toDate must be 14/5/2025, got ${toDateStr}`);
      throw new Error("Invalid toDate");
    }

    // Get current time and format it
    const currentTime = new Date(); // 5:40 PM IST, May 14, 2025
    const formattedCurrentTime = formatTimestamp(Math.floor(currentTime.getTime() / 1000));
   

    // Get previous trading day
    const prevTradingDay = await getPreviousTradingDay(toDateObj);
    const prevDateStr = prevTradingDay.toISOString().slice(0, 10).replace(/-/g, "-");
    const prevFromDate = `${prevDateStr} 09:30:00`;
    const prevToDate = `${prevDateStr} 15:30:00`;

    // Process 5-Minute and 10-Minute Candles
    for (let i = 0; i < securityIds.length; i++) {
      const id = securityIds[i];
      //console.log(`[Main] Processing 5-min and 10-min candles for ${id} (${i + 1}/${securityIds.length})`);

      let allCandles = [];
      let completeCandles = [];

      // Fetch today's 5-minute data
      let rawData = await fetchHistoricalData(id, normalizedFromDate, normalizedToDate, i, "5");
      if (rawData && rawData.timestamp && rawData.timestamp.length > 0) {
        //console.log(`[API] Raw 5-min data for ${id} (today, ${rawData.timestamp.length} candles)`);
        allCandles.push(...rawData.timestamp.map((ts, idx) => ({
          timestamp: ts,
          open: rawData.open[idx],
          high: rawData.high[idx],
          low: rawData.low[idx],
          close: rawData.close[idx],
        })));
      } else {
        console.warn(`[API] No valid 5-min data for ${id} (today)`);
        continue;
      }

      // Check if last candle is complete (≥ 5 minutes difference)
      if (allCandles.length > 0) {
        const lastCandleTimestamp = allCandles[allCandles.length - 1].timestamp;
        const minuteDiff = getMinuteDifference(currentTime, lastCandleTimestamp);
        if (minuteDiff < 5) {
         // console.log(`[Main] Skipping incomplete 5-min candle for ${id}: ${formatTimestamp(lastCandleTimestamp)}`);
          allCandles.pop();
        }
      }

      completeCandles = allCandles;

      // If fewer than 12 complete candles, fetch previous day's data
      if (completeCandles.length < 12) {
        //console.log(`[Main] Only ${completeCandles.length} complete 5-min candles for ${id}, fetching previous day`);
        rawData = await fetchHistoricalData(id, prevFromDate, prevToDate, i, "5");
        if (rawData && rawData.timestamp && rawData.timestamp.length > 0) {
          //console.log(`[API] Raw 5-min data for ${id} (previous day, ${rawData.timestamp.length} candles)`);
          allCandles.unshift(...rawData.timestamp.map((ts, idx) => ({
            timestamp: ts,
            open: rawData.open[idx],
            high: rawData.high[idx],
            low: rawData.low[idx],
            close: rawData.close[idx],
          })));
          completeCandles = allCandles;
        } else {
          console.warn(`[API] No valid 5-min data for ${id} (previous day)`);
        }
      }

      // Process 5-Minute Candles (12 Complete)
      if (completeCandles.length >= 12) {
        completeCandles = completeCandles.slice(-12);
        const formattedData = {
          securityId: id,
          timestamp: completeCandles.map((c) => formatTimestamp(c.timestamp)),
          open: completeCandles.map((c) => c.open),
          high: completeCandles.map((c) => c.high),
          low: completeCandles.map((c) => c.low),
          close: completeCandles.map((c) => c.close),
        };

        //console.log(`[API] Formatted 5-min data for ${id} (last 12 candles, ending at ${formattedData.timestamp[11]})`);

        try {
          await FiveMinCandles.updateOne(
            { securityId: id },
            {
              $set: {
                timestamp: formattedData.timestamp,
                open: formattedData.open,
                high: formattedData.high,
                low: formattedData.low,
                close: formattedData.close,
              },
            },
            { upsert: true }
          );
          console.log(`[MongoDB] 5-min data saved for ${id}`);
        } catch (error) {
          console.error(`[MongoDB] Error saving 5-min data for ${id}:`, error.message);
        }

        // Merge 5-minute candles into 10-minute candles
        const tenMinCandles = mergeToTenMinCandles(id, completeCandles, currentTime);
        if (tenMinCandles) {
          const formattedTenMinData = {
            securityId: id,
            timestamp: tenMinCandles.map((c) => formatTimestamp(c.timestamp)),
            open: tenMinCandles.map((c) => c.open),
            high: tenMinCandles.map((c) => c.high),
            low: tenMinCandles.map((c) => c.low),
            close: tenMinCandles.map((c) => c.close),
          };

          //console.log(`[Merge] Formatted 10-min data for ${id} (last 5 candles, ending at ${formattedTenMinData.timestamp[4]})`);

          try {
            await TenMinCandles.updateOne(
              { securityId: id },
              {
                $set: {
                  timestamp: formattedTenMinData.timestamp,
                  open: formattedTenMinData.open,
                  high: formattedTenMinData.high,
                  low: formattedTenMinData.low,
                  close: formattedTenMinData.close,
                },
              },
              { upsert: true }
            );
            console.log(`[MongoDB] 10-min data saved for ${id}`);
          } catch (error) {
            console.error(`[MongoDB] Error saving 10-min data for ${id}:`, error.message);
          }
        }
      } else {
        console.warn(`[Main] Insufficient complete 5-min candles for ${id}: ${completeCandles.length}/12`);
      }

      await delay(300);
    }

    // Process 15-Minute Candles
    for (let i = 0; i < securityIds.length; i++) {
      const id = securityIds[i];
     // console.log(`[Main] Processing 15-min candles for ${id} (${i + 1}/${securityIds.length})`);

      let allCandles = [];
      let completeCandles = [];

      // Fetch today's 15-minute data
      let rawData = await fetchHistoricalData(id, normalizedFromDate, normalizedToDate, i, "15");
      if (rawData && rawData.timestamp && rawData.timestamp.length > 0) {
        //console.log(`[API] Raw 15-min data for ${id} (today, ${rawData.timestamp.length} candles)`);
        allCandles.push(...rawData.timestamp.map((ts, idx) => ({
          timestamp: ts,
          open: rawData.open[idx],
          high: rawData.high[idx],
          low: rawData.low[idx],
          close: rawData.close[idx],
        })));
      } else {
        console.warn(`[API] No valid 15-min data for ${id} (today)`);
        continue;
      }

      // Check if last candle is complete (≥ 15 minutes difference)
      if (allCandles.length > 0) {
        const lastCandleTimestamp = allCandles[allCandles.length - 1].timestamp;
        const minuteDiff = getMinuteDifference(currentTime, lastCandleTimestamp);
        if (minuteDiff < 15) {
          //console.log(`[Main] Skipping incomplete 15-min candle for ${id}: ${formatTimestamp(lastCandleTimestamp)}`);
          allCandles.pop();
        }
      }

      completeCandles = allCandles;

      // If fewer than 5 complete candles, fetch previous day's data
      if (completeCandles.length < 5) {
        //console.log(`[Main] Only ${completeCandles.length} complete 15-min candles for ${id}, fetching previous day`);
        rawData = await fetchHistoricalData(id, prevFromDate, prevToDate, i, "15");
        if (rawData && rawData.timestamp && rawData.timestamp.length > 0) {
          //console.log(`[API] Raw 15-min data for ${id} (previous day, ${rawData.timestamp.length} candles)`);
          allCandles.unshift(...rawData.timestamp.map((ts, idx) => ({
            timestamp: ts,
            open: rawData.open[idx],
            high: rawData.high[idx],
            low: rawData.low[idx],
            close: rawData.close[idx],
          })));
          completeCandles = allCandles;
        } else {
          console.warn(`[API] No valid 15-min data for ${id} (previous day)`);
        }
      }

      // Process 15-Minute Candles (5 Complete)
      if (completeCandles.length >= 5) {
        completeCandles = completeCandles.slice(-5);
        const formattedData = {
          securityId: id,
          timestamp: completeCandles.map((c) => formatTimestamp(c.timestamp)),
          open: completeCandles.map((c) => c.open),
          high: completeCandles.map((c) => c.high),
          low: completeCandles.map((c) => c.low),
          close: completeCandles.map((c) => c.close),
        };

        //console.log(`[API] Formatted 15-min data for ${id} (last 5 candles, ending at ${formattedData.timestamp[4]})`);

        try {
          await FifteenMinCandles.updateOne(
            { securityId: id },
            {
              $set: {
                timestamp: formattedData.timestamp,
                open: formattedData.open,
                high: formattedData.high,
                low: formattedData.low,
                close: formattedData.close,
              },
            },
            { upsert: true }
          );
          console.log(`[MongoDB] 15-min data saved for ${id}`);
        } catch (error) {
          console.error(`[MongoDB] Error saving 15-min data for ${id}:`, error.message);
        }
      } else {
        console.warn(`[Main] Insufficient complete 15-min candles for ${id}: ${completeCandles.length}/5`);
      }

      await delay(500);
    }

    console.log("[Main] Completed all 5-min, 10-min, and 15-min candle data for all stocks.");
  } catch (error) {
    console.error("[Main] Error in getData:", error.message);
    throw error;
  }
};
const AIMomentumCatcherFiveMins = async (req, res) => {
  try {
    // Fetch stock details
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

    // Get latest and previous trading day
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

    // Map latest and previous day data
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

    const updatedData = [];
    for (const securityId of securityIds) {
      // Fetch 5-minute candle data from MongoDB
      const data = await FiveMinCandles.findOne({ securityId}).lean();

      if (!data || !data.open || !data.close || data.timestamp.length < 2) {
        console.warn(`No sufficient 5-min candle data for Security ID12233: ${securityId}`);
        continue;
      }

      // Get the last two candles (3:20 PM and 3:25 PM)
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
      ).sort({ timestamp: -1 });
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

        // Momentum condition: 3:25 PM body >= double 3:20 PM range
        const hasMomentum =
          Number(entry.currentBody.toFixed(4)) >=
            Number((entry.previousRange * 2).toFixed(4)) &&
          entry.previousRange > 0.1;

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
            timestamp: latestTimestamp, // 3:25 PM candle timestamp
          };
        }
        return null;
      })
      .filter((stock) => stock !== null);

    // Bulk upsert in MongoDB
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

    // Fetch all momentum stocks, sorted by timestamp (descending)
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
    ).sort({ timestamp: -1 });

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

    // 5. Process each security
    const momentumStocks = [];
    for (const securityId of securityIds) {
      // Fetch 10-minute candle data from MongoDB
      const data = await TenMinCandles.findOne({ securityId }).lean();
      if (!data || !data.high || !data.close || data.timestamp.length < 2) {
        console.warn(`No sufficient 10-min candle data for Security ID: ${securityId}`);
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

      // Verify timestamps (3:15 PM and 3:25 PM)
      if (
        lastCandle.timestamp !== "14/05/2025, 03:25:00 pm" ||
        secondLastCandle.timestamp !== "14/05/2025, 03:15:00 pm"
      ) {
        console.warn(`Invalid candle timestamps for Security ID: ${securityId}`);
        continue;
      }

      // Analyze last two 10-min periods
      const currentBody = Math.abs(lastCandle.close - lastCandle.open);
      const previousRange = secondLastCandle.high - secondLastCandle.low;
      const hasMomentum = currentBody >= previousRange * 2 && previousRange > 0.1;

      if (hasMomentum) {
        const stockInfo = stockMap.get(securityId) || {};
        const pctChange = ((latestDataMap.get(securityId) - yesterdayMap.get(securityId)) / yesterdayMap.get(securityId)) * 100 || 0;

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
          momentumType: lastCandle.close > lastCandle.open ? "Bullish" : "Bearish",
          priceChange: currentBody,
          percentageChange: pctChange.toFixed(2),
          timestamp: lastCandle.timestamp, // 3:25 PM candle timestamp
        });
      }
    }

    // 6. Save and return results
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

    // 7. Fetch all momentum stocks, sorted by timestamp (descending)
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
    ).sort({ timestamp: -1 });

    return {
      message: momentumStocks.length ? "Momentum stocks found and saved" : "No momentum signals",
      count: allMomentumStocks.length,
      data: allMomentumStocks
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
    // 1. Get latest market data
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date")
      .limit(1);

    if (!latestEntry) {
      return { message: "No stock data available" };
    }

    const latestDate = latestEntry.date;

    // 2. Fetch latest and previous day data
    const [latestData, previousEntry] = await Promise.all([
      MarketDetailData.find({ date: latestDate }, { securityId: 1, data: 1, _id: 0 }),
      MarketDetailData.findOne({ date: { $lt: latestDate } }, { date: 1 }).sort({ date: -1 }).limit(1)
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

    // 3. Create price maps
    const latestDataMap = new Map();
    const securityIds = [];
    latestData.forEach((entry) => {
      securityIds.push(entry.securityId.trim().toString());
      latestDataMap.set(entry.securityId, entry.data?.latestTradedPrice?.[0] || 0);
    });

    const previousDayDataMap = new Map();
    previousData.forEach((entry) => {
      previousDayDataMap.set(entry.securityId, entry.data?.dayClose?.[0] || 0);
    });

    // 4. Fetch stock metadata
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

    // 5. Process 5-minute candles
    const updatedData = [];
    for (const securityId of securityIds) {
      const data = await FiveMinCandles.findOne({ securityId }).lean();
      if (!data || !data.open || !data.close || data.open.length < 5) {
        console.warn(`No sufficient 5-min data for Security ID: ${securityId}`);
        continue;
      }

      updatedData.push({
        securityId,
        timestamp: data.timestamp.slice(-5),
        open: data.open.slice(-5),
        high: data.high.slice(-5),
        low: data.low.slice(-5),
        close: data.close.slice(-5),
      });
    }

    if (!updatedData.length) {
      const existingSignals = await IntradayReversalFiveMin.find({}).sort({ timestamp: -1 });
      return {
        message: "No candle data found, returning existing signals",
        count: existingSignals.length,
        data: existingSignals,
      };
    }

    // 6. Analyze reversals
    const results = updatedData.map((item) => {
      const momentumSignals = [];
      const securityId = item.securityId;
      const stock = stockMap.get(securityId);
      const latestTradedPrice = latestDataMap.get(securityId);
      const previousDayClose = previousDayDataMap.get(securityId);
      const latestTimestamp = item.timestamp[4];

      if (item.open.length < 5 || item.close.length < 5) {
        console.warn(`Skipping ${securityId} due to insufficient data`);
        return momentumSignals;
      }

      const lastFiveOpen = item.open;
      const lastFiveClose = item.close;

      // Calculate percentage returns: (close - open) / open * 100
      const candleReturns = lastFiveOpen.map((open, i) => {
        const close = lastFiveClose[i];
        return ((close - open) / open) * 100;
      });

      const prevFourReturns = candleReturns.slice(0, 4);
      const latestReturn = candleReturns[4];

      // Check candle directions
      const isLatestBullish = lastFiveClose[4] > lastFiveOpen[4];
      const isLatestBearish = lastFiveClose[4] < lastFiveOpen[4];
      const prevFourColors = prevFourReturns.map((ret) => ret > 0 ? "green" : ret < 0 ? "red" : "neutral");

      // Overall percentage change
      const overAllPercentageChange =
        previousDayClose && latestTradedPrice && !isNaN(previousDayClose) && !isNaN(latestTradedPrice)
          ? ((latestTradedPrice - previousDayClose) / previousDayClose) * 100
          : 0;

      // Bullish Reversal: Last green, previous 4 red, decreasing losses
      const allPrevRed = prevFourColors.every(color => color === "red");
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
          overAllPercentageChange: overAllPercentageChange.toFixed(2),
          timestamp: latestTimestamp,
        });
      }

      // Bearish Reversal: Last red, previous 4 green, decreasing gains
      const allPrevGreen = prevFourColors.every(color => color === "green");
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
          overAllPercentageChange: overAllPercentageChange.toFixed(2),
          timestamp: latestTimestamp,
        });
      }

      return momentumSignals;
    });

    const finalResults = results.flat();

    // 7. Save signals (update if exists, insert if not)
    if (finalResults.length) {
      const savePromises = finalResults.map(async (signal) => {
        try {
          await IntradayReversalFiveMin.findOneAndUpdate(
            { securityId: signal.securityId }, // Unique by securityId
            { $set: signal }, // Update all fields, including timestamp
            { upsert: true, new: true }
          );
        } catch (dbError) {
          console.error(`Error updating/inserting ${signal.securityId}:`, dbError);
        }
      });
      await Promise.all(savePromises);
    }

    // 8. Fetch all signals
    const allMomentumStocks = await IntradayReversalFiveMin.find(
      {},
      {
        type: 1,
        securityId: 1,
        stockSymbol: 1,
        stockName: 1,
        overAllPercentageChange: 1,
        timestamp: 1,
        _id: 0,
      }
    ).sort({ timestamp: -1 });

    return {
      message: finalResults.length ? "Intraday reversal stocks found and saved" : "No reversal signals detected",
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
    // 1. Get latest market data
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date")
      .limit(1);

    if (!latestEntry) {
      return { message: "No stock data available" };
    }

    const latestDate = latestEntry.date;

    // 2. Fetch latest and previous day data
    const [latestData, previousEntry] = await Promise.all([
      MarketDetailData.find({ date: latestDate }, { securityId: 1, data: 1, _id: 0 }),
      MarketDetailData.findOne({ date: { $lt: latestDate } }, { date: 1 }).sort({ date: -1 }).limit(1)
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

    // 3. Create price maps
    const latestDataMap = new Map();
    const securityIds = [];
    latestData.forEach((entry) => {
      securityIds.push(entry.securityId.trim().toString());
      latestDataMap.set(entry.securityId, entry.data?.latestTradedPrice?.[0] || 0);
    });

    const previousDayDataMap = new Map();
    previousData.forEach((entry) => {
      previousDayDataMap.set(entry.securityId, entry.data?.dayClose?.[0] || 0);
    });

    // 4. Fetch stock metadata
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

    // 5. Process 15-minute candles
    const updatedData = [];
    for (const securityId of securityIds) {
      const data = await FifteenMinCandles.findOne({ securityId }).lean();
      if (!data || !data.open || !data.close || data.open.length < 5) {
        console.warn(`No sufficient 15-min data for Security ID: ${securityId}`);
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
        { _id: 0, __v: 0, lastTradePrice: 0, previousClosePrice: 0, updatedAt: 0, createdAt: 0 }
      ).sort({ timestamp: -1 });
      return {
        message: "No candle data found, returning existing signals",
        data: existingSignals,
      };
    }

    // 6. Analyze reversals
    const results = updatedData.map((item) => {
      const momentumSignals = [];
      const securityId = item.securityId;
      const stock = stockMap.get(securityId);
      const latestTradedPrice = latestDataMap.get(securityId);
      const previousDayClose = previousDayDataMap.get(securityId);
      const latestTimestamp = item.timestamp[4];

      if (item.open.length < 5 || item.close.length < 5) {
        console.warn(`Skipping ${securityId} due to insufficient data`);
        return momentumSignals;
      }

      const lastFiveOpen = item.open;
      const lastFiveClose = item.close;

      // Calculate percentage returns: (close - open) / open * 100
      const candleReturns = lastFiveOpen.map((open, i) => {
        const close = lastFiveClose[i];
        return ((close - open) / open) * 100;
      });

      const prevFourReturns = candleReturns.slice(0, 4);
      const latestReturn = candleReturns[4];

      // Check candle directions
      const isLatestBullish = lastFiveClose[4] > lastFiveOpen[4];
      const isLatestBearish = lastFiveClose[4] < lastFiveOpen[4];
      const prevFourColors = prevFourReturns.map((ret) => ret > 0 ? "green" : ret < 0 ? "red" : "neutral");

      // Overall percentage change
      const percentageChange =
        previousDayClose && latestTradedPrice && !isNaN(previousDayClose) && !isNaN(latestTradedPrice)
          ? ((latestTradedPrice - previousDayClose) / previousDayClose) * 100
          : 0;

      // Bullish Reversal: Last green, previous 4 red, decreasing losses
      const allPrevRed = prevFourColors.every(color => color === "red");
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
        });
      }

      // Bearish Reversal: Last red, previous 4 green, decreasing gains
      const allPrevGreen = prevFourColors.every(color => color === "green");
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
        });
      }

      return momentumSignals;
    });

    const finalResults = results.flat();

    // 7. Save signals (update if exists, insert if not)
    if (finalResults.length) {
      const savePromises = finalResults.map(async (signal) => {
        try {
          await DailyMomentumSignal.findOneAndUpdate(
            { securityId: signal.securityId }, // Unique by securityId
            { $set: signal }, // Update all fields, including timestamp
            { upsert: true, new: true }
          );
        } catch (dbError) {
          console.error(`Error updating/inserting ${signal.securityId}:`, dbError);
        }
      });
      await Promise.all(savePromises);
    }

    // 8. Fetch all signals
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
    ).sort({ timestamp: -1 });

    return {
      message: finalResults.length ? "Intraday reversal stocks found and saved" : "No reversal signals detected",
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

const DailyRangeBreakout = async () => {
  try {
    // Get latest market date
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

    // Get 5-minute candle data for all securities
    const updatedData = [];
    for (const securityId of securityIds) {
      const data = await FiveMinCandles.findOne({ securityId }).lean();
      if (!data || !data.open || !data.close || !data.high || data.high.length < 5) {
        continue;
      }

      // Validate timestamps
      const timestamps = data.timestamp.filter(ts => /^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2} [ap]m$/i.test(ts));
      if (timestamps.length < 5) {
        continue;
      }

      // Get the last 5 candles
      const lastFiveIndices = data.timestamp
        .map((ts, index) => ({ ts, index }))
        .sort((a, b) => {
          const dateA = new Date(a.ts.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2} [ap]m)/i, '$3-$2-$1 $4'));
          const dateB = new Date(b.ts.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2} [ap]m)/i, '$3-$2-$1 $4'));
          return dateB - dateA;
        })
        .slice(0, 5)
        .sort((a, b) => {
          const dateA = new Date(a.ts.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2} [ap]m)/i, '$3-$2-$1 $4'));
          const dateB = new Date(b.ts.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2} [ap]m)/i, '$3-$2-$1 $4'));
          return dateA - dateB;
        })
        .map(item => item.index);

      if (lastFiveIndices.length < 5) {
        continue;
      }

      const lastFiveCandles = {
        timestamp: lastFiveIndices.map(i => data.timestamp[i]),
        open: lastFiveIndices.map(i => data.open[i]),
        close: lastFiveIndices.map(i => data.close[i]),
        high: lastFiveIndices.map(i => data.high[i]),
        low: lastFiveIndices.map(i => data.low[i]),
      };

      updatedData.push({
        securityId,
        ...lastFiveCandles,
      });
    }

    if (!updatedData.length) {
      const existingSignals = await DailyRangeBreakouts.find(
        {},
        { _id: 0, __v: 0, updatedAt: 0, createdAt: 0 }
      ).sort({ timestamp: 1 });
      return {
        status: 200,
        message: "No candle data found, returning existing signals",
        data: existingSignals,
        currentBreakouts: [],
        stats: { total: 0, bullish: 0, bearish: 0 },
      };
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

      // Check if candles 2-4 (indices 1-3) high and low are within first candle's range
      const areMiddleCandlesInRange = [1, 2, 3].every((i) => {
        return opens[i] <= firstCandleHigh && closes[i] >= firstCandleLow;
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
          latestTradedPrice && previousDayClose && !isNaN(latestTradedPrice) && !isNaN(previousDayClose)
            ? ((latestTradedPrice - previousDayClose) / previousDayClose) * 100
            : 0;

        // Prepare candles array
        const candles = timestamps.map((ts, i) => ({
          open: opens[i],
          high: highs[i],
          low: lows[i],
          close: closes[i],
          timestamp: ts,
        }));

        // Bullish breakout: 5th candle is green and closes above first candle high
        // Bullish breakout: 5th candle is green and closes above first candle high
if (latestClose > latestOpen && latestClose > firstCandleHigh) {
  const candleReturn = ((latestClose - latestOpen) / latestOpen) * 100;
  if (candleReturn >= 0.5) {
    breakoutStocks.push({
      type: "Bullish",
      securityId,
      stockSymbol: stock?.UNDERLYING_SYMBOL || "N/A",
      stockName: stock?.SYMBOL_NAME || "N/A",
      lastTradePrice: latestTradedPrice,
      percentageChange: percentageChange.toFixed(2),
      firstcandlelow: firstCandleLow,
      firstcandleigh: firstCandleHigh,
      curentcandleclose: latestClose,
      firstcandlerange: `${firstCandleLow}-${firstCandleHigh}`,
      timestamp: latestTimestamp,
    });
  }
}
// Bearish breakout: 5th candle is red and closes below first candle low
else if (latestClose < latestOpen && latestClose < firstCandleLow) {
  const candleReturn = ((latestOpen - latestClose) / latestOpen) * 100;
  if (candleReturn >= 0.5) {
    breakoutStocks.push({
      type: "Bearish",
      securityId,
      stockSymbol: stock?.UNDERLYING_SYMBOL || "N/A",
      stockName: stock?.SYMBOL_NAME || "N/A",
      lastTradePrice: latestTradedPrice,
      percentageChange: percentageChange.toFixed(2),
      firstcandlelow: firstCandleLow,
      firstcandleigh: firstCandleHigh,
      curentcandleclose: latestClose,
      firstcandlerange: `${firstCandleLow}-${firstCandleHigh}`,
      timestamp: latestTimestamp,
    });
  }
}
      }
    }

    // Save or update breakout signals
    if (breakoutStocks.length > 0) {
      const bulkOps = breakoutStocks.map(signal => ({
        updateOne: {
          filter: {
            securityId: signal.securityId,
            date: signal.date,
            type: signal.type,
          },
          update: {
            $set: { ...signal, updatedAt: new Date() },
          },
          upsert: true,
        },
      }));

      try {
        await DailyRangeBreakouts.bulkWrite(bulkOps);
        
      } catch (dbError) {
        return {
          status: 500,
          message: "Error saving to database",
          error: dbError.message,
        };
      }
    }

    // Get all breakout signals, sorted by timestamp (ascending for string timestamps)
    const fullData = await DailyRangeBreakouts.find(
      {},
      { _id: 0, __v: 0, updatedAt: 0, createdAt: 0 }
    ).sort({ timestamp: 1 });

    return {
      status: 200,
      message: breakoutStocks.length > 0
        ? "Breakout analysis complete"
        : "No breakout signals detected",
      data: fullData,
      currentBreakouts: breakoutStocks,
      stats: {
        total: breakoutStocks.length,
        bullish: breakoutStocks.filter(b => b.type === "Bullish").length,
        bearish: breakoutStocks.filter(b => b.type === "Bearish").length,
      },
    };
  } catch (error) {
    console.error("Error in DailyRangeBreakout:", error);
    return {
      status: 500,
      message: "Internal server error",
      error: error.message,
    };
  }
};
const DayHighLowReversal = async () => {
  try {
    // Helper function to convert string timestamp to Unix seconds
    function parseTimestamp(timestampStr) {
      const formattedStr = timestampStr
        .replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2} [ap]m)/i, '$3-$2-$1 $4');
      const date = new Date(Date.parse(formattedStr));
      if (isNaN(date.getTime())) {
        console.error("Invalid timestamp:", timestampStr);
        return null;
      }
      return Math.floor(date.getTime() / 1000); // Convert to Unix seconds
    }

    // Helper function to format Unix timestamp to DD/MM/YYYY hh:mm:ss a
    function formatTimestamp(unixTimestamp) {
      const date = new Date(unixTimestamp * 1000);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours() % 12 || 12).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const period = date.getHours() >= 12 ? 'pm' : 'am';
      return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${period}`;
    }

    // Get the latest trading day
    const latestTradingDay = await MarketDetailData.aggregate([
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);

    if (!latestTradingDay || latestTradingDay.length === 0) {
      return { success: false, message: "No trading data found" };
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
      return { success: false, message: "No stock data found for the latest date" };
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

    // Process each security for the last 5-minute candles
    for (const securityId of securityIds) {
      const candleData = await FiveMinCandles.findOne({ securityId }).lean();

      if (!candleData || !candleData.high || candleData.high.length < 5) {
        continue;
      }

      const stockInfo = stockDataMap.get(securityId);
      const stocksDetail = stockDetailsMap.get(securityId);
      const previousDayData = previousStockDataMap.get(securityId);

      if (!stockInfo || !stocksDetail || !stockInfo.dayHigh || !stockInfo.dayLow) {
        continue;
      }

      // Convert and sort timestamps
      const timestamps = candleData.timestamp
        .map((ts, index) => ({ ts: parseTimestamp(ts), index }))
        .filter(item => item.ts !== null)
        .sort((a, b) => b.ts - a.ts)
        .slice(0, 5)
        .sort((a, b) => a.ts - b.ts); // Chronological order

      if (timestamps.length < 5) {
        continue;
      }

      const lastFiveIndices = timestamps.map(item => item.index);
      const lastFiveCandles = {
        timestamp: lastFiveIndices.map(i => candleData.timestamp[i]),
        open: lastFiveIndices.map(i => candleData.open[i]),
        close: lastFiveIndices.map(i => candleData.close[i]),
        high: lastFiveIndices.map(i => candleData.high[i]),
        low: lastFiveIndices.map(i => candleData.low[i]),
      };

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

      // Get the last 5-minute candle (index 4)
      const lastIndex = 4;
      const candleOpen = lastFiveCandles.open[lastIndex];
      const candleClose = lastFiveCandles.close[lastIndex];
      const candleHigh = lastFiveCandles.high[lastIndex];
      const candleLow = lastFiveCandles.low[lastIndex];
      const candleTimestamp = lastFiveCandles.timestamp[lastIndex];

      const isRedCandle = candleOpen > candleClose; // Bearish
      const isGreenCandle = candleOpen < candleClose; // Bullish

      // Prepare additional candle data
      const candleDataFields = {
        rangeHigh: dayHigh,
        rangeLow: dayLow,
        secondCandle: {
          open: lastFiveCandles.open[1],
          close: lastFiveCandles.close[1],
        },
        thirdCandle: {
          open: lastFiveCandles.open[2],
          close: lastFiveCandles.close[2],
        },
        fourthCandle: {
          open: lastFiveCandles.open[3],
          close: lastFiveCandles.close[3],
        },
      };

      // Bearish reversal: Red candle near day high
      if (candleHigh >= highThreshold && isRedCandle) {
        responseData.push({
          securityId,
          symbolName: stocksDetail.symbolName,
          underlyingSymbol: stocksDetail.underlyingSymbol,
          type: "Bearish",
          reversalPrice: candleClose,
          timestamp: candleTimestamp, // Store as string (DD/MM/YYYY hh:mm:ss a)
          percentageChange: parseFloat(percentageChange),
          date: latestDate,
          ...candleDataFields,
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
          timestamp: candleTimestamp, // Store as string
          percentageChange: parseFloat(percentageChange),
          date: latestDate,
          ...candleDataFields,
        });
      }
    }

    // Store or update results in database
    if (responseData.length > 0) {
      const bulkOps = responseData.map((item) => ({
        updateOne: {
          filter: { securityId: item.securityId, date: item.date, type: item.type },
          update: { $set: { ...item, updatedAt: new Date() } },
          upsert: true,
        },
      }));
      await HighLowReversal.bulkWrite(bulkOps);
      
    }

    // Fetch final data, sorted by timestamp descending
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
        date: 1,
        rangeHigh: 1,
        rangeLow: 1,
        secondCandle: 1,
        thirdCandle: 1,
        fourthCandle: 1,
        _id: 0,
      }
    )
      .sort({ timestamp: -1 })
      .lean();

    return {
      success: true,
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
      return { success: false, message: "Not enough historical data found" };
    }

    const latestDate = uniqueTradingDays[0]._id;
    const firstPrevTargetDate = uniqueTradingDays[1]._id;
    const secondPrevTargetDate = uniqueTradingDays[2]._id;

    // Fetch stock data for the current day and two previous days
    const [currentStockData, firstPrevStockData, secondPrevStockData] = await Promise.all([
      MarketDetailData.find(
        { date: latestDate },
        {
          securityId: 1,
          "data.latestTradedPrice": 1,
          date: 1,
          _id: 0,
        }
      ),
      MarketDetailData.find(
        { date: firstPrevTargetDate },
        {
          securityId: 1,
          "data.dayHigh": 1,
          "data.dayLow": 1,
          date: 1,
          _id: 0,
        }
      ),
      MarketDetailData.find(
        { date: secondPrevTargetDate },
        {
          securityId: 1,
          "data.dayHigh": 1,
          "data.dayLow": 1,
          "data.dayClose": 1,
          date: 1,
          _id: 0,
        }
      ),
    ]);

    if (!currentStockData.length || !firstPrevStockData.length || !secondPrevStockData.length) {
      return { success: false, message: "No stock data found for the selected dates" };
    }

    // Create maps for stock data
    const securityIds = currentStockData.map((item) => item.securityId);
    const currentStockDataMap = new Map();
    currentStockData.forEach((item) => {
      currentStockDataMap.set(item.securityId, {
        securityId: item.securityId,
        latestTradedPrice: item.data?.latestTradedPrice?.[0] || 0,
        date: item.date,
      });
    });

    const firstPrevStockDataMap = new Map();
    firstPrevStockData.forEach((item) => {
      firstPrevStockDataMap.set(item.securityId, {
        securityId: item.securityId,
        dayHigh: item.data?.dayHigh?.[0] || 0,
        dayLow: item.data?.dayLow?.[0] || 0,
        date: item.date,
      });
    });

    const secondPrevStockDataMap = new Map();
    secondPrevStockData.forEach((item) => {
      secondPrevStockDataMap.set(item.securityId, {
        securityId: item.securityId,
        dayHigh: item.data?.dayHigh?.[0] || 0,
        dayLow: item.data?.dayLow?.[0] || 0,
        dayClose: item.data?.dayClose?.[0] || 0,
        date: item.date,
      });
    });

    // Fetch stock details
    const stockDetails = await StocksDetail.find(
      {},
      { SECURITY_ID: 1, SYMBOL_NAME: 1, UNDERLYING_SYMBOL: 1 }
    );
    if (!stockDetails.length) {
      return { success: false, message: "No stock details found" };
    }
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
      // Check if a break (Bullish or Bearish) already exists for this securityId and date
      const existingBreak = await TwoDayHighLowBreak.findOne({
        securityId,
        date: latestDate,
        type: { $in: ["Bullish", "Bearish"] },
      });
      if (existingBreak) {
        continue; // Skip if a break is already recorded for this date
      }

      const candleData = await FiveMinCandles.findOne({ securityId }).lean();
      if (!candleData || !candleData.high || candleData.high.length === 0) {
        continue;
      }

      const currentDayData = currentStockDataMap.get(securityId);
      const firstPrevDayData = firstPrevStockDataMap.get(securityId);
      const secondPrevDayData = secondPrevStockDataMap.get(securityId);
      const stocksDetail = stockDetailsMap.get(securityId);

      if (!currentDayData || !firstPrevDayData || !secondPrevDayData || !stocksDetail) {
        continue;
      }

      // Calculate 2-day high/low with 1% tolerance
      const firstPrevDayHigh = firstPrevDayData.dayHigh;
      const firstPrevDayLow = firstPrevDayData.dayLow;
      const secondPrevDayHigh = secondPrevDayData.dayHigh;
      const secondPrevDayLow = secondPrevDayData.dayLow;
      const secondPrevDayClose = secondPrevDayData.dayClose;
      const latestTradedPrice = currentDayData.latestTradedPrice;

      if (!firstPrevDayHigh || !firstPrevDayLow || !secondPrevDayHigh || !secondPrevDayLow) {
        continue;
      }

      const maxHigh = Math.max(firstPrevDayHigh, secondPrevDayHigh);
      const minLow = Math.min(firstPrevDayLow, secondPrevDayLow);
      const highThreshold = maxHigh * 1.01; // 1% above max high
      const lowThreshold = minLow * 0.99; // 1% below min low

      // Get the last 5-minute candle
      const lastIndex = candleData.high.length - 1;
      const candleClose = candleData.close[lastIndex];
      const candleTimestamp = candleData.timestamp[lastIndex];

      // Bullish break: Close above high threshold
      if (candleClose > highThreshold) {
        responseData.push({
          securityId,
          symbolName: stocksDetail.symbolName,
          underlyingSymbol: stocksDetail.underlyingSymbol,
          type: "Bullish",
          breakPrice: candleClose,
          maxHigh,
          timestamp: candleTimestamp,
          percentageChange: parseFloat(
            ((latestTradedPrice - secondPrevDayClose) / secondPrevDayClose * 100).toFixed(2)
          ),
          date: latestDate,
        });
      }
      // Bearish break: Close below low threshold
      else if (candleClose < lowThreshold) {
        responseData.push({
          securityId,
          symbolName: stocksDetail.symbolName,
          underlyingSymbol: stocksDetail.underlyingSymbol,
          type: "Bearish",
          breakPrice: candleClose,
          minLow,
          timestamp: candleTimestamp,
          percentageChange: parseFloat(
            ((latestTradedPrice - secondPrevDayClose) / secondPrevDayClose * 100).toFixed(2)
          ),
          date: latestDate,
        });
      }
    }

    // Store or update results in database
    if (responseData.length > 0) {
      const bulkOps = responseData.map((item) => ({
        updateOne: {
          filter: { securityId: item.securityId, date: item.date, type: item.type },
          update: { $set: { ...item, updatedAt: new Date() } },
          upsert: true,
        },
      }));
      await TwoDayHighLowBreak.bulkWrite(bulkOps);
      
    }

    // Fetch final data, sorted by timestamp descending
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
        date: 1,
        _id: 0,
      }
    )
      .sort({ timestamp: -1 })
      .lean();

    return {
      success: true,
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
