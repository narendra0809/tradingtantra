import moment from "moment-timezone";
import IndexCandles from "../models/indexCandles.model.js";
import axios from "axios";
import {
  getMinuteDifference,
  getPreviousTradingDay,
} from "../controllers/liveMarketData.controller.js";

const indices = [
  { name: "NIFTY", scrip: "13", seg: "IDX_I", stepSize: 50 },
  { name: "BANKNIFTY", scrip: "25", seg: "IDX_I", stepSize: 100 },
  { name: "FINNIFTY", scrip: "27", seg: "IDX_I", stepSize: 50 },
  { name: "MIDCPNIFTY", scrip: "442", seg: "IDX_I", stepSize: 75 },
  { name: "SENSEX", scrip: "51", seg: "IDX_I", stepSize: 100 },
];

// Dhan API configuration
const DHAN_API_URL = "https://api.dhan.co/v2/charts/intraday";
const ACCESS_TOKEN = process.env.DHAN_ACCESS_TOKEN;

// Utility to add a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Convert Unix timestamp to IST string in DD/MM/YYYY, hh:mm:ss A format
const unixToIST = (unixTimestamp) => {
  return moment
    .unix(unixTimestamp)
    .tz("Asia/Kolkata")
    .format("DD/MM/YYYY, hh:mm:ss A");
};

// Format date to DD-MM-YYYY for API
const formatDateForAPI = (date) => {
  return moment(date).format("DD-MM-YYYY");
};

// Get the 3-minute interval start timestamp
const getIntervalStart = (timestamp, intervalMinutes) => {
  const date = moment.unix(timestamp).tz("Asia/Kolkata");
  const minute = date.minute();
  const intervalStartMinute = Math.floor(minute / intervalMinutes) * intervalMinutes;
  return date
    .set({ minute: intervalStartMinute, second: 0, millisecond: 0 })
    .unix();
};

// Merge last 9 one-minute candles into 3 three-minute candles and handle after-market close
const mergeCandles = (data, intervalMinutes, currentTime, indexName, tradingDay) => {
  const mergedCandles = [];
  const candlesPerInterval = intervalMinutes;
  const candlesToProcess = 9; // Process last 9 one-minute candles

  const tradingDayStart = moment
    .tz(tradingDay, "DD-MM-YYYY", "Asia/Kolkata")
    .startOf("day");
  const tradingDayEnd = tradingDayStart.clone().set({ hour: 15, minute: 30, second: 0, millisecond: 0 });
  const tradingDayStartUnix = Math.floor(tradingDayStart.unix());
  const tradingDayEndUnix = Math.floor(tradingDayEnd.unix());

  let afterMarketClose = null;

  // Take the last 9 one-minute candles
  const startIndex = Math.max(0, data.open.length - candlesToProcess);
  const slicedData = {
    open: data.open.slice(startIndex),
    high: data.high.slice(startIndex),
    low: data.low.slice(startIndex),
    close: data.close.slice(startIndex),
    timestamp: data.timestamp.slice(startIndex),
  };

  // Group candles by 3-minute intervals
  const intervalGroups = {};
  for (let i = 0; i < slicedData.open.length; i++) {
    const timestamp = slicedData.timestamp[i];
    
    // Skip if timestamp is from previous day
    if (timestamp < tradingDayStartUnix) {
      continue;
    }

    if (timestamp > tradingDayEndUnix) {
      afterMarketClose = slicedData.close[i];
      continue;
    }

    const intervalStartUnix = getIntervalStart(timestamp, intervalMinutes);
    const intervalKey = intervalStartUnix;

    if (!intervalGroups[intervalKey]) {
      intervalGroups[intervalKey] = {
        open: [],
        high: [],
        low: [],
        close: [],
        timestamp: [],
      };
    }

    intervalGroups[intervalKey].open.push(slicedData.open[i]);
    intervalGroups[intervalKey].high.push(slicedData.high[i]);
    intervalGroups[intervalKey].low.push(slicedData.low[i]);
    intervalGroups[intervalKey].close.push(slicedData.close[i]);
    intervalGroups[intervalKey].timestamp.push(slicedData.timestamp[i]);
  }

  // Create 3-minute candles from grouped data (only complete intervals)
  const intervalKeys = Object.keys(intervalGroups)
    .map(Number)
    .sort((a, b) => b - a) // Sort descending to get latest intervals
    .slice(0, 3); // Take last 3 intervals

  for (const intervalKey of intervalKeys) {
    const slice = intervalGroups[intervalKey];
    // Only process complete 3-minute intervals (exactly 3 one-minute candles)
    if (slice.open.length === candlesPerInterval) {
      const candle = {
        open: slice.open[0],
        high: Math.max(...slice.high),
        low: Math.min(...slice.low),
        close: slice.close[slice.close.length - 1],
        lastClose: slice.close[slice.close.length - 1],
        timestamp: unixToIST(intervalKey),
      };
      mergedCandles.push(candle);
    }
  }

  // Add after-market close to 3:27 PM candle
  if (afterMarketClose !== null) {
    const targetTimestamp = moment
      .tz(tradingDay, "DD-MM-YYYY", "Asia/Kolkata")
      .set({ hour: 15, minute: 27, second: 0, millisecond: 0 })
      .format("DD/MM/YYYY, hh:mm:ss A");
   
    mergedCandles.push({
      close: afterMarketClose,
      lastClose: afterMarketClose,
      timestamp: targetTimestamp,
      isAfterMarketUpdate: true,
    });
  }

  return mergedCandles;
};

// Fetch data from Dhan API for a specific interval
const fetchDhanData = async (index, interval, fromDate, toDate) => {
  const formattedFromDate = moment(fromDate, "DD-MM-YYYY").format("YYYY-MM-DD");
  const formattedToDate = moment(toDate, "DD-MM-YYYY").format("YYYY-MM-DD");

  try {
    const response = await axios.post(
      DHAN_API_URL,
      {
        securityId: index.scrip,
        exchangeSegment: index.seg,
        instrument: "INDEX",
        interval: interval === "3m" ? "1" : interval.replace("m", ""),
        oi: false,
        fromDate: formattedFromDate,
        toDate: formattedToDate,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "access-token": ACCESS_TOKEN,
        },
      }
    );

    const obj = {
      open: response.data.open,
      low: response.data.low,
      high: response.data.high,
      close: response.data.close,
      timestamp: response.data.timestamp,
    };

    return obj;
  } catch (error) {
    if (error.response?.status === 429) {
      console.warn(`Rate limit hit for ${index.name}. Retrying after 1s...`);
      await delay(150);
      return fetchDhanData(index, interval, fromDate, toDate);
    }
    console.error(
      `Error fetching ${interval} data for ${index.name}:`,
      error.response?.data || error.message
    );
    return null;
  }
};

// Process and save candles for an index
const processIndexCandles = async (index, apiData, currentTime, interval, tradingDay) => {
  if (!apiData) {
    console.log(`No data to process for ${index.name} (${interval})`);
    return;
  }

  try {
    let candles = [];
    let afterMarketClose = null;

    const tradingDayStart = moment.tz(tradingDay, "DD-MM-YYYY", "Asia/Kolkata").startOf("day");
    const tradingDayEnd = tradingDayStart.clone().set({ hour: 15, minute: 30, second: 0, millisecond: 0 });
    const tradingDayStartUnix = Math.floor(tradingDayStart.unix());
    const tradingDayEndUnix = Math.floor(tradingDayEnd.unix());

    if (interval === "3m") {
      candles = mergeCandles(apiData, 3, currentTime, index.name, tradingDay);
    } else {
      const intervalMinutes = interval === "15m" ? 15 : 30;
      const candlesToProcess = 3; // Process last 3 candles
      const startIndex = Math.max(0, apiData.open.length - candlesToProcess);

      // Take the last 3 candles
      const slicedData = {
        open: apiData.open.slice(startIndex),
        high: apiData.high.slice(startIndex),
        low: apiData.low.slice(startIndex),
        close: apiData.close.slice(startIndex),
        timestamp: apiData.timestamp.slice(startIndex),
      };

      candles = slicedData.open
        .map((_, i) => {
          const actualTimestampUnix = slicedData.timestamp[i];

          // Skip if timestamp is from previous day
          if (actualTimestampUnix < tradingDayStartUnix) {
            return null;
          }

          if (actualTimestampUnix > tradingDayEndUnix) {
            afterMarketClose = slicedData.close[i];
            return null;
          }

          if (i > 0) {
            const prevTimestampUnix = slicedData.timestamp[i - 1];
            const diffMinutes = (actualTimestampUnix - prevTimestampUnix) / 60;
            if (diffMinutes !== intervalMinutes) {
              console.warn(
                `Unexpected interval for ${index.name} (${interval}): ${diffMinutes} minutes at ${unixToIST(actualTimestampUnix)}`
              );
              return null;
            }
          }

          return {
            open: slicedData.open[i],
            high: slicedData.high[i],
            low: slicedData.low[i],
            close: slicedData.close[i],
            lastClose: slicedData.close[i],
            timestamp: unixToIST(actualTimestampUnix),
          };
        })
        .filter((candle) => candle !== null);

      // Add after-market close to 3:15 PM candle
      if (afterMarketClose !== null) {
        const targetTimestamp = moment
          .tz(tradingDay, "DD-MM-YYYY", "Asia/Kolkata")
          .set({ hour: 15, minute: 15, second: 0, millisecond: 0 })
          .format("DD/MM/YYYY, hh:mm:ss A");

        candles.push({
          close: afterMarketClose,
          lastClose: afterMarketClose,
          timestamp: targetTimestamp,
          isAfterMarketUpdate: true,
        });
      }
    }

    for (const candle of candles) {
      const query = {
        indexName: index.name,
        securityId: index.scrip,
        interval,
        timestamp: candle.timestamp,
      };

      if (candle.isAfterMarketUpdate) {
        // Update existing candle with after-market close
        const updateResult = await IndexCandles.updateOne(
          query,
          {
            $set: {
              close: candle.close,
              lastClose: candle.lastClose,
            },
          }
        );
        if (updateResult.matchedCount > 0) {
          console.log(`Updated after-market ${interval} candle for ${index.name} at ${candle.timestamp}`);
        } else {
          console.warn(`No ${interval} candle found to update at ${candle.timestamp} for ${index.name}`);
          // Save as new candle with default values
          const indexCandle = new IndexCandles({
            indexName: index.name,
            securityId: index.scrip,
            interval,
            open: candle.open || 0,
            high: candle.high || 0,
            low: candle.low || 0,
            close: candle.close,
            lastClose: candle.lastClose,
            timestamp: candle.timestamp,
          });
          await indexCandle.save();
          console.log(`Saved new ${interval} candle for ${index.name} at ${candle.timestamp} with after-market close`);
        }
      } else {
        // Save new candle if it doesn't exist
        const existingCandle = await IndexCandles.findOne(query);
        if (!existingCandle) {
          const indexCandle = new IndexCandles({
            indexName: index.name,
            securityId: index.scrip,
            interval,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            lastClose: candle.lastClose,
            timestamp: candle.timestamp,
          });
          await indexCandle.save();
          console.log(`Saved ${interval} candle for ${index.name} at ${candle.timestamp}`);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing ${index.name} candles for ${interval}:`, error);
  }
};

// Fetch and process data for all indices and intervals
const fetchAndProcessAllIndices = async (fromDate, toDate) => {
  const currentTime = new Date();
  const intervals = ["3m", "15m", "30m"];

  for (const index of indices) {
    for (const interval of intervals) {
      const apiData = await fetchDhanData(index, interval, fromDate, toDate);
      if (apiData) {
        await processIndexCandles(index, apiData, currentTime, interval, toDate);
      }
      await delay(150);
    }
  }
  console.log("All indices processed successfully");
};

// Main function to run the fetch and process
export const runFetchForIndexCandles = async () => {
  try {
    const today = moment().tz("Asia/Kolkata");
    const currentDate = formatDateForAPI(today);

    // Only fetch and process current day's data
    await fetchAndProcessAllIndices(currentDate, currentDate);
  } catch (error) {
    console.error("Error in runFetchForIndexCandles:", error);
    throw error;
  }
};