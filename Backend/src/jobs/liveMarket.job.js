// scheduler/marketScheduler.js
import cron from "node-cron";
import MarketHoliday from "../models/holidays.model.js";
import { DateTime } from "luxon";
import { runFiveMinDataTask } from "./workers/FiveMinData.js";
import { runLiveDataTask } from "./workers/LiveData.js";

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

const runFiveMinDataJob = async () => {
  const now = getISTTime();

  if (
    now.weekday === 6 ||
    now.weekday === 7 ||
    (await checkHoliday()) ||
    !isWithinMarketHours()
  ) {
    return;
  }

  try {
    await runFiveMinDataTask();
  } catch (error) {
    console.error(`[5-MIN DATA] ERROR:`, error.message);
  }
};

const runLiveDataJob = async () => {
  const now = getISTTime();

  if (
    now.weekday === 6 ||
    now.weekday === 7 ||
    (await checkHoliday()) ||
    !isWithinMarketHours()
  ) {
    return;
  }

  try {
    await runLiveDataTask();
  } catch (error) {
    console.error(`[LIVE DATA] ERROR:`, error.message);
  }
};

const initializeTasks = async () => {
  const now = getISTTime();

  if (now.weekday === 6 || now.weekday === 7 || (await checkHoliday())) {
    console.log(`[${now.toISO()}] Startup: Weekend or holiday. Skipping.`);
    return;
  }

  await runFiveMinDataJob();
  await runLiveDataJob();
};

cron.schedule("*/2 9-15 * * 1-5", runFiveMinDataJob, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});

cron.schedule("* 9-15 * * 1-5", runLiveDataJob, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});

console.log(
  `[${new Date().toISOString()}] Schedulers initialized (without Redis):
   - 5-minute data: Every 5 mins, 9:15–3:40, Mon–Fri
   - Live data: Every minute, 9:15–3:40, Mon–Fri ✅`
);

const startup = async () => {
  await initializeTasks();
};

startup();

export { runFiveMinDataJob, runLiveDataJob, checkHoliday, getISTTime };
