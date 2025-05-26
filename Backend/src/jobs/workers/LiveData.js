import { Worker } from "bullmq";
import { startWebSocket } from "../../controllers/liveMarketData.controller.js";
import dotenv from "dotenv";

dotenv.config();

const connection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
};

function isWithinTradingHours() {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  start.setHours(9, 15, 0);   // 9:15 AM
  end.setHours(15, 35, 0);    // 3:35 PM

  return now >= start && now <= end;
}

new Worker(
  'liveData',
  async () => {
    try {
      if (isWithinTradingHours()) {
        console.log("⛷️ Running live data fetch within market hours...");
        await startWebSocket();
      } else {
        console.log("🕘 Outside market hours. Skipping data fetch.");
      }
    } catch (error) {
      console.log('❌ Error in live worker:', error);
    }
  },
  { connection }
);
