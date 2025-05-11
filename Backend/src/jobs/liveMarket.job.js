import cron from "node-cron";
import MarketHoliday from "../models/holidays.model.js";
import { fiveMinDataQueue, liveDataQueue, TenMinDataQueue } from "./Queues.js";

// Helper to get IST time
const getISTTime = () => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
};

// Check if today is a market holiday
const checkHoliday = async () => {
  const now = getISTTime();
  const todayDate = now.toISOString().split("T")[0];

  try {
    const holiday = await MarketHoliday.findOne({
      date: new Date(todayDate),
    }).select("date");
    if (holiday) {
      console.log(`[${now.toISOString()}] Holiday detected: ${todayDate}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`[${now.toISOString()}] Error checking holiday:`, error.message);
    return true; // Treat as holiday on error to prevent execution
  }
};

// Sequential execution of market data tasks
const runMarketTask = async () => {
  const now = getISTTime();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Log current time and day for debugging
  console.log(`[${now.toISOString()}] Checking market task: Day ${now.getDay()}, Time ${hours}:${minutes}`);

  // Check if today is a holiday
  if (await checkHoliday()) {
    console.log(`[${now.toISOString()}] Market holiday detected. Skipping execution.`);
    return;
  }

  // Check if within market hours (9:15 AM - 3:30 PM IST)
  if (
    hours < 9 ||
    (hours === 9 && minutes < 15) ||
    hours > 15 ||
    (hours === 15 && minutes > 30)
  ) {
    console.log(`[${now.toISOString()}] Outside market hours (9:15 AM - 3:30 PM IST). Skipping execution.`);
    return;
  }

  try {
    console.log(`[${now.toISOString()}] Running market task at ${now.toLocaleTimeString()}`);
    const today = new Date();
    const fromDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const toDate = tomorrow.toISOString().split("T")[0];

    // Add jobs to queues with expiration
    await fiveMinDataQueue.add("fiveMinData", { fromDate, toDate }, { expire: 24 * 60 * 60 });
    await TenMinDataQueue.add("TenMinData", { fromDate, toDate }, { expire: 24 * 60 * 60 });
    await liveDataQueue.add("liveData", { fromDate, toDate }, { expire: 24 * 60 * 60 });

    console.log(`[${now.toISOString()}] All market jobs queued ✅`);
  } catch (error) {
    console.error(`[${now.toISOString()}] Error in market task:`, error.message);
  }
};

// Schedule the cron job
cron.schedule(
  "*/2 * * * 1-5",
  runMarketTask,
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  }
);

console.log(`[${new Date().toISOString()}] Market cron job scheduled: Every 2 minutes, 9:15 AM - 3:30 PM IST, Mon-Fri ✅`);

// Run once immediately (subject to checks)
runMarketTask();