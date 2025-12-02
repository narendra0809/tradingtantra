// test-index-candles.js
import dotenv from "dotenv";
import mongoose from "mongoose";

// load .env (for DHAN_ACCESS_TOKEN, Mongo URI, etc.)
dotenv.config();

// adjust this path to where your service file actually is
import {
  runFetchForIndexCandles,
  deleteOldIndexData,
} from "./src/services/indexCandles.service.js";

const MONGODB_URI =
  process.env.DB_URI || "mongodb://localhost:27017/tradingtantra";

async function main() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      autoIndex: true,
    });
    console.log("✅ MongoDB connected");

    // Optional: clear old data before test
    // await deleteOldIndexData();

    console.log("▶ Running runFetchForIndexCandles() once...");
    await runFetchForIndexCandles();

    console.log("✅ Finished runFetchForIndexCandles()");
  } catch (err) {
    console.error("❌ Test run failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected, exiting.");
    process.exit(0);
  }
}

main();
