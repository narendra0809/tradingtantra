import moment from "moment-timezone";
import IndexCandles from "../models/indexCandles.model.js";
import axios from "axios";
import { getMinuteDifference, getPreviousTradingDay } from "../controllers/liveMarketData.controller.js";

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

// Merge 1-minute candles into specified interval candles
const mergeCandles = (data, intervalMinutes, currentTime) => {
  const mergedCandles = [];
  const candlesPerInterval = intervalMinutes;

  for (let i = 0; i < data.open.length; i += candlesPerInterval) {
    const sliceEnd = Math.min(i + candlesPerInterval, data.open.length);
    const slice = {
      open: data.open.slice(i, sliceEnd),
      high: data.high.slice(i, sliceEnd),
      low: data.low.slice(i, sliceEnd),
      close: data.close.slice(i, sliceEnd),
      timestamp: data.timestamp.slice(i, sliceEnd),
    };
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

// Fetch data from Dhan API
const fetchDhanData = async (index, fromDate, toDate) => {
  try {
    const response = await axios.post(
      DHAN_API_URL,
      {
        securityId: index.scrip,
        exchangeSegment: index.seg,
        instrument: "INDEX",
        interval: "1",
        oi: false,
        fromDate,
        toDate,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "access-token": ACCESS_TOKEN,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for ${index.name}:`, error.response?.data || error.message);
    return null;
  }
};

// Delete all data if it's Monday
const deleteDataOnMonday = async () => {
  const today = moment().tz("Asia/Kolkata");
  if (today.day() === 1) { // Monday
    await IndexCandles.deleteMany({});
    console.log("Deleted all data as it's Monday");
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
const processIndexCandles = async (index, apiData, currentTime, intervals = [3, 15, 30]) => {
  if (!apiData) return;

  try {
    for (const interval of intervals) {
      const mergedCandles = mergeCandles(apiData, interval, currentTime);

      for (const candle of mergedCandles) {
        // Check if candle already exists
        const existingCandle = await IndexCandles.findOne({
          indexName: index.name,
          securityId: index.scrip,
          interval: `${interval}m`,
          timestamp: candle.timestamp,
        });

        if (existingCandle) {
          // Update existing candle
          existingCandle.open = candle.open;
          existingCandle.high = candle.high;
          existingCandle.low = candle.low;
          existingCandle.close = candle.close;
          existingCandle.lastClose = candle.close;
          await existingCandle.save();
          console.log(`Updated ${interval}-minute candle for ${index.name} at ${candle.timestamp}`);
        } else {
          // Save new candle
          const indexCandle = new IndexCandles({
            indexName: index.name,
            securityId: index.scrip,
            interval: `${interval}m`,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            lastClose: candle.close,
            timestamp: candle.timestamp,
          });
          await indexCandle.save();
          console.log(`Saved new ${interval}-minute candle for ${index.name} at ${candle.timestamp}`);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing ${index.name} candles:`, error);
  }
};

// Fetch and process data for all indices
const fetchAndProcessAllIndices = async (fromDate, toDate, previousTradingDay) => {
  const currentTime = new Date();

  // Delete old data
  await deleteOldData(previousTradingDay);

  for (const index of indices) {
    console.log(`Fetching data for ${index.name}...`);
    const apiData = await fetchDhanData(index, fromDate, toDate);
    if (apiData) {
      await processIndexCandles(index, apiData, currentTime);
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
    const previousTradingDay = await getPreviousTradingDay();
    const previousTradingDate = formatDateForAPI(previousTradingDay);

    // Delete all data if it's Monday
    await deleteDataOnMonday();

    console.log(`Starting index candle fetch for ${previousTradingDate} to ${currentDate}`);
    await fetchAndProcessAllIndices(previousTradingDate, currentDate, previousTradingDay);
    console.log("Index candle processing completed");
  } catch (error) {
    console.error("Error in runFetchForIndexCandles:", error);
    throw error;
  }
};