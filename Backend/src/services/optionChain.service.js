import MarketHoliday from "../models/holidays.model.js";
import {
  fetchExpiryDates,
  fetchOptionChainData,
  saveOptionChainData,
} from "../repositories/optionChain.repository.js";
import { isMarketOpen } from "../utils/marketUtils.js";
import { convertToIST, delay } from "../utils/dateUtils.js";
import config from "../config/optionChain.config.js";
import { NiftyOptionChain, BankNiftyOptionChain, FinniftyOptionChain, MidcpNiftyOptionChain, SensexOptionChain } from "../models/optionChain.model.js";

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
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    for (const underlyingName of Object.keys(modelMap)) {
      const Model = modelMap[underlyingName];
      // Delete data where expiry date is before today or fetchDate is before today
      await Model.deleteMany({
        $or: [
          { expiry: { $lt: startOfToday.toISOString().split("T")[0] } }, // Expired data
          { fetchDate: { $lt: startOfToday } }, // Old fetchDate data
        ],
      });
      console.log(`Deleted old/expired data for ${underlyingName}`);
    }
  } catch (error) {
    console.error(`Error deleting old/expired data: ${error.message}`);
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
    console.log("Market is currently closed");
    return { status: "skipped", reason: "market_closed" };
  }

  // Delete old or expired data before fetching new data
  await deleteOldOrExpiredData();

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