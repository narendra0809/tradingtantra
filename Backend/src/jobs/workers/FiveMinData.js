// worker/fiveMinWorker.js
import { Worker } from "bullmq";
import { getData } from "../../controllers/liveMarketData.controller.js";
import { DateTime } from "luxon";
import { getRedisConnection } from "../../utils/redisConnection.js";

const connection = getRedisConnection();

// Only create worker if Redis is available
if (!connection) {
  console.warn("⚠️ Redis not available. FiveMinData worker will not start.");
}

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

if (connection) {
  const fiveMinWorker = new Worker(
    "fiveMinData",
    async (job) => {
      try {
        console.log(`[Worker] Received job:`, job.data);
        console.log("MARKET OURS  :", isMarketTime());
        if (!isMarketTime()) {
          console.log(`[Worker] Skipping job. Outside market hours.`);
          return;
        }

        const { fromDate, toDate } = job.data;
        await getData(fromDate, toDate);

        console.log(`[Worker] Job completed successfully`);
      } catch (error) {
        console.error(`[Worker] Error processing job:`, error.message);
        throw error;
      }
    },
    { connection }
  );

  fiveMinWorker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
  });

  fiveMinWorker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully.`);
  });

  fiveMinWorker.on("error", (error) => {
    console.error("❌ FiveMinData Worker Error:", error.message);
  });
}
