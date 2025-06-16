// import mongoose from "mongoose";
// import axios from "axios";
// import moment from "moment-timezone";
// import dotenv from "dotenv";

import { getPreviousTradingDay } from "../src/controllers/liveMarketData.controller.js";

// dotenv.config();

// // MongoDB connection

// const DB_URI = "mongodb://localhost:27017/";

// console.log(process.env.DHAN_ACCESS_TOKEN);
// mongoose
//   .connect(DB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// // Define MongoDB schema for index candles
// const IndexCandleSchema = new mongoose.Schema({
//   indexName: String,
//   securityId: String,
//   interval: String,
//   open: Number,
//   high: Number,
//   low: Number,
//   close: Number,
//   timestamp: String, // Changed to String for custom format
//   createdAt: { type: Date, default: Date.now },
// });

// const IndexCandle = mongoose.model("IndexCandle", IndexCandleSchema);

// // Indices configuration
// const indices = [
//   { name: "NIFTY", scrip: "13", seg: "IDX_I", stepSize: 50 },
//   { name: "BANKNIFTY", scrip: "25", seg: "IDX_I", stepSize: 100 },
//   { name: "FINNIFTY", scrip: "27", seg: "IDX_I", stepSize: 50 },
//   { name: "MIDCPNIFTY", scrip: "442", seg: "IDX_I", stepSize: 75 },
//   { name: "SENSEX", scrip: "51", seg: "IDX_I", stepSize: 100 },
// ];

// // Dhan API configuration
// const DHAN_API_URL = "https://api.dhan.co/v2/charts/intraday";
// const ACCESS_TOKEN =
//   "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzUxOTE4MjI1LCJ0b2tlbkNvbnN1bWVyVHlwZSI6IlNFTEYiLCJ3ZWJob29rVXJsIjoiIiwiZGhhbkNsaWVudElkIjoiMTEwNDA3MzA3OCJ9.oQLc3FghLD_fA4gKjxvQDUgoamvZSN2HaSKW8e5T2yNGKqQGtjJsRO-hOB_IDDBVofaf4-GUKiWJe8g3h99kFg"; // Store in .env file

// // Function to convert Unix timestamp to IST string in DD/MM/YYYY, hh:mm:ss A format
// const unixToIST = (unixTimestamp) => {
//   return moment
//     .unix(unixTimestamp)
//     .tz("Asia/Kolkata")
//     .format("DD/MM/YYYY, hh:mm:ss A");
// };

// // Function to merge 1-minute candles into specified interval candles
// const mergeCandles = (data, intervalMinutes) => {
//   const mergedCandles = [];
//   const candlesPerInterval = intervalMinutes;

//   for (let i = 0; i < data.open.length; i += candlesPerInterval) {
//     const sliceEnd = Math.min(i + candlesPerInterval, data.open.length);
//     const slice = {
//       open: data.open.slice(i, sliceEnd),
//       high: data.high.slice(i, sliceEnd),
//       low: data.low.slice(i, sliceEnd),
//       close: data.close.slice(i, sliceEnd),
//       timestamp: data.timestamp.slice(i, sliceEnd),
//     };

//     if (slice.open.length > 0) {
//       mergedCandles.push({
//         open: slice.open[0],
//         high: Math.max(...slice.high),
//         low: Math.min(...slice.low),
//         close: slice.close[slice.close.length - 1],
//         timestamp: unixToIST(slice.timestamp[0]),
//       });
//     }
//   }

//   return mergedCandles;
// };

// // Function to fetch data from Dhan API
// const fetchDhanData = async (index, fromDate, toDate) => {
//   try {
//     const response = await axios.post(
//       DHAN_API_URL,
//       {
//         securityId: index.scrip,
//         exchangeSegment: index.seg,
//         instrument: "INDEX",
//         interval: "1",
//         oi: false,
//         fromDate,
//         toDate,
//       },
//       {
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//           "access-token": ACCESS_TOKEN,
//         },
//       }
//     );

//     return response.data;
//   } catch (error) {
//     console.error(
//       `Error fetching data for ${index.name}:`,
//       error.response?.data || error.message
//     );
//     return null;
//   }
// };

// // Function to process and save candles for an index
// const processIndexCandles = async (index, apiData, intervals = [3, 15, 30]) => {
//   if (!apiData) return;

//   try {
//     for (const interval of intervals) {
//       const mergedCandles = mergeCandles(apiData, interval);

//       for (const candle of mergedCandles) {
//         const indexCandle = new IndexCandle({
//           indexName: index.name,
//           securityId: index.scrip,
//           interval: `${interval}m`,
//           open: candle.open,
//           high: candle.high,
//           low: candle.low,
//           close: candle.close,
//           timestamp: candle.timestamp,
//         });

//         await indexCandle.save();
//       }
//       console.log(`Saved ${interval}-minute candles for ${index.name}`);
//     }
//   } catch (error) {
//     console.error(`Error processing ${index.name} candles:`, error);
//   }
// };

// // Function to fetch and process data for all indices
// const fetchAndProcessAllIndices = async () => {
//   const fromDate = "2025-06-06";
//   const toDate = "2025-06-09";

//   for (const index of indices) {
//     console.log(`Fetching data for ${index.name}...`);
//     const apiData = await fetchDhanData(index, fromDate, toDate);
//     if (apiData) {
//       await processIndexCandles(index, apiData);
//     }
//   }
//   console.log("All indices processed successfully");
// };

// // Run the script
// fetchAndProcessAllIndices()
//   .then(() => mongoose.connection.close())
//   .catch((err) => {
//     console.error("Error:", err);
//     mongoose.connection.close();
//   });

const previousDay = await getPreviousTradingDay(new Date());
console.log("Previous Day :", previousDay);
