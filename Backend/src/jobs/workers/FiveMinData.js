import { Worker } from "bullmq";
import { getData } from "../../controllers/liveMarketData.controller.js";
import dotenv from "dotenv";

dotenv.config();

const connection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
};

new Worker(
  "fiveMinData",
  async (job) => {
    try {
      console.log(`[Worker] Processing fiveMinData job:`, job.data);
      const { fromDate, toDate } = job.data;
      await getData(fromDate, toDate);
      console.log(`[Worker] Completed fiveMinData job`);
    } catch (error) {
      console.error(`[Worker] Error in fiveMinData job:`, error.message);
      throw error; // Ensure error is logged in BullMQ
    }
  },
  { connection }
);