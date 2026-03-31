import connectDB from "./src/config/db.js";
import { fetchAndSaveAllCrypto } from "./src/services/cryptoOptionChain.service.js";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await connectDB();
  console.log("Fetching and saving crypto...");
  await fetchAndSaveAllCrypto();
  console.log("Done.");
  process.exit();
}
run();
