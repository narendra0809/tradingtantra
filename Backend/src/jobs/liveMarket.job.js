

// scheduler/marketScheduler.js
import cron from "node-cron";
import { Queue } from "bullmq";
import MarketHoliday from "../models/holidays.model.js";
import dotenv from "dotenv";
import { DateTime } from "luxon";

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
  return DateTime.now().setZone("Asia/Kolkata");
};

const checkHoliday = async () => {
  const now = getISTTime();
  const todayDate = now.toISODate();
  const day = now.weekday;

  if (day === 6 || day === 7) return true;

  try {
    const holiday = await MarketHoliday.findOne({ date: new Date(todayDate) }).select("date");
    return !!holiday;
  } catch (error) {
    console.error(`[${now.toISO()}] Error checking holiday:`, error.message);
    return true;
  }
};

const runMarketTask = async () => {
  const now = getISTTime();
  const hours = now.hour;
  const minutes = now.minute;
  const day = now.weekday;

  console.log(`[${now.toISO()}] Checking market task: Day ${day}, Time ${hours}:${minutes}`);

  if (day === 6 || day === 7 || await checkHoliday()) {
    console.log(`[${now.toISO()}] Weekend or holiday. Skipping execution.`);
    return;
  }

  if (
    hours < 9 ||
    (hours === 9 && minutes < 15) ||
    hours > 15 ||
    (hours === 15 && minutes > 30)
  ) {
    console.log(`[${now.toISO()}] Outside market hours (9:15–3:30). Skipping.`);
    return;
  }

  try {
    const fromDate = now.minus({ days: 1 }).toISODate();
    const toDate = now.toISODate();

    console.log(`[${now.toISO()}] Running task. fromDate: ${fromDate}, toDate: ${toDate}`);

    await fiveMinDataQueue.add("fiveMinData", { fromDate, toDate });
    await tenMinDataQueue.add("tenMinData", { fromDate, toDate });
    await liveDataQueue.add("liveData", { fromDate, toDate });

    console.log(`[${now.toISO()}] All market jobs queued ✅`);
  } catch (error) {
    console.error(`[${now.toISO()}] Task error:`, error.message);
  }
};

const clearQueuesOnWeekend = async () => {
  const now = getISTTime();
  const day = now.weekday;

  if (day === 6 || day === 7) {
    console.log(`[${now.toISO()}] Weekend. Clearing queues.`);
    await fiveMinDataQueue.obliterate({ force: true });
    await tenMinDataQueue.obliterate({ force: true });
    await liveDataQueue.obliterate({ force: true });
    console.log(`[${now.toISO()}] Queues cleared.`);
  }
};

const initializeTask = async () => {
  const now = getISTTime();
  const hours = now.hour;
  const minutes = now.minute;
  const day = now.weekday;

  if (day === 6 || day === 7 || await checkHoliday()) {
    console.log(`[${now.toISO()}] Startup: Weekend or holiday. Skipping.`);
    return;
  }

  if (
    hours < 9 ||
    (hours === 9 && minutes < 15) ||
    hours > 15 ||
    (hours === 15 && minutes > 30)
  ) {
    console.log(`[${now.toISO()}] Startup: Outside market hours. Skipping.`);
    return;
  }

  await runMarketTask();
};

cron.schedule("*/2 9-15 * * 1-5", runMarketTask, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});

console.log(`[${new Date().toISOString()}] Cron scheduled (Every 2 mins, 9:15–3:30, Mon–Fri) ✅`);

const startup = async () => {
  await clearQueuesOnWeekend();
  await initializeTask();
};

startup();

export { runMarketTask, checkHoliday, getISTTime };