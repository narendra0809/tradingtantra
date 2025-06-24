import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import optionChainJob from "./src/jobs/optionChain.job.js";

dotenv.config();

console.log("Starting option chain job...");

connectDB()
  .then(() => {
    // console.log("Database connected successfully for optionChainJob");
    optionChainJob.start();
  })
  .catch((error) => {
    console.error("Failed to connect to DB for optionChainJob", error);
    process.exit(1);
  });

process.on("SIGINT", () => {
  optionChainJob.stop();
  console.log("Option chain job stopped");
  process.exit(0);
});