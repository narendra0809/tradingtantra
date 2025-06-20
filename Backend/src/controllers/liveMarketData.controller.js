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

// const mergeToTenMinCandles = (securityId, fiveMinCandles, currentTime) => {
//   let tenMinCandles = [];
//   let allFiveMinCandles = [...fiveMinCandles];

//   // Validate data consistency
//   const minLength = Math.min(
//     allFiveMinCandles.length,
//     allFiveMinCandles.filter((c) => c.open != null).length,
//     allFiveMinCandles.filter((c) => c.high != null).length,
//     allFiveMinCandles.filter((c) => c.low != null).length,
//     allFiveMinCandles.filter((c) => c.close != null).length
//   );
//   if (minLength < allFiveMinCandles.length) {
//     allFiveMinCandles = allFiveMinCandles.slice(0, minLength);
//   }

//   // Check if last candle is complete
//   if (allFiveMinCandles.length > 0) {
//     const lastCandleTimestamp =
//       allFiveMinCandles[allFiveMinCandles.length - 1].timestamp;
//     const minuteDiff = getMinuteDifference(currentTime, lastCandleTimestamp);
//     if (minuteDiff < 5) {
//       allFiveMinCandles.pop();
//     }
//   }

//   // Sort candles by timestamp
//   allFiveMinCandles.sort((a, b) => a.timestamp - b.timestamp);

//   // Check if last candle is 15:25
//   let isLastCandle1525 = false;
//   let lastCandle = null;
//   if (allFiveMinCandles.length > 0) {
//     lastCandle = allFiveMinCandles[allFiveMinCandles.length - 1];
//     const lastCandleDate = new Date(lastCandle.timestamp * 1000);
//     const lastHours = lastCandleDate.getHours();
//     const lastMinutes = lastCandleDate.getMinutes();
//     isLastCandle1525 = lastHours === 15 && lastMinutes === 25;
//   }

//   // Merge 5-minute candles into 10-minute candles (odd + even minutes)
//   for (let i = 0; i < allFiveMinCandles.length - 1; i++) {
//     const firstCandle = allFiveMinCandles[i];
//     const secondCandle = allFiveMinCandles[i + 1];

//     if (secondCandle) {
//       const firstCandleDate = new Date(firstCandle.timestamp * 1000);
//       const secondCandleDate = new Date(secondCandle.timestamp * 1000);
//       const firstMinutes = firstCandleDate.getMinutes();
//       const secondMinutes = secondCandleDate.getMinutes();
//       const timeDiffMinutes =
//         (secondCandleDate - firstCandleDate) / (1000 * 60);

//       // Check if first candle is odd minute (e.g., 15, 25, 35) and second is even (e.g., 20, 30, 40)
//       const isOddMinute = [15, 25, 35, 45, 55, 5].includes(firstMinutes);
//       const isEvenMinute = [20, 30, 40, 50, 0, 10].includes(secondMinutes);
//   if (isLastCandle1525) {
//     tenMinCandles.push({
//       timestamp: lastCandle.timestamp,
//       open: lastCandle.open,
//       high: lastCandle.high,
//       low: lastCandle.low,
//       close: lastCandle.close,
//     });
//   }
//       if (timeDiffMinutes === 5 && isOddMinute && isEvenMinute) {
//         tenMinCandles.push({
//           timestamp: firstCandle.timestamp, // Use odd minute timestamp (e.g., 15:15)
//           open: firstCandle.open,
//           high: Math.max(firstCandle.high, secondCandle.high),
//           low: Math.min(firstCandle.low, secondCandle.low),
//           close: secondCandle.close,
//         });
//         i++; // Skip second candle
//       }
//     }
//   }

//   tenMinCandles.sort((a, b) => a.timestamp - b.timestamp);

//   // Return last 5 complete 10-minute candles
//   if (tenMinCandles.length >= 5) {
//     return tenMinCandles.slice(-5);
//   } else {
//     return null;
//   }
// };
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
      // Adjust timestamp to 15:30 (market close)
      const marketCloseTimestamp = new Date(lastCandleDate);
      marketCloseTimestamp.setMinutes(30);
      marketCloseTimestamp.setSeconds(0);
      marketCloseTimestamp.setMilliseconds(0);
      tenMinCandles.push({
        timestamp: lastCandle.timestamp, // Convert to seconds
        open: lastCandle.open,
        high: lastCandle.high,
        low: lastCandle.low,
        close: lastCandle.close,
      });
    }
  }

  // Sort and return up to last 5 complete 10-minute candles, or fewer if 15:25 is included
  tenMinCandles.sort((a, b) => a.timestamp - b.timestamp);
  if (tenMinCandles.length > 0) {
    return tenMinCandles.slice(-Math.min(5, tenMinCandles.length));
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
    const fromDate = `${prevDateStr} 09:30:00`;
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
    const prevFromDate = `${prevDateStrForFetch} 09:30:00`;
    const prevToDate = `${prevDateStrForFetch} 15:30:00`;
    // await runFetchForIndexCandles(fromDate, toDate);

    let totalCount = 0;
    // Process 5-Minute and 10-Minute Candles
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

      // If fewer than 12 complete candles, fetch previous day's data
      if (completeCandles.length < 12) {
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
          // console.log(`[MongoDB] 5-min data saved for ${id}`);
        } catch (error) {
          console.error(
            `[MongoDB] Error saving 5-min data for ${id}: ${error.message}`
          );
        }

        // Merge 5-minute candles into 10-minute candles
        const tenMinCandles = mergeToTenMinCandles(
          id,
          completeCandles,
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
      }

      await delay(200);
    }

    console.log("Total Count for 5mins : ", totalCount);

    totalCount = 0;

    // Process 15-Minute Candles
    for (let i = 0; i < securityIds.length; i++, totalCount++) {
      const id = securityIds[i];
      let allCandles = [];
      let completeCandles = [];

      // Fetch today's 15-minute data
      let rawData = await fetchHistoricalData(
        id,
        normalizedFromDate,
        normalizedToDate,
        i,
        "15"
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

      // Check if last candle is complete (≥ 15 minutes difference)
      if (allCandles.length > 0) {
        const lastCandleTimestamp = allCandles[allCandles.length - 1].timestamp;
        const minuteDiff = getMinuteDifference(
          currentTime,
          lastCandleTimestamp
        );
        if (minuteDiff < 15) {
          allCandles.pop();
        }
      }

      completeCandles = allCandles;

      // If fewer than 5 complete candles, fetch previous day's data
      if (completeCandles.length < 5) {
        rawData = await fetchHistoricalData(
          id,
          prevFromDate,
          prevToDate,
          i,
          "15"
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
          // console.log(`[MongoDB] 15-min data saved for ${id}`);
        } catch (error) {
          console.error(
            `[MongoDB] Error saving 15-min data for ${id}: ${error.message}`
          );
        }
      }

      await delay(200);
    }
    console.log("Total Count for 15 mins : ", totalCount);
    console.log("End Time : ", new Date().toLocaleTimeString());
  } catch (error) {
    console.error("[Main] Error in getData:", error.message);
    throw error;
  }
};

export { startWebSocket, getData };
