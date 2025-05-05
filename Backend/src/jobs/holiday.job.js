import cron from "node-cron";
import updateHolidays from "../utils/holidayFatch.js";

const holidayJob = cron.schedule(
  "0 0 0 1 1 *",
  async () => {
    console.log("Running updateHolidays cron job at", new Date().toISOString());
    await updateHolidays();
  },
  {
    scheduled: true, // Ensures it starts automatically
    timezone: "Asia/Kolkata",
  }
);

export default holidayJob;
