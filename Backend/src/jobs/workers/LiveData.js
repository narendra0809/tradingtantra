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

new Worker(
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
