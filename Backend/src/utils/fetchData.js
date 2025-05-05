import axios from "axios";
const baseUri = "https://api.dhan.co/v2";
const accessToken = process.env.DHAN_ACCESS_TOKEN;
const clientId = process.env.DHAN_CLIENT_ID;

export const fetchData = async (url, method, requestData = null) => {
  try {
    if (!url || !method) {
      throw new Error("Please provide url and method");
    }

    const config = {
      method,
      url: `${baseUri}${url}`,
      headers: {
        Accept: "application/json",
        "access-token": `${accessToken}`,
        "Content-Type": "application/json",
        "client-id": `${clientId}`,
      },
    };

    if (["POST", "PUT"].includes(method.toUpperCase()) && requestData) {
      config.data = requestData;
    }

    const response = await axios(config);

    // console.log("API Response:", response.data);

    return { data: response.data, error: null };
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    return { data: null, error: error.message };
  }
};


export const fetchHistoricalData = async (securityId, fromDate, toDate, i, interval = "5") => {
  try {
    const response = await axios({
      method: "POST",
      url: `${baseUri}/charts/intraday`,
      headers: {
        "access-token": accessToken,
        "Content-Type": "application/json",
      },
      data: {
        securityId,
        exchangeSegment: "NSE_EQ",
        instrument: "EQUITY",
        interval: interval,
        fromDate,
        toDate,
      },
    });

    console.log(`Fetched ${interval}-min data for ${i + 1}: ${securityId}`);
    return response.data;
  } catch (error) {
    console.error(`API Error (${interval}-min) for ${securityId}:`, error.response?.data || error.message);
    return null;
  }
};


export const fetchDailyHistoricalData = async (
  securityId,
  fromDate,
  toDate,
  i
) => {
  try {
    const response = await axios({
      method: "POST",
      url: `${baseUri}/charts/historical`,
      headers: {
        "access-token": accessToken,
        "Content-Type": "application/json",
      },
      data: {
        securityId,
        exchangeSegment: "NSE_EQ",
        instrument: "EQUITY",
        expiryCode: 0,
        fromDate: fromDate,
        toDate: toDate,
      },
    });
    console.log(" data for ", i + 1);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    return null;
  }
};

export const fetchHistoricalDataforTenMin = async (
  securityId,
  fromDate,
  toDate,
  i
) => {
  try {
    const response = await axios({
      method: "POST",
      url: `${baseUri}/charts/intraday`,
      headers: {
        "access-token": accessToken,
        "Content-Type": "application/json",
      },
      data: {
        securityId,
        exchangeSegment: "NSE_EQ",
        instrument: "EQUITY",
        interval: "5",
        fromDate: fromDate,
        toDate: toDate,
      },
    });
    console.log(" data for", i + 1);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    return null;
  }
};

export const calculateTurnover = (historicalData) => {
  if (!historicalData || typeof historicalData !== "object") {
    console.error("Invalid historical data:", historicalData);
    return 0;
  }

  const { open, high, low, close, volume } = historicalData;
  if (
    !open ||
    !high ||
    !low ||
    !close ||
    !volume ||
    !Array.isArray(open) ||
    open.length === 0
  ) {
    console.error("Missing or invalid data fields:", historicalData);
    return 0;
  }

  let totalTurnover = 0;
  for (let i = 0; i < open.length; i++) {
    const avgPrice = (open[i] + high[i] + low[i] + close[i]) / 4;
    totalTurnover += volume[i] * avgPrice;
  }

  return totalTurnover;
};
