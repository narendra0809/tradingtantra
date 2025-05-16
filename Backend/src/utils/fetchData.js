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
    const formattedFromDate = fromDate.replace("T", " ").slice(0, 19);
    const formattedToDate = toDate.replace("T", " ").slice(0, 19);

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
        oi: false,
        fromDate: formattedFromDate,
        toDate: formattedToDate,
      },
    });

    if (!response.data || !response.data.timestamp || response.data.timestamp.length === 0) {
      console.warn(`[API] Invalid or empty data for ${securityId} (${interval}-min)`);
      return null;
    }

    // Validate that data is from the expected date range
    const firstTimestamp = response.data.timestamp[0];
    const lastTimestamp = response.data.timestamp[response.data.timestamp.length - 1];
    const firstDate = new Date(firstTimestamp * 1000).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
    const lastDate = new Date(lastTimestamp * 1000).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
    const expectedFromDate = new Date(fromDate).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
    const expectedToDate = new Date(toDate).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });

    if (!firstDate.includes(expectedFromDate.split("/")[2]) && !lastDate.includes(expectedToDate.split("/")[2])) {
      console.warn(`[API] Data for ${securityId} (${interval}-min) has unexpected date range: ${firstDate} to ${lastDate}`);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`[API] Error (${interval}-min) for ${securityId}:`, error.response?.data || error.message);
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
