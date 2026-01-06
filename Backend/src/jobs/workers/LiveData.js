import { Worker } from "bullmq";
import { startWebSocket } from "../../controllers/liveMarketData.controller.js";
import { DateTime } from "luxon";
import { getRedisConnection } from "../../utils/redisConnection.js";

const connection = getRedisConnection();

// Only create worker if Redis is available
if (!connection) {
  console.warn("⚠️ Redis not available. LiveData worker will not start.");
}

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

if (connection) {
  const worker = new Worker(
    "liveData",
    async () => {
      try {
        if (isMarketTime()) {
          console.log("⛷️ Running live data fetch within market hours...");
          await startWebSocket();
        } else {
          console.log("🕘 Outside market hours. Skipping data fetch.");
        }
      } catch (error) {
        console.log("❌ Error in live worker:", error);
      }
    },
    { connection }
  );

  worker.on("error", (error) => {
    console.error("❌ LiveData Worker Error:", error.message);
  });
}
