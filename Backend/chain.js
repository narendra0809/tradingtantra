import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import mongoose from 'mongoose';
import  MarketHoliday  from './src/models/holidays.model.js'; // Import MarketHoliday model

// MongoDB Schema for Option Chain
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
      greeks: {
        delta: Number,
        theta: Number,
        gamma: Number,
        vega: Number,
      },
      impliedVolatility: Number,
      lastPrice: Number,
      oi: Number,
      previousClosePrice: Number,
      previousOi: Number,
      previousVolume: Number,
      topAskPrice: Number,
      topAskQuantity: Number,
      topBidPrice: Number,
      topBidQuantity: Number,
      volume: Number,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// Create unique index for option chain data
optionChainSchema.index({ underlyingName: 1, timestamp: 1, expiry: 1 }, { unique: true });

// Define models
const NiftyOptionChain = mongoose.model('NiftyOptionChain', optionChainSchema);
const BankNiftyOptionChain = mongoose.model('BankNiftyOptionChain', optionChainSchema);
const FinniftyOptionChain = mongoose.model('FinniftyOptionChain', optionChainSchema);
const MidcpNiftyOptionChain = mongoose.model('MidcpNiftyOptionChain', optionChainSchema);

// Map underlying names to models
const modelMap = {
  NIFTY: NiftyOptionChain,
  BANKNIFTY: BankNiftyOptionChain,
  FINNIFTY: FinniftyOptionChain,
  MIDCPNIFTY: MidcpNiftyOptionChain,
};

// Configuration
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

// Convert timestamp to MM/DD/YYYY, hh:mm:ss am/pm
function convertToIST(unixTimestamp) {
  const date = new Date(unixTimestamp);
  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  }).replace(/,/, ', ');
}

// Delay function to pause execution
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Check if current date is a trading holiday
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
    console.error(`Error checking trading holiday: ${error.message}`);
    return false;
  }
}

// Calculate NSE Expiry Dates Dynamically
function getNSEExpiries(underlyingName, currentDate) {
  const expiries = [];
  const date = new Date(currentDate);

  if (underlyingName === 'NIFTY') {
    const nextThursday = new Date(date);
    nextThursday.setDate(date.getDate() + ((4 + 7 - date.getDay()) % 7 || 7));
    expiries.push(nextThursday.toISOString().split('T')[0]);
    const lastThursday = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    while (lastThursday.getDay() !== 4) {
      lastThursday.setDate(lastThursday.getDate() - 1);
    }
    expiries.push(lastThursday.toISOString().split('T')[0]);
  } else {
    for (let i = 0; i < 2; i++) {
      const lastThursday = new Date(date.getFullYear(), date.getMonth() + i + 1, 0);
      while (lastThursday.getDay() !== 4) {
        lastThursday.setDate(lastThursday.getDate() - 1);
      }
      expiries.push(lastThursday.toISOString().split('T')[0]);
    }
  }

  return expiries;
}

// Fetch Expiry Dates from Dhan API
async function fetchExpiryDates(underlyingScrip, underlyingSeg, underlyingName) {
  try {
    const response = await axios.post(
      config.expiryListUrl,
      {
        UnderlyingScrip: underlyingScrip,
        UnderlyingSeg: underlyingSeg,
      },
      {
        headers: {
          'access-token': config.accessToken,
          'client-id': config.clientId,
          'Content-Type': 'application/json',
        },
      }
    );

    const { data } = response.data;
    if (!data || !Array.isArray(data)) {
      console.error(`No expiry dates received for ${underlyingScrip}:${underlyingSeg}`);
      return [];
    }

    const today = new Date();
    const futureExpiries = data
      .map((date) => new Date(date))
      .filter((date) => date >= today)
      .sort((a, b) => a - b)
      .map((date) => date.toISOString().split('T')[0]);

    const targetExpiries = getNSEExpiries(underlyingName, today);
    const selectedExpiries = futureExpiries.filter((expiry) =>
      targetExpiries.includes(expiry)
    );

    if (selectedExpiries.length === 0) {
      console.warn(`No matching expiry dates found for ${underlyingName}. Available expiries: ${futureExpiries.join(', ')}`);
      return futureExpiries.slice(0, underlyingName === 'NIFTY' ? 2 : 2);
    }

    return selectedExpiries;
  } catch (error) {
    console.error(`Error fetching expiry dates for ${underlyingScrip}:${underlyingSeg}: ${error.message}`);
    return [];
  }
}

// Generate Rounded Strike Prices
function generateStrikePrices(lastPrice, stepSize) {
  const roundedPrice = Math.round(lastPrice / 100) * 100;
  const strikePrices = [];
  for (let i = -10; i <= 10; i++) {
    const strike = roundedPrice + i * stepSize;
    strikePrices.push(strike);
  }
  return {
    roundedPrice,
    strikePrices: strikePrices.sort((a, b) => a - b),
  };
}

// Fetch Option Chain Data with Retry for 429 Errors
async function fetchOptionChainData(underlyingScrip, underlyingSeg, expiry, stepSize, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        config.optionChainUrl,
        {
          UnderlyingScrip: underlyingScrip,
          UnderlyingSeg: underlyingSeg,
          Expiry: expiry,
        },
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
        console.error(`Invalid option chain data for ${underlyingScrip}:${underlyingSeg}`);
        return null;
      }

      const { strikePrices } = generateStrikePrices(data.last_price, stepSize);

      const strikeData = Object.keys(data.oc)
        .filter((strike) => strikePrices.includes(parseFloat(strike)))
        .flatMap((strike) => {
          const strikePrice = parseFloat(strike);
          const ceData = data.oc[strike].ce || {};
          const peData = data.oc[strike].pe || {};
          return [
            {
              strikePrice,
              optionType: 'CE',
              impliedVolatility: ceData.implied_volatility,
              lastPrice: ceData.last_price,
              oi: ceData.oi,
              previousClosePrice: ceData.previous_close_price,
              previousOi: ceData.previous_oi,
              previousVolume: ceData.previous_volume,
              volume: ceData.volume,
            },
            {
              strikePrice,
              optionType: 'PE',
              impliedVolatility: peData.implied_volatility,
              lastPrice: peData.last_price,
              oi: peData.oi,
              previousClosePrice: peData.previous_close_price,
              previousOi: ceData.previous_oi,
              previousVolume: ceData.previous_volume,
              volume: ceData.volume,
            },
          ];
        });

      return {
        lastPrice: data.last_price,
        strikeData,
      };
    } catch (error) {
      if (error.response && error.response.status === 429 && attempt < retries) {
        // console.warn(`Rate limit hit for ${underlyingScrip}:${underlyingSeg}, retrying (${attempt}/${retries}) after 5 seconds...`);
        await delay(5000);
        continue;
      }
      console.error(`Error fetching option chain data for ${underlyingScrip}:${underlyingSeg}: ${error.message}`);
      return null;
    }
  }
  return null;
}

// Save or Update Option Chain Data in MongoDB
async function saveOptionChainData(underlyingName, underlyingScrip, underlyingSeg, expiry, data) {
  if (!data) return;

  try {
    const Model = modelMap[underlyingName];
    if (!Model) {
      console.error(`No model found for ${underlyingName}`);
      return;
    }

    const timestamp = convertToIST(Date.now());
    const fetchDate = new Date().toISOString().split('T')[0];

    await Model.findOneAndUpdate(
      { underlyingName, timestamp, expiry },
      {
        underlyingName,
        underlyingScrip,
        underlyingSeg,
        expiry,
        fetchDate,
        timestamp,
        lastPrice: data.lastPrice,
        strikeData: data.strikeData,
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // console.log(`Option chain data saved/updated for ${underlyingName} with expiry ${expiry} at ${timestamp}`);
  } catch (error) {
    console.error(`Error saving option chain data for ${underlyingName}: ${error.message}`);
  }
}

// Fetch and Save Data for All Underlyings
async function fetchAndSaveAllUnderlyings() {
  for (const { name, scrip, seg, stepSize } of config.underlyings) {
    const expiries = await fetchExpiryDates(scrip, seg, name);
    if (!expiries.length) {
      console.warn(`Skipping ${name} due to no valid expiry dates`);
      continue;
    }

    for (const expiry of expiries) {
      // console.log(`Fetching data for ${name} with expiry ${expiry}`);
      const data = await fetchOptionChainData(scrip, seg, expiry, stepSize);
      if (data) {
        const { roundedPrice, strikePrices } = generateStrikePrices(data.lastPrice, stepSize);
        // console.log(`Index: ${name}, Expiry: ${expiry}, Last Price: ${data.lastPrice}, Rounded Price: ${roundedPrice}`);
        // console.log(`Strike Prices: ${strikePrices.join(', ')}`);
        await saveOptionChainData(name, scrip, seg, expiry, data);
      }
      await delay(300);
    }
  }
}

// Export necessary components
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