// worker/fiveMinWorker.js
import { getData } from "../../controllers/liveMarketData.controller.js";
import { DateTime } from "luxon";

// Function to check if current time is within 9:15 AM to 3:30 PM IST
export const isMarketTime = () => {
  const now = DateTime.now().setZone("Asia/Kolkata");
  const hour = now.hour;
  const minute = now.minute;

  if (hour < 9 || (hour === 9 && minute < 15)) {
    return false;
  }
  if (hour > 15 || (hour === 15 && minute >= 40)) {
    return false;
  }
  return true;
};

// Function to run the 5-minute data task directly
export const runFiveMinDataTask = async () => {
  console.log(`[runFiveMinDataTask] Starting...`);
  
  if (!isMarketTime()) {
    console.log(`[runFiveMinDataTask] Outside market hours. Skipping.`);
    return;
  }

  console.log(`[runFiveMinDataTask] Inside market hours. Calling getData...`);
  
  try {
    await getData();
    console.log(`[runFiveMinDataTask] Completed successfully ✅`);
  } catch (error) {
    console.error(`[runFiveMinDataTask] ERROR:`, error.message);
  }
};

console.log("✅ FiveMinData worker initialized (without Redis)");
