import cron from "node-cron";
import { Queue } from "bullmq";
import MarketHoliday from "../models/holidays.model.js";
import dotenv from "dotenv";

dotenv.config();

const connection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
};

const fiveMinDataQueue = new Queue("fiveMinData", { connection });
const tenMinDataQueue = new Queue("tenMinData", { connection });
const liveDataQueue = new Queue("liveData", { connection });

const getISTTime = () => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
};

const checkHoliday = async () => {
  const now = getISTTime();
  const todayDate = now.toISOString().split("T")[0];
  const day = now.getDay();

  if (day === 0 || day === 6) {
    console.log(`[${now.toISOString()}] Weekend detected: ${todayDate}`);
    return true;
  }

  try {
    const holiday = await MarketHoliday.findOne({ date: new Date(todayDate) }).select("date");
    if (holiday) {
      console.log(`[${now.toISOString()}] Holiday detected: ${todayDate}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`[${now.toISOString()}] Error checking holiday:`, error.message);
    return true;
  }
};

const runMarketTask = async () => {
  const now = getISTTime();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const day = now.getDay();

  console.log(`[${now.toISOString()}] Checking market task: Day ${day}, Time ${hours}:${minutes}`);

  if (day === 0 || day === 6) {
    console.log(`[${now.toISOString()}] Weekend detected. Skipping.`);
    return;
  }

  if (await checkHoliday()) {
    console.log(`[${now.toISOString()}] Holiday detected. Skipping.`);
    return;
  }

  if (
    hours < 9 ||
    (hours === 9 && minutes < 15) ||
    hours > 15 ||
    (hours === 15 && minutes > 30)
  ) {
    console.log(`[${now.toISOString()}] Outside market hours. Skipping.`);
    return;
  }

  try {
    console.log(`[${now.toISOString()}] Running market task`);
    const today = new Date();
    const fromDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const toDate = tomorrow.toISOString().split("T")[0];

    await fiveMinDataQueue.add("fiveMinData", { fromDate, toDate });
    await tenMinDataQueue.add("tenMinData", { fromDate, toDate });
    await liveDataQueue.add("liveData", { fromDate, toDate });

    console.log(`[${now.toISOString()}] Jobs queued`);
  } catch (error) {
    console.error(`[${now.toISOString()}] Error in market task:`, error.message);
  }
};

const clearQueuesOnWeekend = async () => {
  const now = getISTTime();
  const day = now.getDay();

  if (day === 0 || day === 6) {
    console.log(`[${now.toISOString()}] Weekend detected. Clearing queues.`);
    await fiveMinDataQueue.obliterate({ force: true });
    await tenMinDataQueue.obliterate({ force: true });
    await liveDataQueue.obliterate({ force: true });
    console.log(`[${now.toISOString()}] Queues cleared.`);
  }
};

const initializeTask = async () => {
  const now = getISTTime();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  if (day === 0 || day === 6) {
    console.log(`[${now.toISOString()}] Weekend on startup. Skipping.`);
    return;
  }

  if (
    hours < 9 ||
    (hours === 9 && minutes < 15) ||
    hours > 15 ||
    (hours === 15 && minutes > 30)
  ) {
    console.log(`[${now.toISOString()}] Outside market hours on startup. Skipping.`);
    return;
  }

  if (await checkHoliday()) {
    console.log(`[${now.toISOString()}] Holiday on startup. Skipping.`);
    return;
  }

  await runMarketTask();
};

cron.schedule(
  "* * * * 1-5",
  runMarketTask,
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  }
);

console.log(`[${new Date().toISOString()}] Cron scheduled: Every 2min, 9:15 AM - 3:30 PM IST, Mon-Fri`);

const startup = async () => {
  await clearQueuesOnWeekend();
  await initializeTask();
};

startup();

export { runMarketTask, checkHoliday, getISTTime };