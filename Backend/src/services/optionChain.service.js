
import MarketHoliday from '../models/holidays.model.js';
import {
  fetchExpiryDates,
  fetchOptionChainData,
  saveOptionChainData
} from '../repositories/optionChain.repository.js';
import { isMarketOpen } from '../utils/marketUtils.js';
import { convertToIST, delay } from '../utils/dateUtils.js';
import config from '../config/optionChain.config.js';


export async function fetchAndSaveAllUnderlyings() {
  const today = new Date();
  if (await isTradingHoliday(today)) {
    console.log('Market is closed today (holiday)');
    return { status: 'skipped', reason: 'market_holiday' };
  }
  
  if (!isMarketOpen()) {
    console.log('Market is currently closed');
    return { status: 'skipped', reason: 'market_closed' };
  }

  console.log(`Fetching option chain data at ${convertToIST(Date.now())}`);
  
  const results = [];
  for (const { name, scrip, seg, stepSize } of config.underlyings) {
    try {
      const expiries = await fetchExpiryDates(scrip, seg, name);
      if (!expiries.length) {
        console.log(`No valid expiries found for ${name}`);
        continue;
      }

      for (const expiry of expiries) {
        const data = await fetchOptionChainData(scrip, seg, expiry, stepSize, name);
        if (data) {
          await saveOptionChainData(name, scrip, seg, expiry, data);
          results.push({ underlying: name, expiry, status: 'success' });
        }
        await delay(100);
      }
    } catch (error) {
      console.error(`Error processing ${name}: ${error.message}`);
      results.push({ underlying: name, status: 'error', error: error.message });
    }
  }

  return results;
}

async function isTradingHoliday(date) {
  try {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const holiday = await MarketHoliday.findOne({
      date: { $gte: startOfDay, $lt: endOfDay },
      closed_exchanges: 'NSE',
    });
    return !!holiday;
  } catch (error) {
    return false;
  }
}