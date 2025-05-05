import { Worker } from "bullmq";
import { startWebSocket } from "../../controllers/liveMarketData.controller.js";
import dotenv from "dotenv";

dotenv.config();

const connection = {
  host: process.env.REDIS_HOST,         // Redis server hostname from .env
  port: process.env.REDIS_PORT,         // Redis server port from .env
  password: process.env.REDIS_PASSWORD, // Redis server password from .env
};

new Worker(
  'liveData',
  async (data) => {
    try {
      console.log("running live data fetch....⛷️");
      await startWebSocket();
    } catch (error) {
      console.log('error in live worker', error);
    }
  },
  { connection }  // <-- Correct here
);
