import { Worker } from "bullmq";
import { getData } from "../../controllers/liveMarketData.controller.js";
import dotenv from "dotenv";

dotenv.config();

const connection = {
  host: process.env.REDIS_HOST,         // Redis server hostname from .env
  port: process.env.REDIS_PORT,         // Redis server port from .env
  password: process.env.REDIS_PASSWORD, // Redis server password from .env
};

new Worker(
  "fiveMinData",
  async (job) => {
    try {
      const { fromDate, toDate } = job.data;
      // console.log("running five min candle fetch....⛷️");
      await getData(fromDate, toDate);
    } catch (error) {
      console.log('error in five min worker', error.message);
    }
  },
  { connection } // <-- Correct here
);
