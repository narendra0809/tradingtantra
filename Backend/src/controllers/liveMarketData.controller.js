import WebSocket from "ws";
import StocksDetail from "../models/stocksDetail.model.js";
import parseBinaryData from "../utils/parseBinaryData.js";
import { fetchHistoricalData } from "../utils/fetchData.js";
import MarketDetailData from "../models/marketData.model.js";
import FiveMinCandles from "../models/fiveMinCandles.model.js";
import TenMinCandles from "../models/tenMinCandles.model.js";
import FifteenMinCandles from "../models/fifteenMinCandles.model.js";
import redis from "../config/redisClient.js";
import MarketHoliday from "../models/holidays.model.js";
import { runFetchForIndexCandles } from "../services/indexCandles.service.js";

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
    batches.push(array.slice(i, i + batchSize));
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

export const getMinuteDifference = (currentTime, candleTimestamp) => {
  const current = new Date(currentTime);
  const candle = new Date(candleTimestamp * 1000);
  const diffMs = current - candle;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return diffMinutes;
};

export const getPreviousTradingDay = async (date) => {
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
      return prevDay;
    }
    prevDay.setDate(prevDay.getDate() - 1);
  }
};

const mergeToTenMinCandles = (securityId, fiveMinCandles, currentTime) => {
  let tenMinCandles = [];
  let allFiveMinCandles = [...fiveMinCandles];

  // Validate data consistency
  const minLength = Math.min(
    allFiveMinCandles.length,
    allFiveMinCandles.filter((c) => c.open != null).length,
    allFiveMinCandles.filter((c) => c.high != null).length,
    allFiveMinCandles.filter((c) => c.low != null).length,
    allFiveMinCandles.filter((c) => c.close != null).length
  );
  if (minLength < allFiveMinCandles.length) {
    allFiveMinCandles = allFiveMinCandles.slice(0, minLength);
  }

  // Check if last candle is complete, but preserve 15:25 candle
  if (allFiveMinCandles.length > 0) {
    const lastCandleTimestamp = allFiveMinCandles[allFiveMinCandles.length - 1].timestamp;
    const lastCandleDate = new Date(lastCandleTimestamp * 1000);
    const isMarketCloseCandle = lastCandleDate.getHours() === 15 && lastCandleDate.getMinutes() === 25;
    const minuteDiff = getMinuteDifference(currentTime, lastCandleTimestamp);
    if (minuteDiff < 5 && !isMarketCloseCandle) {
      allFiveMinCandles.pop();
    }
  }

  // Sort candles by timestamp
  allFiveMinCandles.sort((a, b) => a.timestamp - b.timestamp);

  // Merge 5-minute candles into 10-minute candles (odd + even minutes)
  for (let i = 0; i < allFiveMinCandles.length - 1; i++) {
    const firstCandle = allFiveMinCandles[i];
    const secondCandle = allFiveMinCandles[i + 1];
    if (secondCandle) {
      const firstCandleDate = new Date(firstCandle.timestamp * 1000);
      const secondCandleDate = new Date(secondCandle.timestamp * 1000);
      const firstMinutes = firstCandleDate.getMinutes();
      const secondMinutes = secondCandleDate.getMinutes();
      const timeDiffMinutes = (secondCandleDate - firstCandleDate) / (1000 * 60);
      const isOddMinute = [15, 25, 35, 45, 55, 5].includes(firstMinutes);
      const isEvenMinute = [20, 30, 40, 50, 0, 10].includes(secondMinutes);

      if (timeDiffMinutes === 5 && isOddMinute && isEvenMinute) {
        tenMinCandles.push({
          timestamp: firstCandle.timestamp,
          open: firstCandle.open,
          high: Math.max(firstCandle.high, secondCandle.high),
          low: Math.min(firstCandle.low, secondCandle.low),
          close: secondCandle.close,
        });
        i++; // Skip second candle
      }
    }
  }

  // Handle 15:25 candle as a standalone 10-minute candle ending at 15:30
  if (allFiveMinCandles.length > 0) {
    const lastCandle = allFiveMinCandles[allFiveMinCandles.length - 1];
    const lastCandleDate = new Date(lastCandle.timestamp * 1000);
    const isLastCandle1525 = lastCandleDate.getHours() === 15 && lastCandleDate.getMinutes() === 25;
    if (isLastCandle1525) {
      tenMinCandles.push({
        timestamp: lastCandle.timestamp,
        open: lastCandle.open,
        high: lastCandle.high,
        low: lastCandle.low,
        close: lastCandle.close,
      });
    }
  }

  // Sort and return up to last 5 complete 10-minute candles
  tenMinCandles.sort((a, b) => a.timestamp - b.timestamp);
  if (tenMinCandles.length > 0) {
    return tenMinCandles.slice(-Math.min(5, tenMinCandles.length));
  } else {
    return null;
  }
};

const mergeToFifteenMinCandles = (securityId, fiveMinCandles, currentTime) => {
  let fifteenMinCandles = [];
  let allFiveMinCandles = [...fiveMinCandles];

  // Validate data consistency
  const minLength = Math.min(
    allFiveMinCandles.length,
    allFiveMinCandles.filter((c) => c.open != null).length,
    allFiveMinCandles.filter((c) => c.high != null).length,
    allFiveMinCandles.filter((c) => c.low != null).length,
    allFiveMinCandles.filter((c) => c.close != null).length
  );
  if (minLength < allFiveMinCandles.length) {
    allFiveMinCandles = allFiveMinCandles.slice(0, minLength);
  }

  // Check if last candle is complete, but preserve 15:25 candle
  if (allFiveMinCandles.length > 0) {
    const lastCandleTimestamp = allFiveMinCandles[allFiveMinCandles.length - 1].timestamp;
    const lastCandleDate = new Date(lastCandleTimestamp * 1000);
    const isMarketCloseCandle = lastCandleDate.getHours() === 15 && lastCandleDate.getMinutes() === 25;
    const minuteDiff = getMinuteDifference(currentTime, lastCandleTimestamp);
    if (minuteDiff < 5 && !isMarketCloseCandle) {
      allFiveMinCandles.pop();
    }
  }

  // Sort candles by timestamp
  allFiveMinCandles.sort((a, b) => a.timestamp - b.timestamp);

  // Define valid 15-minute start times and their expected 5-minute candle minutes
  const minuteCombinations = {
    15: [15, 20, 25], // e.g., 9:15 + 9:20 + 9:25
    30: [30, 35, 40], // e.g., 9:30 + 9:35 + 9:40
    45: [45, 50, 55], // e.g., 9:45 + 9:50 + 9:55
    0: [0, 5, 10],   // e.g., 10:00 + 10:05 + 10:10
  };
  const tradingStartHour = 9;
  const tradingEndHour = 15;

  // Merge 5-minute candles into 15-minute candles
  for (let i = 0; i <= allFiveMinCandles.length - 3; i++) {
    const firstCandle = allFiveMinCandles[i];
    const secondCandle = allFiveMinCandles[i + 1];
    const thirdCandle = allFiveMinCandles[i + 2];

    if (firstCandle && secondCandle && thirdCandle) {
      const firstCandleDate = new Date(firstCandle.timestamp * 1000);
      const secondCandleDate = new Date(secondCandle.timestamp * 1000);
      const thirdCandleDate = new Date(thirdCandle.timestamp * 1000);
      const firstHour = firstCandleDate.getHours();
      const firstMinutes = firstCandleDate.getMinutes();
      const secondMinutes = secondCandleDate.getMinutes();
      const thirdMinutes = thirdCandleDate.getMinutes();
      const timeDiffToSecond = (secondCandleDate - firstCandleDate) / (1000 * 60);
      const timeDiffToThird = (thirdCandleDate - firstCandleDate) / (1000 * 60);

      // Check if the first candle is at a valid 15-minute boundary
      const isValidStart =
        (Object.keys(minuteCombinations).map(Number).includes(firstMinutes) &&
         firstHour >= tradingStartHour &&
         firstHour <= tradingEndHour) ||
        (firstHour === 15 && firstMinutes === 15);

      // Validate the minute combinations
      let expectedMinutes = [];
      if (firstHour === 15 && firstMinutes === 15) {
        expectedMinutes = [15, 20, 25]; // Special case for 15:15 + 15:20 + 15:25
      } else {
        expectedMinutes = minuteCombinations[firstMinutes];
      }

      const isValidCombination =
        expectedMinutes &&
        firstMinutes === expectedMinutes[0] &&
        secondMinutes === expectedMinutes[1] &&
        thirdMinutes === expectedMinutes[2];

      // Ensure candles are consecutive (5-minute intervals) and match the expected combination
      if (
        timeDiffToSecond === 5 &&
        timeDiffToThird === 10 &&
        isValidStart &&
        isValidCombination
      ) {
        fifteenMinCandles.push({
          timestamp: firstCandle.timestamp,
          open: firstCandle.open,
          high: Math.max(firstCandle.high, secondCandle.high, thirdCandle.high),
          low: Math.min(firstCandle.low, secondCandle.low, thirdCandle.low),
          close: thirdCandle.close,
        });
        i += 2; // Skip the next two candles since they are used
      }
    }
  }

  // Sort and return up to last 5 complete 15-minute candles
  fifteenMinCandles.sort((a, b) => a.timestamp - b.timestamp);
  if (fifteenMinCandles.length >= 5) {
    return fifteenMinCandles.slice(-5);
  } else if (fifteenMinCandles.length > 0) {
    return fifteenMinCandles.slice(-Math.min(5, fifteenMinCandles.length));
  } else {
    return null;
  }
};

const getData = async () => {
  console.log("Start time : ", new Date().toLocaleTimeString());
  const stocks = await StocksDetail.find({}, { SECURITY_ID: 1, _id: 0 });
  const securityIds = stocks.map((stock) =>
    stock.SECURITY_ID.trim().toString()
  );

  try {
    // Get current date and time
    const currentTime = new Date();
    const currentDateStr = currentTime.toISOString().slice(0, 10);
    const toDate = `${currentDateStr} 15:30:00`;
    const normalizedToDate = toDate;

    // Get previous trading day for fromDate
    const prevTradingDay = await getPreviousTradingDay(currentTime);
    const prevDateStr = prevTradingDay.toISOString().slice(0, 10);
    const fromDate = `${prevDateStr} 09:15:00`;
    const normalizedFromDate = fromDate;

    // Validate date range
    const fromDateObj = new Date(
      normalizedFromDate.replace(" ", "T") + "+05:30"
    );
    const toDateObj = new Date(normalizedToDate.replace(" ", "T") + "+05:30");
    const tradingStart = new Date(
      `${normalizedFromDate.split(" ")[0]}T09:15:00+05:30`
    );
    const tradingEnd = new Date(
      `${normalizedToDate.split(" ")[0]}T15:30:00+05:30`
    );

    if (fromDateObj < tradingStart || toDateObj > tradingEnd) {
      throw new Error("Date range outside NSE trading hours");
    }

    // Get previous trading day for historical data
    const prevTradingDayForFetch = await getPreviousTradingDay(toDateObj);
    const prevDateStrForFetch = prevTradingDayForFetch
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "-");
    const prevFromDate = `${prevDateStrForFetch} 09:15:00`;
    const prevToDate = `${prevDateStrForFetch} 15:30:00`;
    await runFetchForIndexCandles(fromDate, toDate);

    let totalCount = 0;
    // Process 5-Minute and Derived Candles
    for (let i = 0; i < securityIds.length; i++, totalCount++) {
      const id = securityIds[i];
      let allCandles = [];
      let completeCandles = [];

      // Fetch today's 5-minute data
      let rawData = await fetchHistoricalData(
        id,
        normalizedFromDate,
        normalizedToDate,
        i,
        "5"
      );
      if (rawData && rawData.timestamp && rawData.timestamp.length > 0) {
        allCandles.push(
          ...rawData.timestamp.map((ts, idx) => ({
            timestamp: ts,
            open: rawData.open[idx],
            high: rawData.high[idx],
            low: rawData.low[idx],
            close: rawData.close[idx],
          }))
        );
      } else {
        continue;
      }

      // Check if last candle is complete (≥ 5 minutes difference)
      if (allCandles.length > 0) {
        const lastCandleTimestamp = allCandles[allCandles.length - 1].timestamp;
        const minuteDiff = getMinuteDifference(
          currentTime,
          lastCandleTimestamp
        );
        if (minuteDiff < 5) {
          allCandles.pop();
        }
      }

      completeCandles = allCandles;

      // If fewer than 20 complete candles, fetch previous day's data
      if (completeCandles.length < 20) {
        rawData = await fetchHistoricalData(
          id,
          prevFromDate,
          prevToDate,
          i,
          "5"
        );
        if (rawData && rawData.timestamp && rawData.timestamp.length > 0) {
          allCandles.unshift(
            ...rawData.timestamp.map((ts, idx) => ({
              timestamp: ts,
              open: rawData.open[idx],
              high: rawData.high[idx],
              low: rawData.low[idx],
              close: rawData.close[idx],
            }))
          );
          completeCandles = allCandles;
        }
      }

      // Process 5-Minute Candles (limit to last 5 for saving)
      if (completeCandles.length >= 5) {
        completeCandles = completeCandles.slice(-5); // Save only the last 5 candles
        const formattedData = {
          securityId: id,
          timestamp: completeCandles.map((c) => formatTimestamp(c.timestamp)),
          open: completeCandles.map((c) => c.open),
          high: completeCandles.map((c) => c.high),
          low: completeCandles.map((c) => c.low),
          close: completeCandles.map((c) => c.close),
        };

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
        } catch (error) {
          console.error(
            `[MongoDB] Error saving 5-min data for ${id}: ${error.message}`
          );
        }

        // Merge 5-minute candles into 10-minute candles (using all available candles)
        const tenMinCandles = mergeToTenMinCandles(
          id,
          allCandles, // Use all candles for merging
          currentTime
        );
        if (tenMinCandles) {
          const formattedTenMinData = {
            securityId: id,
            timestamp: tenMinCandles.map((c) => formatTimestamp(c.timestamp)),
            open: tenMinCandles.map((c) => c.open),
            high: tenMinCandles.map((c) => c.high),
            low: tenMinCandles.map((c) => c.low),
            close: tenMinCandles.map((c) => c.close),
          };

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
          } catch (error) {
            console.error(
              `[MongoDB] Error saving 10-min data for ${id}: ${error.message}`
            );
          }
        }

        // Merge 5-minute candles into 15-minute candles (using all available candles)
        const fifteenMinCandles = mergeToFifteenMinCandles(
          id,
          allCandles, // Use all candles for merging
          currentTime
        );
        if (fifteenMinCandles) {
          const formattedFifteenMinData = {
            securityId: id,
            timestamp: fifteenMinCandles.map((c) => formatTimestamp(c.timestamp)),
            open: fifteenMinCandles.map((c) => c.open),
            high: fifteenMinCandles.map((c) => c.high),
            low: fifteenMinCandles.map((c) => c.low),
            close: fifteenMinCandles.map((c) => c.close),
          };

          try {
            await FifteenMinCandles.updateOne(
              { securityId: id },
              {
                $set: {
                  timestamp: formattedFifteenMinData.timestamp,
                  open: formattedFifteenMinData.open,
                  high: formattedFifteenMinData.high,
                  low: formattedFifteenMinData.low,
                  close: formattedFifteenMinData.close,
                },
              },
              { upsert: true }
            );
          } catch (error) {
            console.error(
              `[MongoDB] Error saving 15-min data for ${id}: ${error.message}`
            );
          }
        }
      }

      await delay(200);
    }

    console.log("Total Count for 5mins and derived candles : ", totalCount);
    console.log("End Time : ", new Date().toLocaleTimeString());
  } catch (error) {
    console.error("[Main] Error in getData:", error.message);
    throw error;
  }
};

export { startWebSocket, getData };