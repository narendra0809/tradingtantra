import { Queue } from "bullmq";
import { getRedisConnection } from "../utils/redisConnection.js";

const connection = getRedisConnection();

// Create queues with the specified connection settings
// If Redis is not available, queues will be created but workers won't start
export const liveDataQueue = connection ? new Queue("liveData", { connection }) : null;
export const TenMinDataQueue = connection ? new Queue("TenMinData", { connection }) : null;
export const fiveMinDataQueue = connection ? new Queue("fiveMinData", { connection }) : null;
