import dotenv from "dotenv";
dotenv.config();

import { server } from "./app.js";
import connectDB from "./src/config/db.js";
import smartMoneyActionJob from "./src/jobs/SmartMoneyAction.job.js";

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log("Server started on port", PORT);
      smartMoneyActionJob.start();
    });
  })
  .catch((error) => {
    console.error("Failed to connect to DB", error);
  });

process.on("SIGINT", () => {
  smartMoneyActionJob.stop();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
