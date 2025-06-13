// import MarketHoliday from "../models/holidays.model.js";
// import {
//   fetchExpiryDates,
//   fetchOptionChainData,
//   saveOptionChainData,
// } from "../repositories/optionChain.repository.js";
// import { isMarketOpen } from "../utils/marketUtils.js";
// import { convertToIST, delay } from "../utils/dateUtils.js";
// import config from "../config/optionChain.config.js";
// import { NiftyOptionChain, BankNiftyOptionChain, FinniftyOptionChain, MidcpNiftyOptionChain, SensexOptionChain } from "../models/optionChain.model.js";

// // Map of underlying names to their respective models
// const modelMap = {
//   NIFTY: NiftyOptionChain,
//   BANKNIFTY: BankNiftyOptionChain,
//   FINNIFTY: FinniftyOptionChain,
//   MIDCPNIFTY: MidcpNiftyOptionChain,
//   SENSEX: SensexOptionChain,
// };

// // Function to delete old or expired data
// async function deleteOldOrExpiredData() {
//   try {
//     const today = new Date();
//     const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

//     for (const underlyingName of Object.keys(modelMap)) {
//       const Model = modelMap[underlyingName];
//       // Delete data where expiry date is before today or fetchDate is before today
//       await Model.deleteMany({
//         $or: [
//           { expiry: { $lt: startOfToday.toISOString().split("T")[0] } }, // Expired data
//           { fetchDate: { $lt: startOfToday } }, // Old fetchDate data
//         ],
//       });
//       console.log(`Deleted old/expired data for ${underlyingName}`);
//     }
//   } catch (error) {
//     console.error(`Error deleting old/expired data: ${error.message}`);
//   }
// }

// // Main function to fetch and save option chain data for all underlyings
// export async function fetchAndSaveAllUnderlyings() {
//   const today = new Date();
//   if (await isTradingHoliday(today)) {
//     console.log("Market is closed today (holiday)");
//     return { status: "skipped", reason: "market_holiday" };
//   }

//   if (!isMarketOpen()) {
//     console.log("Market is currently closed");
//     return { status: "skipped", reason: "market_closed" };
//   }

//   // Delete old or expired data before fetching new data
//   await deleteOldOrExpiredData();

//   console.log(`Fetching option chain data at ${convertToIST(Date.now())}`);

//   const results = [];
//   for (const { name, scrip, seg, stepSize } of config.underlyings) {
//     try {
//       const expiries = await fetchExpiryDates(scrip, seg, name);
//       if (!expiries || expiries.length === 0) {
//         console.log(`No valid expiries found for ${name}`);
//         continue;
//       }

//       for (const expiry of expiries) {
//         const data = await fetchOptionChainData(
//           scrip,
//           seg,
//           expiry,
//           stepSize,
//           name
//         );
//         if (data) {
//           // Set fetchDate to today's date
//           data.fetchDate = new Date().toISOString().split("T")[0];
//           await saveOptionChainData(name, scrip, seg, expiry, data);
//           results.push({ underlying: name, expiry, status: "success" });
//         }
//         await delay(100);
//       }
//     } catch (error) {
//       console.error(`Error processing ${name}: ${error.message}`);
//       results.push({ underlying: name, status: "error", error: error.message });
//     }
//   }

//   return results;
// }

// // Function to check if today is a trading holiday
// async function isTradingHoliday(date) {
//   try {
//     const startOfDay = new Date(
//       date.getFullYear(),
//       date.getMonth(),
//       date.getDate()
//     );
//     const endOfDay = new Date(startOfDay);
//     endOfDay.setDate(endOfDay.getDate() + 1);
//     const holiday = await MarketHoliday.findOne({
//       date: { $gte: startOfDay, $lt: endOfDay },
//       closed_exchanges: "NSE",
//     });
//     return !!holiday;
//   } catch (error) {
//     console.error(`Error checking holiday: ${error.message}`);
//     return false;
//   }
// }

import MarketHoliday from "../models/holidays.model.js";
import {
  fetchExpiryDates,
  fetchOptionChainData,
  saveOptionChainData,
} from "../repositories/optionChain.repository.js";
import { isMarketOpen } from "../utils/marketUtils.js";
import { convertToIST, delay } from "../utils/dateUtils.js";
import config from "../config/optionChain.config.js";
import {
  NiftyOptionChain,
  BankNiftyOptionChain,
  FinniftyOptionChain,
  MidcpNiftyOptionChain,
  SensexOptionChain,
} from "../models/optionChain.model.js";

// Map of underlying names to their respective models
const modelMap = {
  NIFTY: NiftyOptionChain,
  BANKNIFTY: BankNiftyOptionChain,
  FINNIFTY: FinniftyOptionChain,
  MIDCPNIFTY: MidcpNiftyOptionChain,
  SENSEX: SensexOptionChain,
};

// Function to delete only data with expiry dates before today
async function deleteOldOrExpiredData() {
  try {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfTodayString = startOfToday.toISOString().split("T")[0];

    for (const underlyingName of Object.keys(modelMap)) {
      const Model = modelMap[underlyingName];
      // Delete only data where expiry is before today
      const result = await Model.deleteMany({
        $or: [
          { expiry: { $lt: startOfTodayString } }, // String comparison (e.g., "2025-06-12" < "2025-06-13")
          { expiry: { $lt: startOfToday } }, // Date comparison (in case expiry is a Date object)
        ],
      });
      console.log(
        `Deleted ${result.deletedCount} documents with expiry before ${startOfTodayString} for ${underlyingName}`
      );

      // Log a sample of remaining documents to verify
      const remaining = await Model.find({})
        .limit(5)
        .select("expiry fetchDate");
    }
  } catch (error) {
    console.error(`Error deleting expired data: ${error.message}`);
    throw error; // Rethrow to ensure cron job failure is noticed
  }
}

// Main function to fetch and save option chain data for all underlyings
export async function fetchAndSaveAllUnderlyings() {
  const today = new Date();
  if (await isTradingHoliday(today)) {
    console.log("Market is closed today (holiday)");
    return { status: "skipped", reason: "market_holiday" };
  }

  if (!isMarketOpen()) {
    console.log("Market is closed, running deletion of expired data");
    return { status: "skipped", reason: "market_closed" };
  }

  console.log(`Fetching option chain data at ${convertToIST(Date.now())}`);

  const results = [];
  // Delete expired data before fetching new data
  await deleteOldOrExpiredData();

  for (const { name, scrip, seg, stepSize } of config.underlyings) {
    try {
      const expiries = await fetchExpiryDates(scrip, seg, name);
      if (!expiries || expiries.length === 0) {
        console.log(`No valid expiries found for ${name}`);
        continue;
      }

      for (const expiry of expiries) {
        const data = await fetchOptionChainData(
          scrip,
          seg,
          expiry,
          stepSize,
          name
        );
        if (data) {
          // Set fetchDate to today's date
          data.fetchDate = new Date().toISOString().split("T")[0];
          await saveOptionChainData(name, scrip, seg, expiry, data);
          results.push({ underlying: name, expiry, status: "success" });
        }
        await delay(100);
      }
    } catch (error) {
      console.error(`Error processing ${name}: ${error.message}`);
      results.push({ underlying: name, status: "error", error: error.message });
    }
  }

  return results;
}

// Function to check if today is a trading holiday
async function isTradingHoliday(date) {
  try {
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const holiday = await MarketHoliday.findOne({
      date: { $gte: startOfDay, $lt: endOfDay },
      closed_exchanges: "NSE",
    });
    return !!holiday;
  } catch (error) {
    console.error(`Error checking holiday: ${error.message}`);
    return false;
  }
}
