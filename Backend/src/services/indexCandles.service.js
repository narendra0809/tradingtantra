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

// Merge 1-minute candles into 3-minute candles

const mergeCandles = (data, intervalMinutes, currentTime) => {
  const mergedCandles = [];
  const candlesPerInterval = intervalMinutes;

  // Define trading session end (3:30 PM IST on the current date)
  const tradingDayEnd = moment
    .tz("Asia/Kolkata")
    .set({ hour: 15, minute: 30, second: 0, millisecond: 0 });
  const tradingDayEndUnix = Math.floor(tradingDayEnd.unix()); // Unix timestamp in seconds

  for (let i = 0; i < data.open.length; i += candlesPerInterval) {
    const sliceEnd = Math.min(i + candlesPerInterval, data.open.length);
    const slice = {
      open: data.open.slice(i, sliceEnd),
      high: data.high.slice(i, sliceEnd),
      low: data.low.slice(i, sliceEnd),
      close: data.close.slice(i, sliceEnd),
      timestamp: data.timestamp.slice(i, sliceEnd),
    };

    // Skip if the first timestamp in the slice is after 3:30 PM IST
    if (slice.timestamp[0] > tradingDayEndUnix) {
      continue;
    }

    // Ensure the slice has enough candles and is not too recent
    if (slice.open.length < candlesPerInterval) {
      const lastTimestamp = slice.timestamp[slice.timestamp.length - 1];
      const minuteDiff = getMinuteDifference(currentTime, lastTimestamp);
      if (minuteDiff < intervalMinutes) {
        continue;
      }
    }

    if (slice.open.length > 0) {
      mergedCandles.push({
        open: slice.open[0],
        high: Math.max(...slice.high),
        low: Math.min(...slice.low),
        close: slice.close[slice.close.length - 1],
        lastClose: slice.close[slice.close.length - 1],
        timestamp: unixToIST(slice.timestamp[0]),
      });
    }
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
    console.error(
      `Error fetching ${interval} data for ${index.name}:`,
      error.response?.data || error.message
    );
    return null;
  }
};

// Delete data older than the previous trading day
const deleteOldData = async (previousTradingDay) => {
  const previousTradingDayStart = moment(previousTradingDay)
    .tz("Asia/Kolkata")
    .startOf("day")
    .toDate();
  await IndexCandles.deleteMany({
    timestamp: {
      $lt: moment(previousTradingDayStart).format("DD/MM/YYYY, 00:00:00 A"),
    },
  });
  console.log(`Deleted data older than ${previousTradingDay}`);
};

// Process and save candles for an index
const processIndexCandles = async (index, apiData, currentTime, interval) => {
  if (!apiData) return;

  try {
    let candles = [];

    const tradingDayEnd = moment
      .tz("Asia/Kolkata")
      .set({ hour: 15, minute: 30, second: 0, millisecond: 0 });
    const tradingDayEndUnix = Math.floor(tradingDayEnd.unix());

    if (interval === "3m") {
      candles = mergeCandles(apiData, 3, currentTime);
    } else {
      const intervalMinutes = interval === "15m" ? 15 : 30;
      candles = apiData.open
        .map((_, i) => {
          const actualTimestampUnix = apiData.timestamp[i];

          if (actualTimestampUnix > tradingDayEndUnix) {
            return null;
          }
          // Validate interval spacing
          if (i > 0) {
            const prevTimestampUnix = apiData.timestamp[i - 1];
            const diffMinutes = (actualTimestampUnix - prevTimestampUnix) / 60;
            if (diffMinutes !== intervalMinutes) {
            }
          }
          return {
            open: apiData.open[i],
            high: apiData.high[i],
            low: apiData.low[i],
            close: apiData.close[i],
            lastClose: apiData.close[i],
            timestamp: unixToIST(actualTimestampUnix),
          };
        })
        .filter((candle) => candle !== null); // Remove skipped candles
    }

    for (const candle of candles) {
      // Check if candle already exists
      const existingCandle = await IndexCandles.findOne({
        indexName: index.name,
        securityId: index.scrip,
        interval,
        timestamp: candle.timestamp,
      });

      if (!existingCandle) {
        const indexCandle = new IndexCandles({
          indexName: index.name,
          securityId: index.scrip,
          interval,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          lastClose: candle.close,
          timestamp: candle.timestamp,
        });
        await indexCandle.save();
      }
    }
    console.log(
      `Saved new ${interval} candle for ${index.name} count : ${candles.length}`
    );
  } catch (error) {
    console.error(
      `Error processing ${index.name} candles for ${interval}:`,
      error
    );
  }
};

// Fetch and process data for all indices and intervals
const fetchAndProcessAllIndices = async (
  fromDate,
  toDate,
  previousTradingDay
) => {
  const currentTime = new Date();
  const intervals = ["3m", "15m", "30m"];

  // Delete old data
  await deleteOldData(previousTradingDay);

  for (const index of indices) {
    for (const interval of intervals) {
      console.log(`Fetching ${interval} data for ${index.name}...`);
      const apiData = await fetchDhanData(index, interval, fromDate, toDate);
      if (apiData) {
        await processIndexCandles(index, apiData, currentTime, interval);
      }

      await delay(200);
    }
  }
  console.log("All indices processed successfully");
};

// Main function to run the fetch and process
export const runFetchForIndexCandles = async () => {
  try {
    const today = moment().tz("Asia/Kolkata");
    const currentDate = formatDateForAPI(today);

    // Get previous trading day
    const previousTradingDay = await getPreviousTradingDay(today);
    const previousTradingDate = formatDateForAPI(previousTradingDay);

    console.log(
      `Starting index candle fetch for ${previousTradingDate} to ${currentDate}`
    );
    await fetchAndProcessAllIndices(
      previousTradingDate,
      currentDate,
      previousTradingDay
    );
    console.log("Index candle processing completed");
  } catch (error) {
    console.error("Error in runFetchForIndexCandles:", error);
    throw error;
  }
};
