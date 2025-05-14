import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import mongoose from 'mongoose';
import MarketHoliday from './src/models/holidays.model.js';

const optionChainSchema = new mongoose.Schema({
  underlyingName: { type: String, required: true },
  underlyingScrip: { type: Number, required: true },
  underlyingSeg: { type: String, required: true },
  expiry: { type: String, required: true },
  fetchDate: { type: Date, required: true },
  timestamp: { type: String, required: true },
  lastPrice: { type: Number, required: true },
  strikeData: [
    {
      strikePrice: { type: Number, required: true },
      optionType: { type: String, enum: ['CE', 'PE'], required: true },
      impliedVolatility: Number,
      lastPrice: Number,
      oi: Number,
      previousClosePrice: Number,
      previousOi: Number,
      previousVolume: Number,
      volume: Number,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

optionChainSchema.index({ underlyingName: 1, timestamp: 1, expiry: 1, fetchDate: 1 }, { unique: true });

const NiftyOptionChain = mongoose.model('NiftyOptionChain', optionChainSchema);
const BankNiftyOptionChain = mongoose.model('BankNiftyOptionChain', optionChainSchema);
const FinniftyOptionChain = mongoose.model('FinniftyOptionChain', optionChainSchema);
const MidcpNiftyOptionChain = mongoose.model('MidcpNiftyOptionChain', optionChainSchema);

const modelMap = {
  NIFTY: NiftyOptionChain,
  BANKNIFTY: BankNiftyOptionChain,
  FINNIFTY: FinniftyOptionChain,
  MIDCPNIFTY: MidcpNiftyOptionChain,
};

const config = {
  optionChainUrl: 'https://api.dhan.co/v2/optionchain',
  expiryListUrl: 'https://api.dhan.co/v2/optionchain/expirylist',
  accessToken: process.env.DHAN_ACCESS_TOKEN,
  clientId: process.env.DHAN_CLIENT_ID,
  underlyings: [
    { name: 'NIFTY', scrip: 13, seg: 'IDX_I', stepSize: 50 },
    { name: 'BANKNIFTY', scrip: 25, seg: 'IDX_I', stepSize: 100 },
    { name: 'FINNIFTY', scrip: 27, seg: 'IDX_I', stepSize: 50 },
    { name: 'MIDCPNIFTY', scrip: 442, seg: 'IDX_I', stepSize: 75 },
  ],
};

function convertToIST(unixTimestamp) {
  const date = new Date(unixTimestamp);
  const minutes = date.getMinutes();
  const roundedMinutes = Math.floor(minutes / 3) * 3;
  date.setMinutes(roundedMinutes);
  date.setSeconds(0);
  date.setMilliseconds(0);
  const formatted = date.toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  }).replace(/,/, ', ');
  return formatted;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    return false; // Assume not a holiday if query fails
  }
}

function isMarketOpen() {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const day = ist.getDay(); // 0 (Sunday) to 6 (Saturday)
  const currentTime = hours * 60 + minutes;
  const startTime = 9 * 60 + 15; // 9:15 AM
  const endTime = 15 * 60 + 30; // 3:30 PM
  const isTradingDay = day >= 1 && day <= 5; // Monday to Friday
  const isWithinMarketHours = currentTime >= startTime && currentTime <= endTime;
  return isTradingDay && isWithinMarketHours;
}

function getNSEExpiries(underlyingName, currentDate) {
  const expiries = [];
  const date = new Date(currentDate);
  if (underlyingName === 'NIFTY') {
    // Weekly expiry: Next Thursday
    const nextThursday = new Date(date);
    nextThursday.setDate(date.getDate() + ((4 + 7 - date.getDay()) % 7 || 7));
    expiries.push(nextThursday.toISOString().split('T')[0]);
    // Monthly expiry: Last Thursday of current month
    const lastThursdayThisMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    while (lastThursdayThisMonth.getDay() !== 4) {
      lastThursdayThisMonth.setDate(lastThursdayThisMonth.getDate() - 1);
    }
    expiries.push(lastThursdayThisMonth.toISOString().split('T')[0]);
  } else {
    // Monthly expiries: Last Thursday of current and next month
    const lastThursdayThisMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    while (lastThursdayThisMonth.getDay() !== 4) {
      lastThursdayThisMonth.setDate(lastThursdayThisMonth.getDate() - 1);
    }
    expiries.push(lastThursdayThisMonth.toISOString().split('T')[0]);
    const lastThursdayNextMonth = new Date(date.getFullYear(), date.getMonth() + 2, 0);
    while (lastThursdayNextMonth.getDay() !== 4) {
      lastThursdayNextMonth.setDate(lastThursdayNextMonth.getDate() - 1);
    }
    expiries.push(lastThursdayNextMonth.toISOString().split('T')[0]);
  }
  return expiries;
}

async function fetchExpiryDates(underlyingScrip, underlyingSeg, underlyingName) {
  try {
    const response = await axios.post(
      config.expiryListUrl,
      { UnderlyingScrip: underlyingScrip, UnderlyingSeg: underlyingSeg },
      {
        headers: {
          'access-token': config.accessToken,
          'client-id': config.clientId,
          'Content-Type': 'application/json',
        },
      }
    );
    const { data } = response.data;
    // console.log(`Expiry dates for ${underlyingName} (${underlyingScrip}:${underlyingSeg}):`, data); // Debug
    if (!data || !Array.isArray(data)) {
      console.log(`No expiry dates for ${underlyingName}`); // Debug
      return [];
    }
    const today = new Date();
    const futureExpiries = data
      .map((date) => new Date(date))
      .filter((date) => date >= today)
      .sort((a, b) => a - b)
      .map((date) => date.toISOString().split('T')[0]);
    const targetExpiries = getNSEExpiries(underlyingName, today);
    const selectedExpiries = futureExpiries.filter((expiry) => targetExpiries.includes(expiry));
    console.log(`Selected expiries for ${underlyingName}:`, selectedExpiries); // Debug
    if (selectedExpiries.length < (underlyingName === 'NIFTY' ? 2 : 2)) {
      if (underlyingName === 'NIFTY') {
        // Select next weekly and current monthly
        const weekly = futureExpiries.find((exp) => new Date(exp) <= new Date(today.getFullYear(), today.getMonth() + 1, 0));
        const monthly = futureExpiries.find((exp) => exp === '2025-05-29' || exp === '2025-06-26');
        const fallback = [weekly, monthly].filter(Boolean).slice(0, 2);
        // console.log(`Fallback expiries for NIFTY:`, fallback); // Debug
        return fallback;
      } else {
        // Select two monthly expiries
        const fallback = futureExpiries.filter((exp) => ['2025-05-29', '2025-06-26'].includes(exp)).slice(0, 2);
        // console.log(`Fallback expiries for ${underlyingName}:`, fallback); // Debug
        return fallback;
      }
    }
    return selectedExpiries.slice(0, 2);
  } catch (error) {
    console.log(`Error fetching expiry dates for ${underlyingName}: ${error.message}`); // Debug
    return [];
  }
}

function generateStrikePrices(lastPrice, stepSize) {
  const roundedPrice = Math.round(lastPrice / stepSize) * stepSize;
  const strikePrices = [];
  // 10 above, 10 below, 1 ATM (21 unique strikes)
  for (let i = -10; i <= 10; i++) {
    const strike = roundedPrice + i * stepSize;
    strikePrices.push(strike);
  }
  return {
    roundedPrice,
    strikePrices: strikePrices.sort((a, b) => a - b),
  };
}

async function fetchOptionChainData(underlyingScrip, underlyingSeg, expiry, stepSize, underlyingName, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        config.optionChainUrl,
        { UnderlyingScrip: underlyingScrip, UnderlyingSeg: underlyingSeg, Expiry: expiry },
        {
          headers: {
            'access-token': config.accessToken,
            'client-id': config.clientId,
            'Content-Type': 'application/json',
          },
        }
      );
      const { data } = response.data;
      if (!data || !data.last_price || !data.oc) {
        return null;
      }
      const { strikePrices } = generateStrikePrices(data.last_price, stepSize);
      const strikeData = strikePrices.flatMap((strikePrice) => {
        const strikeStr = strikePrice.toFixed(6);
        const ceData = data.oc[strikeStr]?.ce || {};
        const peData = data.oc[strikeStr]?.pe || {};
        return [
          {
            strikePrice,
            optionType: 'CE',
            impliedVolatility: ceData.implied_volatility || 0,
            lastPrice: ceData.last_price || 0,
            oi: ceData.oi || 0,
            previousClosePrice: ceData.previous_close_price || 0,
            previousOi: ceData.previous_oi || 0,
            previousVolume: ceData.previous_volume || 0,
            volume: ceData.volume || 0,
          },
          {
            strikePrice,
            optionType: 'PE',
            impliedVolatility: peData.implied_volatility || 0,
            lastPrice: peData.last_price || 0,
            oi: peData.oi || 0,
            previousClosePrice: peData.previous_close_price || 0,
            previousOi: peData.previous_oi || 0,
            previousVolume: peData.previous_volume || 0,
            volume: peData.volume || 0,
          },
        ];
      });
      return { lastPrice: data.last_price, strikeData };
    } catch (error) {
      if (error.response && error.response.status === 429 && attempt < retries) {
        const backoff = Math.pow(2, attempt) * 5000; // 5s, 10s, 20s
        await delay(backoff);
        continue;
      }
      console.error(`Error fetching option chain for ${underlyingName} (${underlyingScrip}:${underlyingSeg}), expiry ${expiry}: ${error.message}`);
      return null;
    }
  }
  return null;
}

async function saveOptionChainData(underlyingName, underlyingScrip, underlyingSeg, expiry, data) {
  if (!data) return;
  try {
    const Model = modelMap[underlyingName];
    if (!Model) {
      return;
    }
    const timestamp = convertToIST(Date.now());
    const fetchDate = new Date().toISOString().split('T')[0];
    await Model.findOneAndUpdate(
      { underlyingName, timestamp, expiry, fetchDate },
      {
        $set: {
          underlyingName,
          underlyingScrip,
          underlyingSeg,
          expiry,
          fetchDate,
          timestamp,
          lastPrice: data.lastPrice,
          strikeData: data.strikeData,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );
    console.log(`Option chain data saved for ${underlyingName}, expiry ${expiry} at ${timestamp}`);
  } catch (error) {
    console.error(`Failed to save option chain data for ${underlyingName}: ${error.message}`);
  }
}

async function fetchAndSaveAllUnderlyings() {
  const today = new Date();
  if (await isTradingHoliday(today)) {
    return;
  }
  if (!isMarketOpen()) {
    return;
  }
  console.log(`Market is open, fetching option chain data at ${convertToIST(today)}`);
  for (const { name, scrip, seg, stepSize } of config.underlyings) {
    const expiries = await fetchExpiryDates(scrip, seg, name);
    if (!expiries.length) {
      continue;
    }
    for (const expiry of expiries) {
      const data = await fetchOptionChainData(scrip, seg, expiry, stepSize, name);
      if (data) {
        await saveOptionChainData(name, scrip, seg, expiry, data);
      }
      await delay(6000); // Increased to avoid 429 errors
    }
  }
}

export {
  optionChainSchema,
  NiftyOptionChain,
  BankNiftyOptionChain,
  FinniftyOptionChain,
  MidcpNiftyOptionChain,
  MarketHoliday,
  fetchAndSaveAllUnderlyings,
  isTradingHoliday,
  convertToIST,
};