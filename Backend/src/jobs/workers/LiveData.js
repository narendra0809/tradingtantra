// worker/liveDataWorker.js
import { Worker } from "bullmq";
import { startWebSocket } from "../../controllers/liveMarketData.controller.js";
import dotenv from "dotenv";
import { DateTime } from "luxon";

dotenv.config();

const connection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
};

// Function to check if current time is within 9:15 AM to 3:30 PM IST
const isMarketTime = () => {
  const now = DateTime.now().setZone("Asia/Kolkata");
  const hour = now.hour;
  const minute = now.minute;

  // Return true if time is between 9:15 and 15:30
  if (
    hour < 9 ||
    (hour === 9 && minute < 15) ||
    hour > 15 ||
    (hour === 15 && minute > 30)
  ) {
    return false;
  }
  return true;
};

const liveDataWorker = new Worker(
  "liveData",
  async (job) => {
    try {
      console.log(`[LiveData Worker] Received job:`, job.data);

      if (!isMarketTime()) {
        console.log(`[LiveData Worker] Skipping job. Outside market hours.`);
        return;
      }

      await startWebSocket();
      console.log(`[LiveData Worker] WebSocket started successfully.`);
    } catch (error) {
      console.error(`[LiveData Worker] Error:`, error.message);
      throw error;
    }
  },
  { connection }
);

liveDataWorker.on("failed", (job, err) => {
  console.error(`[LiveData Worker] Job ${job.id} failed:`, err.message);
});

liveDataWorker.on("completed", (job) => {
  console.log(`[LiveData Worker] Job ${job.id} completed successfully.`);
});
