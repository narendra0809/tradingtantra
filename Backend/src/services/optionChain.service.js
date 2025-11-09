import MarketHoliday from "../models/holidays.model.js";
import {
  fetchExpiryDates,
  fetchOptionChainData,
  saveOptionChainData,
} from "../repositories/optionChain.repository.js";
// import { isMarketOpen } from "../utils/marketUtils.js";
import { convertToIST, delay } from "../utils/dateUtils.js";
import config from "../config/optionChain.config.js";
import {
  NiftyOptionChain,
  BankNiftyOptionChain,
  FinniftyOptionChain,
  MidcpNiftyOptionChain,
  SensexOptionChain,
} from "../models/optionChain.model.js";
import optionChainJob from "../jobs/optionChain.job.js";

// Map of underlying names to their respective models
const modelMap = {
  NIFTY: NiftyOptionChain,
  BANKNIFTY: BankNiftyOptionChain,
  FINNIFTY: FinniftyOptionChain,
  MIDCPNIFTY: MidcpNiftyOptionChain,
  SENSEX: SensexOptionChain,
};

// Function to delete old or expired data
async function deleteOldOrExpiredData() {
  try {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    for (const underlyingName of Object.keys(modelMap)) {
      const Model = modelMap[underlyingName];
      const result = await Model.deleteMany({
        expiry: { $lte: startOfToday.toISOString().split("T")[0] },
      });

      console.log(`Deleted ${result.deletedCount} old/expired records for ${underlyingName}`);
    }
  } catch (error) {
    console.error(`Error deleting old/expired data: ${error.message}`);
  }
}
async function isMarketOpen() {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const day = ist.getDay();
  const currentTime = hours * 60 + minutes;
  const startTime = 9 * 60 + 16;  // 9:15 AM
  const endTime = 15 * 60 + 33;   // 3:30 PM
  return day >= 1 && day <= 5 && currentTime >= startTime && currentTime <= endTime;
}
// Main function to fetch and save option chain data for all underlyings
export async function fetchAndSaveAllUnderlyings(flag) {
  const today = new Date();
  if (!flag) {
    await deleteOldOrExpiredData();
    optionChainJob.setFlag();
  }
  if (await isTradingHoliday(today)) {
    console.log("Market is closed today (holiday)");
    return { status: "skipped", reason: "market_holiday" };
  }

  if (!isMarketOpen()) {
    console.log("Market is currently closed");
    return { status: "skipped", reason: "market_closed" };
  }

  console.log(`Fetching option chain data at ${convertToIST(Date.now())}`);

  const results = [];
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
