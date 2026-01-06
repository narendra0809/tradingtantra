import dotenv from "dotenv";
dotenv.config();

import { server } from "./app.js";
import connectDB from "./src/config/db.js";
import smartMoneyActionJob from "./src/jobs/SmartMoneyAction.job.js";
import optionChainJob from "./src/jobs/optionChain.job.js";

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log("✅ Server started on port", PORT);
      
      // Start all background jobs
      smartMoneyActionJob.start();
      optionChainJob.start();
      
      console.log("✅ All background jobs initialized");
    });
  })
  .catch((error) => {
    console.error("❌ Failed to connect to DB", error);
    process.exit(1);
  });

process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down gracefully...");
  smartMoneyActionJob.stop();
  optionChainJob.stop();
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});
