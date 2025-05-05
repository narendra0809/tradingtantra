import { Worker } from "bullmq";
import dotenv from "dotenv";
import { getDataForTenMin } from "../../controllers/liveMarketData.controller.js";

// Load environment variables from the .env file
dotenv.config();

const connection = {
  host: process.env.REDIS_HOST,         // Redis server hostname from .env
  port: process.env.REDIS_PORT,         // Redis server port from .env
  password: process.env.REDIS_PASSWORD, // Redis server password from .env
};

// Worker BullMQ ka part hai — iska kaam queue se jobs uthana aur unhe run karna hota hai.
new Worker(
  "TenMinData",
  async (job) => {
    const { fromDate, toDate } = job.data;
    console.log("running ten min candle fetch....⛷️");
    await getDataForTenMin(fromDate, toDate);
  },
  { connection }  // <-- Correct here
);
