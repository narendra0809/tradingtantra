import cron from "node-cron";
import { Queue } from "bullmq";
import MarketHoliday from "../models/holidays.model.js"; // Adjust path to your models
import dotenv from "dotenv";

dotenv.config();

// Initialize BullMQ queues
const connection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
};

const fiveMinDataQueue = new Queue("fiveMinData", { connection });
const tenMinDataQueue = new Queue("tenMinData", { connection });
const liveDataQueue = new Queue("liveData", { connection });

// Helper to get IST time
const getISTTime = () => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
};

// Check if today is a market holiday or weekend
const checkHoliday = async () => {
  const now = getISTTime();
  const todayDate = now.toISOString().split("T")[0];
  const day = now.getDay();

  // Treat weekends as holidays
  if (day === 0 || day === 6) {
    console.log(`[${now.toISOString()}] Weekend detected (Day ${day}): ${todayDate}`);
    return true;
  }

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
    return true; // Treat as holiday on error
  }
};

// Sequential execution of market data tasks
const runMarketTask = async () => {
  const now = getISTTime();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const day = now.getDay();

  // Log current time and day for debugging
  console.log(`[${now.toISOString()}] Checking market task: Day ${day}, Time ${hours}:${minutes}`);

  // Check if today is a weekend
  if (day === 0 || day === 6) {
    console.log(`[${now.toISOString()}] Weekend detected (Day ${day}). Skipping execution.`);
    return;
  }

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
    await fiveMinDataQueue.add("fiveMinData", { fromDate, toDate });
    await tenMinDataQueue.add("tenMinData", { fromDate, toDate });
    await liveDataQueue.add("liveData", { fromDate, toDate });

    console.log(`[${now.toISOString()}] All market jobs queued ✅`);
  } catch (error) {
    console.error(`[${now.toISOString()}] Error in market task:`, error.message);
  }
};

// Clear queues on weekends
const clearQueuesOnWeekend = async () => {
  const now = getISTTime();
  const day = now.getDay();

  if (day === 0 || day === 6) {
    console.log(`[${now.toISOString()}] Weekend detected. Clearing BullMQ queues.`);
    await fiveMinDataQueue.obliterate({ force: true });
    await tenMinDataQueue.obliterate({ force: true });
    await liveDataQueue.obliterate({ force: true });
    console.log(`[${now.toISOString()}] BullMQ queues cleared.`);
  }
};

// Run once immediately, but only if it's a weekday and within market hours
const initializeTask = async () => {
  const now = getISTTime();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  if (day === 0 || day === 6) {
    console.log(`[${now.toISOString()}] Weekend detected on startup. Skipping immediate task.`);
    return;
  }

  if (
    hours < 9 ||
    (hours === 9 && minutes < 15) ||
    hours > 15 ||
    (hours === 15 && minutes > 30)
  ) {
    console.log(`[${now.toISOString()}] Outside market hours on startup. Skipping immediate task.`);
    return;
  }

  if (await checkHoliday()) {
    console.log(`[${now.toISOString()}] Holiday detected on startup. Skipping immediate task.`);
    return;
  }

  await runMarketTask();
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

// Initialize queues and run initial task
const startup = async () => {
  await clearQueuesOnWeekend();
  await initializeTask();
};

startup();

export { runMarketTask, checkHoliday, getISTTime }; // Export for testing or reuse