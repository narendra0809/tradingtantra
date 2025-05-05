import axios from "axios";
import MarketHoliday from "../models/holidays.model.js";

const config = {
  method: "get",
  maxBodyLength: Infinity,
  url: "https://api.upstox.com/v2/market/holidays",
  headers: {
    Accept: "application/json",
  },
};

export default async function updateHolidays() {
  try {
    const res = await axios(config);
    console.log("Full API response:", res.data);

    if (res.data.status !== "success") {
      throw new Error("API returned non-success status");
    }

    const holidaysData = res.data.data.filter(
      (holiday) =>
        holiday.holiday_type === "TRADING_HOLIDAY" &&
        holiday.closed_exchanges.includes("NSE")
    );

    console.log("Filtered NSE trading holidays:", holidaysData);

    const holidaysToSave = holidaysData.map((holiday) => ({
      date: holiday.date,
      description: holiday.description,
      holiday_type: holiday.holiday_type,
      closed_exchanges: holiday.closed_exchanges,
    }));
    await MarketHoliday.deleteMany({ holiday_type: "TRADING_HOLIDAY" });

    if (holidaysToSave.length > 0) {
      await MarketHoliday.insertMany(holidaysToSave);
      console.log(`Saved ${holidaysToSave.length} holidays to MongoDB`);
    } else {
      console.log("No holidays to save");
    }

    return holidaysData;
  } catch (error) {
    console.error("Error in updateHolidays:", error.message);
    throw error;
  }
}
