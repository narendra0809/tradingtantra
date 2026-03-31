import WebSocket from "ws";
import axios from "axios";
import crypto from "crypto";
import {
  BtcOptionChain,
  EthOptionChain,
  SolOptionChain,
  XrpOptionChain,
} from "../models/cryptoOptionChain.model.js";

const BINANCE_BASE = "https://eapi.binance.com";
const API_KEY = process.env.BINANCE_API_KEY || "";
const API_SECRET = process.env.BINANCE_API_SECRET || "";

const indexWiseModels = {
  BTC: BtcOptionChain,
  ETH: EthOptionChain,
  SOL: SolOptionChain,
  XRP: XrpOptionChain,
};

const UNDERLYING_MAP = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  SOL: "SOLUSDT",
  XRP: "XRPUSDT",
};

/**
 * Sign a Binance request (HMAC-SHA256)
 */
function signQuery(queryString) {
  return crypto
    .createHmac("sha256", API_SECRET)
    .update(queryString)
    .digest("hex");
}

/**
 * Get the spot price for a crypto underlying from Binance
 */
async function getSpotPrice(underlying) {
  try {
    const symbol = UNDERLYING_MAP[underlying] || `${underlying}USDT`;
    const res = await axios.get(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`,
    );
    return parseFloat(res.data.price) || 0;
  } catch (err) {
    console.error(`Failed to get spot price for ${underlying}:`, err.message);
    return 0;
  }
}

function fetchDeribitTicker(instrumentName) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket("wss://www.deribit.com/ws/api/v2");

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error(`WebSocket timeout for ${instrumentName}`));
    }, 10000);

    ws.on("open", () => {
      const subscribeMsg = {
        jsonrpc: "2.0",
        method: "public/subscribe",
        params: { channels: [`ticker.${instrumentName}.100ms`] },
        id: 1,
      };
      ws.send(JSON.stringify(subscribeMsg));
    });

    ws.on("message", (data) => {
      try {
        const response = JSON.parse(data);
        if (response.method === "subscription") {
          clearTimeout(timeout);
          ws.close();
          resolve(response.params.data);
        }
      } catch (err) {}
    });

    ws.on("error", (error) => {
      clearTimeout(timeout);
      ws.close();
      reject(error);
    });
  });
}

function mapDeribitToStrikeData(tickerData, optionType, strikePrice) {
  const usdMultiplier = tickerData?.underlying_price || 1;

  // Deribit ticker payloads can vary between endpoints/versions. Try multiple
  // common field names as fallbacks so we don't end up storing zeros.
  const impliedVolatility =
    tickerData?.mark_iv ?? tickerData?.iv ?? tickerData?.estimated_iv ?? 0;

  const lastPriceRaw =
    tickerData?.last_price ?? tickerData?.last ?? tickerData?.mark_price ?? 0;
  const lastPrice = Number(lastPriceRaw || 0) * Number(usdMultiplier || 1);

  const oi =
    Number(
      tickerData?.open_interest ??
        tickerData?.openInterest ??
        tickerData?.oi ??
        0,
    ) || 0;

  const volume =
    Number(tickerData?.stats?.volume ?? tickerData?.volume ?? 0) || 0;

  // Helpful debug info when values are missing (can be removed later)
  if (!lastPrice || !oi) {
    console.debug("Deribit ticker missing numeric fields", {
      instrument: tickerData?.instrument_name,
      lastPriceRaw,
      usdMultiplier,
      oiRaw: tickerData?.open_interest,
      fallbackOi: tickerData?.openInterest ?? tickerData?.oi,
      volumeRaw: tickerData?.stats?.volume ?? tickerData?.volume,
    });
  }

  return {
    strikePrice,
    optionType,
    impliedVolatility: Number(impliedVolatility || 0),
    lastPrice,
    oi,
    previousClosePrice: 0,
    previousOi: 0,
    previousVolume: 0,
    volume,
  };
}

/**
 * Fetch and save ATM option snapshot using Binance Spot and Deribit WS
 */
async function fetchAndSaveForUnderlying(underlying) {
  const Model = indexWiseModels[underlying];
  if (!Model) throw new Error(`No model for ${underlying}`);

  console.log(
    `📡 Fetching Binance spot & Deribit option data for ${underlying}...`,
  );

  // 1. Get Spot Price from Binance
  const spotPrice = await getSpotPrice(underlying);
  if (!spotPrice) {
    console.error(`❌ Could not get spot price for ${underlying}`);
    return;
  }

  // 2. Get active Deribit instruments
  let res;
  // Prefer fetching instruments under the actual underlying symbol first.
  // For SOL/XRP Deribit may list instruments under USDC; try fallback if needed.
  const primaryCurrency = underlying;
  const fallbackCurrency = ["SOL", "XRP"].includes(underlying)
    ? "USDC"
    : underlying;

  try {
    res = await axios.get(
      `https://www.deribit.com/api/v2/public/get_instruments?currency=${primaryCurrency}&kind=option`,
    );
  } catch (err) {
    console.error(
      `❌ Failed to fetch Deribit instruments for ${underlying} (primary):`,
      err.message,
    );
    res = { data: { result: [] } };
  }

  let activeInstruments = (res.data.result || []).filter(
    (i) =>
      i.is_active &&
      (i.base_currency === underlying ||
        i.instrument_name.startsWith(underlying)),
  );

  if (
    (activeInstruments || []).length === 0 &&
    fallbackCurrency !== primaryCurrency
  ) {
    try {
      const res2 = await axios.get(
        `https://www.deribit.com/api/v2/public/get_instruments?currency=${fallbackCurrency}&kind=option`,
      );
      activeInstruments = (res2.data.result || []).filter(
        (i) =>
          i.is_active &&
          (i.base_currency === underlying ||
            i.instrument_name.startsWith(underlying)),
      );
      console.debug(
        `Used fallback currency ${fallbackCurrency} for ${underlying}; found ${activeInstruments.length} instruments.`,
      );
    } catch (err) {
      console.error(
        `❌ Failed to fetch Deribit instruments for ${underlying} (fallback ${fallbackCurrency}):`,
        err.message,
      );
      activeInstruments = [];
    }
  }

  if (activeInstruments.length === 0) {
    console.log(`No active Deribit options found for ${underlying}`);
    return;
  }

  // 3. Determine dynamic target strike closest to spot price
  const uniqueStrikes = [...new Set(activeInstruments.map((i) => i.strike))];
  const TARGET_STRIKE = uniqueStrikes.reduce((prev, curr) =>
    Math.abs(curr - spotPrice) < Math.abs(prev - spotPrice) ? curr : prev,
  );

  // 4. Find active calls and puts for the Target Strike
  const instrumentsForStrike = activeInstruments.filter(
    (i) => i.strike === TARGET_STRIKE,
  );

  if (instrumentsForStrike.length === 0) {
    console.log(
      `No active Deribit options found for ${underlying} at strike ${TARGET_STRIKE}`,
    );
    return;
  }

  // Get unique expiration timestamps and sort them to find the nearest ones
  const uniqueExpirations = [
    ...new Set(instrumentsForStrike.map((i) => i.expiration_timestamp)),
  ];
  uniqueExpirations.sort((a, b) => a - b);

  // Debug: show nearest expiries (ISO dates) so we can see why certain dates are chosen
  try {
    const expiryDates = uniqueExpirations
      .slice(0, 10)
      .map((ts) => new Date(ts).toISOString().split("T")[0]);
    console.debug(
      `Nearest expiries for ${underlying} strike ${TARGET_STRIKE}:`,
      expiryDates,
    );
  } catch (e) {}

  // Group expiries by calendar date (YYYY-MM-DD)
  const expiriesByDate = {};
  uniqueExpirations.forEach((ts) => {
    try {
      const d = new Date(ts);
      const dateStr = d.toISOString().split("T")[0];
      expiriesByDate[dateStr] = expiriesByDate[dateStr] || [];
      expiriesByDate[dateStr].push(ts);
    } catch (e) {}
  });

  const sortedDates = Object.keys(expiriesByDate).sort();
  const todayStr = new Date().toISOString().split("T")[0];

  // Find base date: earliest expiry date >= today, else earliest available
  const baseDate = sortedDates.find((dt) => dt >= todayStr) || sortedDates[0];

  // Desired consecutive calendar dates starting from baseDate
  const desiredDates = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    desiredDates.push(d.toISOString().split("T")[0]);
  }

  // Pick one expiry timestamp per desired date (earliest timestamp for the date)
  let targetExpirations = [];
  for (const dt of desiredDates) {
    const tsList = expiriesByDate[dt];
    if (tsList && tsList.length > 0) {
      tsList.sort((a, b) => a - b);
      targetExpirations.push(tsList[0]);
    }
  }

  // If we couldn't find 3 consecutive dates on Deribit, fall back to nearest available expiries
  if (targetExpirations.length < 3) {
    for (const ts of uniqueExpirations) {
      if (!targetExpirations.includes(ts)) {
        targetExpirations.push(ts);
      }
      if (targetExpirations.length === 3) break;
    }
  }

  // Debug: show which dates we attempted and which expiries were selected
  try {
    console.debug(`Desired consecutive dates for ${underlying}:`, desiredDates);
    const selectedDates = targetExpirations.map(
      (ts) => new Date(ts).toISOString().split("T")[0],
    );
    console.debug(`Selected expiry dates for ${underlying}:`, selectedDates);
  } catch (e) {}

  // Use Promise.all to fetch and save concurrently for the 3 expiries
  await Promise.all(
    targetExpirations.map(async (expirationTimestamp) => {
      const callInstrument = instrumentsForStrike.find(
        (i) =>
          i.option_type === "call" &&
          i.expiration_timestamp === expirationTimestamp,
      );
      const putInstrument = instrumentsForStrike.find(
        (i) =>
          i.option_type === "put" &&
          i.expiration_timestamp === expirationTimestamp,
      );

      if (!callInstrument || !putInstrument) return;

      // 5. Fetch WS Ticker data
      let callData, putData;
      try {
        [callData, putData] = await Promise.all([
          fetchDeribitTicker(callInstrument.instrument_name),
          fetchDeribitTicker(putInstrument.instrument_name),
        ]);
      } catch (err) {
        console.error(
          `❌ WebSocket fetch failed for ${underlying} expiry ${expirationTimestamp}:`,
          err.message,
        );
        return;
      }

      const expiryDate = new Date(expirationTimestamp);
      const expiryStr = expiryDate.toISOString().split("T")[0]; // "YYYY-MM-DD"

      const strikeData = [
        mapDeribitToStrikeData(callData, "CE", TARGET_STRIKE),
        mapDeribitToStrikeData(putData, "PE", TARGET_STRIKE),
      ];

      // 6. Save to DB
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      const secs = String(now.getSeconds()).padStart(2, "0");
      const timestamp = `${hours}:${mins}:${secs}`;

      try {
        await Model.findOneAndUpdate(
          {
            underlyingName: underlying,
            timestamp,
            expiry: expiryStr,
          },
          {
            underlyingName: underlying,
            expiry: expiryStr,
            fetchDate: now,
            timestamp,
            lastPrice: spotPrice,
            strikeData,
          },
          { upsert: true, new: true },
        );
        console.log(
          `✅ Saved ATM expiry snapshot for ${underlying} expiry ${expiryStr} at ${timestamp}`,
        );
      } catch (err) {
        if (err.code !== 11000) {
          console.error(
            `Error saving ${underlying} expiry ${expiryStr}:`,
            err.message,
          );
        }
      }
    }),
  );
}

/**
 * Fetch and save option chain data for all underlyings
 */
export async function fetchAndSaveAllCrypto() {
  const underlyings = Object.keys(indexWiseModels);
  for (const underlying of underlyings) {
    try {
      await fetchAndSaveForUnderlying(underlying);
    } catch (err) {
      console.error(`❌ Error fetching ${underlying} options:`, err.message);
    }
  }
}
