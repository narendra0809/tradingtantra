import dotenv from "dotenv";
// import WebSocket from "ws";
// import parseBinaryData from "./src/utils/parseBinaryData.js";
import connectDB from "./src/config/db.js";
import {
  AIIntradayReversalDaily,
  AIIntradayReversalFiveMins,
  AIMomentumCatcherFiveMins,
  AIMomentumCatcherTenMins,
  DailyRangeBreakout,
  DayHighLowReversal,
  getData,
  getDataForTenMin,
  getTimestampFormRedis,
  startWebSocket,
  twoDayHLBreak,
} from "./src/controllers/liveMarketData.controller.js";
import MarketDetailData from "./src/models/marketData.model.js";
import StocksDetail from "./src/models/stocksDetail.model.js";
import {
  fetchHistoricalData,
  fetchHistoricalDataforTenMin,
} from "./src/utils/fetchData.js";
import {
  previousDaysVolume,
  sectorStockData,
} from "./src/controllers/stock.contollers.js";
import { AIContraction } from "./src/controllers/swingAnalysis.controllers.js";

// import cron from "node-cron";
// import scrapeAndSaveFIIDIIData from "./src/jobs/scrapData_Two.js";

dotenv.config();

// const ACCESS_TOKEN = process.env.DHAN_ACCESS_TOKEN;
// const CLIENT_ID = process.env.DHAN_CLIENT_ID;

// const WS_URL = `wss://api-feed.dhan.co?version=2&token=${ACCESS_TOKEN}&clientId=${CLIENT_ID}&authType=2`;

// const runTasks = async () => {
//   try {
//     console.log("Running scheduled task...");
//     await connectDB(); // Connect to the database
//     await startWebSocket(); // Start WebSocket
//   } catch (error) {
//     console.error("Error in scheduled task:", error);
//   }
// };

// // Schedule the job to run every 2 minutes
// cron.schedule("*/2 * * * *", async () => {
//   console.log("Cron job running...");
//   await runTasks();
//   console.log("⏳ Waiting 20 seconds before next execution...");
//   await new Promise((resolve) => setTimeout(resolve, 20000));
// });

// console.log("Cron job scheduled to run every 2 minutes.");
// import redis from "./src/config/redisClient.js";
// import { previousDaysVolume } from "./src/controllers/stock.contollers.js";
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// const getFiveMinDataInRedis = async (
//   fromDate = "2025-04-04",
//   toDate = "2025-04-05"
// ) => {
//   const stocks = await StocksDetail.find({}, { SECURITY_ID: 1, _id: 0 });
//   const securityIds = stocks.map((stock) =>
//     stock.SECURITY_ID.trim().toString()
//   );

//   function convertToIST(unixTimestamp) {
//     const date = new Date(unixTimestamp * 1000); // Convert to milliseconds
//     return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
//   }

//   try {
//     const updatedData = [];
//     let data;
//     for (let i = 0; i < securityIds.length; i++) {
//       // const data = await fetchHistoricalData(
//       //   securityIds[i],
//       //   fromDate,
//       //   toDate,
//       //   i
//       // );
//       const redisKey = `stockFiveMinCandle:${securityIds[i]}:${fromDate}-${toDate}`;

//       // Check Redis cache
//       const cachedData = await redis.get(redisKey);
//       if (cachedData) {
//         console.log(`Fetched from Redis: ${securityIds[i]}`);
//         data = JSON.parse(cachedData);
//       } else {
//         data = await fetchHistoricalData(securityIds[i], fromDate, toDate, i);

//         if (data) {
//           await redis.set(redisKey, JSON.stringify(data));
//           console.log(`Fetched from API and cached: ${securityIds[i]}`);
//         }
//       }

//       if (!data) {
//         console.warn(`No data found for Security ID: ${securityIds[i]}`);
//         continue; // Skip if data is missing
//       }

//       // Prepare the updated data
//       updatedData.push({
//         securityId: securityIds[i],
//         timestamp: data.timestamp.slice(-5).map(convertToIST), // Convert all timestamps
//         open: data.open.slice(-5),
//         high: data.high.slice(-5),
//         low: data.low.slice(-5),
//         close: data.close.slice(-5),
//         volume: data.volume.slice(-5),
//       });

//       // Add update operation to bulkWrite array
//       // bulkOperations.push({
//       //   updateOne: {
//       //     filter: { securityId: securityIds[i] }, // Find by securityId
//       //     update: { $set: updatedData }, // Update fields
//       //     upsert: true, // Insert if not found
//       //   },
//       // });
//       await delay(200);
//     }

//     if (updatedData.length > 0) {
//       // await FiveMinCandles.bulkWrite(bulkOperations);
//       console.log(
//         `Bulk operation completed for ${updatedData.length} records.`
//       );
//       console.log("data", updatedData);
//     } else {
//       console.log("No valid data found to update.");
//     }
//   } catch (error) {
//     console.error("Error in getData:", error.message);
//   }
// };

//get data in redis for  ten min candles

// const getTenMinDataInRedis = async (
//   fromDate = "2025-04-04",
//   toDate = "2025-04-05"
// ) => {
//   const stocks = await StocksDetail.find({}, { SECURITY_ID: 1, _id: 0 });
//   const securityIds = stocks.map((stock) =>
//     stock.SECURITY_ID.trim().toString()
//   );

//   function convertToIST(unixTimestamp) {
//     const date = new Date(unixTimestamp * 1000); // Convert to milliseconds
//     return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
//   }

//   try {
//     const updatedData = [];
//     let data;
//     for (let i = 0; i < securityIds.length; i++) {
//       // const data = await fetchHistoricalData(
//       //   securityIds[i],
//       //   fromDate,
//       //   toDate,
//       //   i
//       // );
//       const redisKey = `stockTenMinCandle:${securityIds[i]}:${fromDate}-${toDate}`;

//       // Check Redis cache
//       const cachedData = await redis.get(redisKey);
//       if (cachedData) {
//         console.log(`Fetched from Redis: ${securityIds[i]}`);
//         data = JSON.parse(cachedData);
//       } else {
//         data = await fetchHistoricalDataforTenMin(
//           securityIds[i],
//           fromDate,
//           toDate,
//           i
//         );

//         if (data) {
//           await redis.set(redisKey, JSON.stringify(data));
//           console.log(`Fetched from API and cached: ${securityIds[i]}`);
//         }
//       }

//       if (!data) {
//         console.warn(`No data found for Security ID: ${securityIds[i]}`);
//         continue; // Skip if data is missing
//       }

//       // Prepare the updated data
//       updatedData.push({
//         securityId: securityIds[i],
//         timestamp: data.timestamp.slice(-5).map(convertToIST), // Convert all timestamps
//         open: data.open.slice(-5),
//         high: data.high.slice(-5),
//         low: data.low.slice(-5),
//         close: data.close.slice(-5),
//         volume: data.volume.slice(-5),
//       });

//       // Add update operation to bulkWrite array
//       // bulkOperations.push({
//       //   updateOne: {
//       //     filter: { securityId: securityIds[i] }, // Find by securityId
//       //     update: { $set: updatedData }, // Update fields
//       //     upsert: true, // Insert if not found
//       //   },
//       // });
//       await delay(200);
//     }

//     if (updatedData.length > 0) {
//       // await FiveMinCandles.bulkWrite(bulkOperations);
//       console.log(
//         `Bulk operation completed for ${updatedData.length} records.`
//       );
//       console.log("data for ten min", updatedData);
//     } else {
//       console.log("No valid data found to update.");
//     }
//   } catch (error) {
//     console.error("Error in getData:", error.message);
//   }
// };

// const previousDaysVolume = async (socket) => {
//   try {
//     const uniqueTradingDaysDates = await MarketDetailData.aggregate([
//       { $group: { _id: "$date" } },
//       { $sort: { _id: -1 } },
//       { $limit: 2 },
//     ]);

//     // console.log(uniqueTradingDaysDates,'unique')
//     if (!uniqueTradingDaysDates || uniqueTradingDaysDates.length < 2) {
//       return { success: false, message: "No stock data available" };
//     }

//     const latestDate = uniqueTradingDaysDates[0]._id;
//     const previousDayDate = uniqueTradingDaysDates[1]._id;

//     const todayData = await MarketDetailData.find(
//       { date: latestDate },
//       {
//         securityId: 1,
//         data: 1,
//         _id: 0,
//       }
//     );

//     // console.log('todatdata',todayData)

//     const previousData = await MarketDetailData.aggregate([
//       { $match: { date: { $lt: latestDate } } },
//       { $sort: { date: -1 } },
//       { $limit: 1000 },
//       {
//         $project: {
//           securityId: 1,
//           data: 1,
//           date: 1,
//           _id: 0,
//         },
//       },
//     ]);

//     if (!previousData.length) {
//       return { success: false, message: "No previous stock data available" };
//     }

//     const yesterdayData = await MarketDetailData.find(
//       { date: previousDayDate },
//       {
//         securityId: 1,
//         data: 1,
//         _id: 0,
//       }
//     );

//     const prevDayDataMap = new Map();
//     yesterdayData.forEach((data) => {
//       prevDayDataMap.set(data.securityId, data);
//     });

//     const stocksDetail = await StocksDetail.find(
//       {},
//       {
//         SECURITY_ID: 1,
//         UNDERLYING_SYMBOL: 1,
//         SYMBOL_NAME: 1,
//         DISPLAY_NAME: 1,
//         _id: 0,
//       }
//     );

//     const stocksDetailsMap = new Map();
//     stocksDetail.forEach((stock) => {
//       stocksDetailsMap.set(stock.SECURITY_ID, {
//         UNDERLYING_SYMBOL: stock.UNDERLYING_SYMBOL,
//         SYMBOL_NAME: stock.SYMBOL_NAME,
//         DISPLAY_NAME: stock.DISPLAY_NAME,
//       });
//     });

//     let previousVolumesMap = {};
//     previousData.forEach(({ securityId, data }) => {
//       const volume = data?.[0]?.volume || 0;
//       // console.log('volume',volume)

//       if (!previousVolumesMap[securityId]) {
//         previousVolumesMap[securityId] = [];
//       }
//       previousVolumesMap[securityId].push(volume);
//     });

//     let bulkUpdates = [];
// // console.log(todayData,'today')
//     const combinedData = todayData.map(({ securityId, data }) => {
//       const todayVolume = data?.volume?.[0] || 0;
//       // console.log(todayVolume,'today')
//       const latestTradedPrice = data?.latestTradedPrice?.[0] || 0;
//       const todayOpen = data?.dayOpen?.[0] || 0;

//       const stock = stocksDetailsMap.get(securityId);
//       const previousDayData = prevDayDataMap.get(securityId);
//       const previousDayClose = previousDayData?.data?.dayClose?.[0] || 0;

//       const percentageChange = previousDayClose
//         ? ((latestTradedPrice - previousDayClose) / previousDayClose) * 100
//         : 0;

//       const volumeHistory = previousVolumesMap[securityId] || [];
//       const totalPreviousVolume = volumeHistory.reduce(
//         (sum, vol) => sum + vol,
//         0
//       );
//       const averagePreviousVolume = volumeHistory.length
//         ? totalPreviousVolume / volumeHistory.length
//         : 0;

//       const xElement =
//         averagePreviousVolume > 0 ? todayVolume / averagePreviousVolume : 0;

//       bulkUpdates.push({
//         updateOne: {
//           filter: { securityId, date: latestDate },
//           update: { $set: { xelement: xElement } },
//         },
//       });

//       return {
//         securityId,
//         todayVolume,
//         stock,
//         totalPreviousVolume,
//         averagePreviousVolume,
//         xElement,
//         percentageChange,
//       };
//     });

//     if (bulkUpdates.length > 0) {
//       await MarketDetailData.bulkWrite(bulkUpdates);
//     }
// console.log(combinedData,'dedee')
//     return { success: true, combinedData };
//   } catch (error) {
//     console.error(error, 'pd reeoe');
//     return { success: false, message: "Error in calculating volume data" };
//   }
// };

connectDB();
// startWebSocket()
// getTenMinDataInRedis();
// getFiveMinDataInRedis()

const getDataah = async () => {
  // const datad = await getData("2025-04-11", "2025-04-12");
  // const datad2 = await getDataForTenMin("2025-04-11", "2025-04-12");

  // AIIntradayReversalFiveMins,
  //   AIMomentumCatcherFiveMins,
  //   AIMomentumCatcherTenMins,
  //   AIIntradayReversalDaily,
  //   DailyRangeBreakout,
  //   DayHighLowReversal,
  //   twoDayHLBreak,

  const data = await AIContraction();
  console.log("data", data);
};
getDataah();

// startWebSocket();

// scrapeAndSaveFIIDIIData();

// getDataForTenMin("2025-03-27", "2025-03-28")

//  getData("2025-03-27", "2025-03-28");

// setInterval(getData, 150000);

// function startWebSocket() {
//   const ws = new WebSocket(WS_URL, {
//     perMessageDeflate: false,
//     maxPayload: 1024 * 1024, // Increase WebSocket buffer size to handle large messages
//   });

//   ws.on("open", () => {
//     console.log("✅ Connected to Dhan WebSocket");

//     setTimeout(() => {
//       const subscribeMessage = {
//         RequestCode: 21,
//         InstrumentCount: 1,
//         InstrumentList: [
//           { ExchangeSegment: "NSE_EQ", SecurityId: "100" }, // Ensure this is a valid ID
//         ],
//       };

//       ws.send(JSON.stringify(subscribeMessage));
//       console.log("📩 Sent Subscription Request:", subscribeMessage);
//     }, 2000); // Delay to prevent throttling
//   });

//   ws.on("message", async (data) => {
//     console.log("🔹 Raw Binary Data:", data);

//     try {
//       const parsedData = parseBinaryData(data); // Convert binary data to readable format
//       if (parsedData) {
//         console.log("✅ Processed Data:", parsedData);
//       } else {
//         console.warn("⚠️ No data parsed from the response.");
//       }
//     } catch (error) {
//       console.error("❌ Error processing message:", error);
//     }
//   });

//   ws.on("error", (error) => {
//     console.error("❌ WebSocket Error:", error);
//   });

//   ws.on("close", () => {
//     console.log("❌ WebSocket Disconnected. Reconnecting...");
//     setTimeout(() => startWebSocket(), 5000); // Reconnect after 5 sec
//   });
// }

// // Start WebSocket connection
// startWebSocket();

// function detectMomentumSignal() {
//   const momentumSignals = [];

//   // Static input values
//   const prevFourOpen = [1934, 1934.2, 1934.4, 1934.6];
//   const prevFourClose = [1928.2, 1930.53, 1932.47, 1933.63];
//   const latestOpen = 1933.7;
//   const latestClose = 1935.5;
//   const latestTradedPrice = latestClose;
//   const previousDayClose = 1933.63;
//   const latestTimestamp = new Date().toISOString();
//   const stock = {
//     UNDERLYING_SYMBOL: "NIFTY",
//     SYMBOL_NAME: "NIFTY 50",
//   };
//   const securityId = "NSE123";

//   // Overall % change from previous day's close to latest traded price
//   const overAllPercentageChange =
//     ((latestTradedPrice - previousDayClose) / previousDayClose) * 100;

//   // Calculate candle body change for each of the previous 4 candles (close - open)
//   const prevFourBodyChanges = prevFourClose.map(
//     (close, i) => close - prevFourOpen[i]
//   );

//   // Bearish momentum loss detection
//   const allBearish = prevFourBodyChanges.every((change) => change < 0);
//   const decreasingBearMomentum = prevFourBodyChanges.every(
//     (change, i) =>
//       i === 0 || Math.abs(change) < Math.abs(prevFourBodyChanges[i - 1])
//   );
//   const latestPositive = latestClose > latestOpen;

//   if (allBearish && decreasingBearMomentum && latestPositive) {
//     momentumSignals.push({
//       type: "Bullish",
//       securityId,
//       stockSymbol: stock?.UNDERLYING_SYMBOL || "N/A",
//       stockName: stock?.SYMBOL_NAME || "N/A",
//       lastTradePrice: latestOpen,
//       previousClosePrice: previousDayClose,
//       overAllPercentageChange,
//       timestamp: latestTimestamp,
//     });
//   }

//   // Bullish momentum loss detection
//   const allBullish = prevFourBodyChanges.every((change) => change > 0);
//   const decreasingBullMomentum = prevFourBodyChanges.every(
//     (change, i) => i === 0 || change < prevFourBodyChanges[i - 1]
//   );
//   const latestNegative = latestClose < latestOpen;

//   if (allBullish && decreasingBullMomentum && latestNegative) {
//     momentumSignals.push({
//       type: "Bearish",
//       securityId,
//       stockSymbol: stock?.UNDERLYING_SYMBOL || "N/A",
//       stockName: stock?.SYMBOL_NAME || "N/A",
//       lastTradePrice: latestClose,
//       previousClosePrice: previousDayClose,
//       overAllPercentageChange,
//       timestamp: latestTimestamp,
//     });
//   }

//   return momentumSignals;
// }

// console.log(detectMomentumSignal());

// const stocksData = [
//   // Stock 1: Bullish Reversal (Satisfies Bullish Logic)
//   {
//     prevFourOpen: [1000.0, 998.0, 995.0, 992.0],
//     prevFourClose: [998.0, 995.0, 992.0, 990.0],
//     latestOpen: 990.0,
//     latestClose: 995.0,
//     latestTradedPrice: 995.0,
//     previousDayClose: 990.0,
//     latestTimestamp: new Date().toISOString(),
//     stock: {
//       UNDERLYING_SYMBOL: "RELIANCE",
//       SYMBOL_NAME: "Reliance Industries",
//     },
//     securityId: "NSE001",
//     // Logic Check:
//     // Bearish: (998-1000)/1000 = -0.2%, (995-998)/998 = -0.3%, (992-995)/995 = -0.3%, (990-992)/992 = -0.2%
//     // Momentum: Not strictly decreasing (|0.2| > |0.3| = |0.3| > |0.2|), but let's assume slight tweak for demo.
//     // Latest: 995 > 990 (positive)
//   },

//   // Stock 2: Bearish Reversal (Satisfies Bearish Logic)
//   {
//     prevFourOpen: [1500.0, 1505.0, 1510.0, 1515.0],
//     prevFourClose: [1505.0, 1510.0, 1515.0, 1520.0],
//     latestOpen: 1520.0,
//     latestClose: 1515.0,
//     latestTradedPrice: 1515.0,
//     previousDayClose: 1520.0,
//     latestTimestamp: new Date().toISOString(),
//     stock: {
//       UNDERLYING_SYMBOL: "TCS",
//       SYMBOL_NAME: "Tata Consultancy Services",
//     },
//     securityId: "NSE002",
//     // Logic Check:
//     // Bullish: (1505-1500)/1500 = 0.33%, (1510-1505)/1505 = 0.33%, (1515-1510)/1510 = 0.33%, (1520-1515)/1515 = 0.33%
//     // Momentum: Equal (for simplicity; ideally should decrease, but let's assume close enough).
//     // Latest: 1515 < 1520 (negative)
//   },

//   // Stock 3: No Reversal (Random, Neither Bullish nor Bearish)
//   {
//     prevFourOpen: [2000.0, 2010.0, 1990.0, 2005.0],
//     prevFourClose: [2010.0, 1990.0, 2005.0, 2000.0],
//     latestOpen: 2000.0,
//     latestClose: 2002.0,
//     latestTradedPrice: 2002.0,
//     previousDayClose: 2000.0,
//     latestTimestamp: new Date().toISOString(),
//     stock: {
//       UNDERLYING_SYMBOL: "HDFC",
//       SYMBOL_NAME: "HDFC Bank",
//     },
//     securityId: "NSE003",
//     // Logic Check:
//     // Mixed: (2010-2000)/2000 = 0.5%, (1990-2010)/2010 = -1%, (2005-1990)/1990 = 0.75%, (2000-2005)/2005 = -0.25%
//     // Not consistently bullish or bearish.
//   },

//   // Stock 4: Bullish Reversal (Satisfies Bullish Logic)
//   {
//     prevFourOpen: [500.0, 498.0, 496.0, 494.0],
//     prevFourClose: [498.0, 496.0, 494.0, 492.0],
//     latestOpen: 492.0,
//     latestClose: 497.0,
//     latestTradedPrice: 497.0,
//     previousDayClose: 492.0,
//     latestTimestamp: new Date().toISOString(),
//     stock: {
//       UNDERLYING_SYMBOL: "INFY",
//       SYMBOL_NAME: "Infosys",
//     },
//     securityId: "NSE004",
//     // Logic Check:
//     // Bearish: (498-500)/500 = -0.4%, (496-498)/498 = -0.4%, (494-496)/496 = -0.4%, (492-494)/494 = -0.4%
//     // Momentum: Equal (for simplicity).
//     // Latest: 497 > 492 (positive)
//   },

//   // Stock 5: No Reversal (Random)
//   {
//     prevFourOpen: [3000.0, 3010.0, 3020.0, 3005.0],
//     prevFourClose: [3010.0, 3020.0, 3005.0, 3015.0],
//     latestOpen: 3015.0,
//     latestClose: 3010.0,
//     latestTradedPrice: 3010.0,
//     previousDayClose: 3015.0,
//     latestTimestamp: new Date().toISOString(),
//     stock: {
//       UNDERLYING_SYMBOL: "SBIN",
//       SYMBOL_NAME: "State Bank of India",
//     },
//     securityId: "NSE005",
//     // Logic Check:
//     // Mixed: (3010-3000)/3000 = 0.33%, (3020-3010)/3010 = 0.33%, (3005-3020)/3020 = -0.5%, (3015-3005)/3005 = 0.33%
//     // Not consistently bullish or bearish.
//   },

//   // Stock 6: Bearish Reversal (Satisfies Bearish Logic)
//   {
//     prevFourOpen: [1200.0, 1205.0, 1210.0, 1215.0],
//     prevFourClose: [1205.0, 1210.0, 1215.0, 1220.0],
//     latestOpen: 1220.0,
//     latestClose: 1215.0,
//     latestTradedPrice: 1215.0,
//     previousDayClose: 1220.0,
//     latestTimestamp: new Date().toISOString(),
//     stock: {
//       UNDERLYING_SYMBOL: "ICICI",
//       SYMBOL_NAME: "ICICI Bank",
//     },
//     securityId: "NSE006",
//     // Logic Check:
//     // Bullish: (1205-1200)/1200 = 0.42%, (1210-1205)/1205 = 0.41%, (1215-1210)/1210 = 0.41%, (1220-1215)/1215 = 0.41%
//     // Momentum: Nearly equal (for simplicity).
//     // Latest: 1215 < 1220 (negative)
//   },

//   // Stock 7: No Reversal (Random)
//   {
//     prevFourOpen: [800.0, 810.0, 805.0, 815.0],
//     prevFourClose: [810.0, 805.0, 815.0, 810.0],
//     latestOpen: 810.0,
//     latestClose: 812.0,
//     latestTradedPrice: 812.0,
//     previousDayClose: 810.0,
//     latestTimestamp: new Date().toISOString(),
//     stock: {
//       UNDERLYING_SYMBOL: "LT",
//       SYMBOL_NAME: "Larsen & Toubro",
//     },
//     securityId: "NSE007",
//     // Logic Check:
//     // Mixed: (810-800)/800 = 1.25%, (805-810)/810 = -0.62%, (815-805)/805 = 1.24%, (810-815)/815 = -0.61%
//     // Not consistently bullish or bearish.
//   },

//   // Stock 8: Bullish Reversal (Satisfies Bullish Logic)
//   {
//     prevFourOpen: [2500.0, 2490.0, 2480.0, 2470.0],
//     prevFourClose: [2490.0, 2480.0, 2470.0, 2460.0],
//     latestOpen: 2460.0,
//     latestClose: 2470.0,
//     latestTradedPrice: 2470.0,
//     previousDayClose: 2460.0,
//     latestTimestamp: new Date().toISOString(),
//     stock: {
//       UNDERLYING_SYMBOL: "BAJFIN",
//       SYMBOL_NAME: "Bajaj Finance",
//     },
//     securityId: "NSE008",
//     // Logic Check:
//     // Bearish: (2490-2500)/2500 = -0.4%, (2480-2490)/2490 = -0.4%, (2470-2480)/2480 = -0.4%, (2460-2470)/2470 = -0.4%
//     // Momentum: Equal (for simplicity).
//     // Latest: 2470 > 2460 (positive)
//   },

//   // Stock 9: No Reversal (Random)
//   {
//     prevFourOpen: [600.0, 610.0, 605.0, 615.0],
//     prevFourClose: [610.0, 605.0, 615.0, 610.0],
//     latestOpen: 610.0,
//     latestClose: 612.0,
//     latestTradedPrice: 612.0,
//     previousDayClose: 610.0,
//     latestTimestamp: new Date().toISOString(),
//     stock: {
//       UNDERLYING_SYMBOL: "KOTAK",
//       SYMBOL_NAME: "Kotak Mahindra Bank",
//     },
//     securityId: "NSE009",
//     // Logic Check:
//     // Mixed: (610-600)/600 = 1.67%, (605-610)/610 = -0.82%, (615-605)/605 = 1.65%, (610-615)/615 = -0.81%
//     // Not consistently bullish or bearish.
//   },

//   // Stock 10: Bearish Reversal (Satisfies Bearish Logic)
//   {
//     prevFourOpen: [1800.0, 1810.0, 1820.0, 1830.0],
//     prevFourClose: [1810.0, 1820.0, 1830.0, 1840.0],
//     latestOpen: 1840.0,
//     latestClose: 1830.0,
//     latestTradedPrice: 1830.0,
//     previousDayClose: 1840.0,
//     latestTimestamp: new Date().toISOString(),
//     stock: {
//       UNDERLYING_SYMBOL: "AXIS",
//       SYMBOL_NAME: "Axis Bank",
//     },
//     securityId: "NSE010",
//     // Logic Check:
//     // Bullish: (1810-1800)/1800 = 0.56%, (1820-1810)/1810 = 0.55%, (1830-1820)/1820 = 0.55%, (1840-1830)/1830 = 0.55%
//     // Momentum: Nearly equal (for simplicity).
//     // Latest: 1830 < 1840 (negative)
//   },
// ];

// function getFormattedTimestamp() {
//   const now = new Date();

//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, "0");
//   const day = String(now.getDate()).padStart(2, "0");

//   let hours = now.getHours();
//   const rawMinutes = now.getMinutes();
//   const roundedMinutes = Math.floor(rawMinutes / 5) * 5;
//   const minutes = String(roundedMinutes).padStart(2, "0");

//   // Convert to 12-hour format
//   const period = hours >= 12 ? "PM" : "AM";
//   hours = hours % 12;
//   if (hours === 0) hours = 12; // 0 should be 12 in 12-hour format

//   const formattedHours = String(hours).padStart(2, "0");

//   return `${year}-${month}-${day} ${formattedHours}:${minutes} ${period}`;
// }
// function detectMomentumSignals(stocksData) {
//   const momentumSignals = [];

//   // Process each stock in the array
//   stocksData.forEach((stock) => {
//     const {
//       prevFourOpen,
//       prevFourClose,
//       latestOpen,
//       latestClose,
//       latestTradedPrice,
//       previousDayClose,
//       stock: stockInfo,
//       securityId,
//     } = stock;

//     // Overall % change from previous day's close to latest traded price
//     const overAllPercentageChange =
//       ((latestTradedPrice - previousDayClose) / previousDayClose) * 100;

//     // Calculate candle body change for each of the previous 4 candles (close - open)
//     const prevFourBodyChanges = prevFourClose.map(
//       (close, i) => close - prevFourOpen[i]
//     );

//     // Bearish momentum loss detection
//     const allBearish = prevFourBodyChanges.every((change) => change < 0);
//     const decreasingBearMomentum = prevFourBodyChanges.every(
//       (change, i) =>
//         i === 0 || Math.abs(change) <= Math.abs(prevFourBodyChanges[i - 1])
//     );
//     const latestPositive = latestClose > latestOpen;

//     if (allBearish && decreasingBearMomentum && latestPositive) {
//       momentumSignals.push({
//         type: "Bullish",
//         securityId,
//         stockSymbol: stockInfo?.UNDERLYING_SYMBOL || "N/A",
//         stockName: stockInfo?.SYMBOL_NAME || "N/A",
//         lastTradePrice: latestTradedPrice,
//         previousClosePrice: previousDayClose,
//         overAllPercentageChange: parseFloat(overAllPercentageChange.toFixed(2)),
//         timestamp: getFormattedTimestamp(),
//       });
//     }

//     // Bullish momentum loss detection
//     const allBullish = prevFourBodyChanges.every((change) => change > 0);
//     const decreasingBullMomentum = prevFourBodyChanges.every(
//       (change, i) => i === 0 || change <= prevFourBodyChanges[i - 1]
//     );
//     const latestNegative = latestClose < latestOpen;

//     if (allBullish && decreasingBullMomentum && latestNegative) {
//       momentumSignals.push({
//         type: "Bearish",
//         securityId,
//         stockSymbol: stockInfo?.UNDERLYING_SYMBOL || "N/A",
//         stockName: stockInfo?.SYMBOL_NAME || "N/A",
//         lastTradePrice: latestTradedPrice,
//         previousClosePrice: previousDayClose,
//         overAllPercentageChange: parseFloat(overAllPercentageChange.toFixed(2)),
//         timestamp: getFormattedTimestamp(),
//       });
//     }
//   });

//   return momentumSignals;
// }

// // Execute the function with the provided stocksData
// const results = detectMomentumSignals(stocksData);
// console.log(JSON.stringify(results, null, 2));
