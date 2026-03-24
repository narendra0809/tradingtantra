import { startWebSocket } from "../../controllers/liveMarketData.controller.js";
import { DateTime } from "luxon";

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

// Function to run the live data task directly
export const runLiveDataTask = async () => {
  if (!isMarketTime()) {
    return;
  }

  try {
    await startWebSocket();
  } catch (error) {
    console.error(`[runLiveDataTask] ERROR:`, error);
  }
};

console.log("✅ LiveData worker initialized (without Redis)");
