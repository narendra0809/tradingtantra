import cron from "node-cron";
import MarketHoliday from "../models/holidays.model.js";
import {
  getData,
  getDataForTenMin,
  startWebSocket,
} from "../controllers/liveMarketData.controller.js";
import { fiveMinDataQueue, liveDataQueue, TenMinDataQueue } from "./Queues.js";

// Helper to get IST time
const getISTTime = () => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
};

// Check if today is a holiday or weekend
const checkHoliday = async () => {
  const now = getISTTime();
  const todayDate = now.toISOString().split("T")[0];
  const dayOfWeek = now.getDay();

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    console.log("Weekend detected (Saturday/Sunday).");
    return true;
  }

  try {
    const holiday = await MarketHoliday.findOne({
      date: new Date(todayDate),
    }).select("date");
    return !!holiday;
  } catch (error) {
    console.error("Error checking holiday:", error.message);
    return false;
  }
};

// Sequential Execution of Both Functions
const runMarketTask = async () => {
  const now = getISTTime();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Check if today is a holiday or outside market hours
  // if (await checkHoliday()) {
  //   console.log("Market Holiday or Weekend. Skipping execution.");
  //   return;
  // }

  // if (
  //   hours < 9 ||
  //   (hours === 9 && minutes < 15) ||
  //   hours > 15 ||
  //   (hours === 15 && minutes > 40)
  // ) {
  //   console.log(
  //     "Outside market hours (9:15 AM - 3:40 PM IST). Skipping execution."
  //   );
  //   return;
  // }

  try {
    console.log(`Running market task at ${now.toLocaleTimeString()}`);
    const today = new Date();
    const fromDate = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const toDate = tomorrow.toISOString().split("T")[0];

    // Add jobs to queues
    await fiveMinDataQueue.add("fiveMinData", { fromDate, toDate });
    await TenMinDataQueue.add("TenMinData", { fromDate, toDate });
    await liveDataQueue.add("liveData", { fromDate, toDate });

    console.log("All market jobs queued ✅");
  } catch (error) {
    console.error("Error in market task:", error.message);
  }
};

// Schedule the cron job
cron.schedule(
  // "*/2 * * * 1-5",
  "*/2 * * * *",
  runMarketTask,
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  }
);

console.log(
  "Market cron job scheduled: Every 4 minutes, 9:15 AM - 3:40 PM IST, Mon-Fri ✅"
);

// Run once immediately
runMarketTask();
