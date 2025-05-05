import { Queue } from "bullmq";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const connection = {
  host: process.env.REDIS_HOST,       // Redis server hostname from .env
  port: process.env.REDIS_PORT,       // Redis server port from .env
  password: process.env.REDIS_PASSWORD, // Redis server password from .env
};

// Create queues with the specified connection settings
export const liveDataQueue = new Queue("liveData", { connection });
export const TenMinDataQueue = new Queue("TenMinData", { connection });
export const fiveMinDataQueue = new Queue("fiveMinData", { connection });
