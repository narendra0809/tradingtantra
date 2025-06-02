import axios from "axios";
import {
  NiftyOptionChain,
  BankNiftyOptionChain,
  FinniftyOptionChain,
  MidcpNiftyOptionChain,
  SensexOptionChain,
} from "../models/optionChain.model.js";
import {
  convertToIST,
  formateDate,
  getCurrentFetchDate,
  getPreviousDate,
  getPrevousFetchDate,
} from "../utils/dateUtils.js";
import config from "../config/optionChain.config.js";
import { delay } from "../utils/dateUtils.js";
const modelMap = {
  NIFTY: NiftyOptionChain,
  BANKNIFTY: BankNiftyOptionChain,
  FINNIFTY: FinniftyOptionChain,
  MIDCPNIFTY: MidcpNiftyOptionChain,
  SENSEX: SensexOptionChain,
};

export async function fetchExpiryDates(
  underlyingScrip,
  underlyingSeg,
  underlyingName
) {
  try {
    const response = await axios.post(
      config.expiryListUrl,
      { UnderlyingScrip: underlyingScrip, UnderlyingSeg: underlyingSeg },
      {
        headers: {
          "access-token": config.accessToken,
          "client-id": config.clientId,
          "Content-Type": "application/json",
        },
      }
    );

    const { data } = response.data;
    if (!data || !Array.isArray(data)) {
      console.log(`No expiry dates for ${underlyingName}`);
      return [];
    }

    const today = new Date();
    return data
      .map((date) => new Date(date))
      .filter((date) => date >= today)
      .sort((a, b) => a - b)
      .map((date) => date.toISOString().split("T")[0])
      .slice(0, 2);
  } catch (error) {
    console.error(
      `Error fetching expiry dates for ${underlyingName}: ${error.message}`
    );
    return [];
  }
}

export async function fetchOptionChainData(
  underlyingScrip,
  underlyingSeg,
  expiry,
  stepSize,
  underlyingName,
  retries = 3
) {
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
            "access-token": config.accessToken,
            "client-id": config.clientId,
            "Content-Type": "application/json",
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
          createStrikeData(strikePrice, "CE", ceData),
          createStrikeData(strikePrice, "PE", peData),
        ];
      });

      return { lastPrice: data.last_price, strikeData };
    } catch (error) {
      if (error.response?.status === 429 && attempt < retries) {
        //  TODO : fix this
        await delay(Math.pow(2, attempt) * 5000);
        continue;
      }
      console.error(
        `Error fetching option chain for ${underlyingName}, expiry ${expiry}: ${error.message}`
      );
      return null;
    }
  }
  return null;
}

export async function saveOptionChainData(
  underlyingName,
  underlyingScrip,
  underlyingSeg,
  expiry,
  data
) {
  if (!data) return;
  try {
    const Model = modelMap[underlyingName];
    if (!Model) return;
    const now = new Date();
    const dayOfWeek = now.getDay();

    const daysBack = dayOfWeek === 1 ? 3 : 1;

    const referenceDate = getPreviousDate(now, daysBack);
    const timestamp = convertToIST(Date.now());
    const oldTimestamp = timestamp.split(",");
    oldTimestamp[0] = formateDate(referenceDate);
    const previousTimestamp = oldTimestamp.join(",");
    const currentFetchDate = getCurrentFetchDate();

    const [existingDoc] = await Model.find({
      underlyingName,
      timestamp: previousTimestamp,
      expiry,
    });

    const updatedDoc = await Model.findOneAndUpdate(
      {
        _id: existingDoc._id,
      },
      {
        $set: {
          underlyingName,
          underlyingScrip,
          underlyingSeg,
          expiry,
          fetchDate: currentFetchDate,
          timestamp,
          lastPrice: data.lastPrice,
          strikeData: data.strikeData,
          updatedAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
    console.log("Updated Doc : ", updatedDoc);

    console.log(`Saved option chain for ${underlyingName}, expiry ${expiry}`);
  } catch (error) {
    console.error(
      `Failed to save option chain for ${underlyingName}: ${error.message}`
    );
  }
}

function generateStrikePrices(lastPrice, stepSize) {
  const roundedPrice = Math.round(lastPrice / stepSize) * stepSize;
  const strikePrices = [];
  for (let i = -10; i <= 10; i++) {
    strikePrices.push(roundedPrice + i * stepSize);
  }
  return {
    roundedPrice,
    strikePrices: strikePrices.sort((a, b) => a - b),
  };
}

function createStrikeData(strikePrice, optionType, data) {
  return {
    strikePrice,
    optionType,
    impliedVolatility: data.implied_volatility || 0,
    lastPrice: data.last_price || 0,
    oi: data.oi || 0,
    previousClosePrice: data.previous_close_price || 0,
    previousOi: data.previous_oi || 0,
    previousVolume: data.previous_volume || 0,
    volume: data.volume || 0,
  };
}
