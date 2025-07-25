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
    const holiday = await MarketHoliday.findOne({
      date: new Date(todayDate),
    }).select("date");
    return !!holiday;
  } catch (error) {
    console.error(`[${now.toISO()}] Error checking holiday:`, error.message);
    return true;
  }
};

const isWithinMarketHours = () => {
  const now = getISTTime();
  const hours = now.hour;
  const minutes = now.minute;

  return (
    (hours > 9 || (hours === 9 && minutes >= 15)) &&
    (hours < 15 || (hours === 15 && minutes <= 40))
  );
};

const runFiveMinDataTask = async () => {
  const now = getISTTime();
  const hours = now.hour;
  const minutes = now.minute;

  console.log(`[${now.toISO()}] Running 5-minute data task`);

  if (
    now.weekday === 6 ||
    now.weekday === 7 ||
    (await checkHoliday()) ||
    !isWithinMarketHours()
  ) {
    console.log(`[${now.toISO()}] Not in market hours or holiday. Skipping.`);
    return;
  }


  try {
    const fromDate = now.minus({ days: 1 }).toISODate();
    const toDate = now.toISODate();

    await fiveMinDataQueue.add("fiveMinData", { fromDate, toDate });
    console.log(`[${now.toISO()}] 5-minute data job queued ✅`);
  } catch (error) {
    console.error(`[${now.toISO()}] 5-minute task error:`, error.message);
  }
};

const runLiveDataTask = async () => {
  const now = getISTTime();
  const hours = now.hour;
  const minutes = now.minute;

  console.log(`[${now.toISO()}] Running live data task`);

  if (
    now.weekday === 6 ||
    now.weekday === 7 ||
    (await checkHoliday()) ||
    !isWithinMarketHours()
  ) {
    console.log(`[${now.toISO()}] Not in market hours or holiday. Skipping.`);
    return;
  }

  try {
    const fromDate = now.minus({ days: 1 }).toISODate();
    const toDate = now.toISODate();

    await liveDataQueue.add("liveData", { fromDate, toDate });
    console.log(`[${now.toISO()}] Live data job queued ✅`);
  } catch (error) {
    console.error(`[${now.toISO()}] Live data task error:`, error.message);
  }
};

const clearQueuesOnWeekend = async () => {
  const now = getISTTime();
  const day = now.weekday;

  if (day === 6 || day === 7) {
    console.log(`[${now.toISO()}] Weekend. Clearing queues.`);
    await fiveMinDataQueue.obliterate({ force: true });
    await liveDataQueue.obliterate({ force: true });
    console.log(`[${now.toISO()}] Queues cleared.`);
  }
};

const initializeTasks = async () => {
  const now = getISTTime();

  if (now.weekday === 6 || now.weekday === 7 || (await checkHoliday())) {
    console.log(`[${now.toISO()}] Startup: Weekend or holiday. Skipping.`);
    return;
  }

  await runFiveMinDataTask();
  await runLiveDataTask();
};

cron.schedule("*/2 9-15 * * 1-5", runFiveMinDataTask, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});

cron.schedule("* 9-15 * * 1-5", runLiveDataTask, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});

console.log(
  `[${new Date().toISOString()}] Schedulers initialized:
   - 5-minute data: Every 5 mins, 9:15–3:40, Mon–Fri
   - Live data: Every minute, 9:15–3:40, Mon–Fri ✅`
);

const startup = async () => {
  await clearQueuesOnWeekend();
  await initializeTasks();
};

startup();

export { runFiveMinDataTask, runLiveDataTask, checkHoliday, getISTTime };
