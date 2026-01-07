import cron from "node-cron";
import scrapeAndSaveFIIDIIData from "./scrapData_Two.js";

// Schedule the job at 8:00 AM IST every day (no holiday/weekend checks)
const runFIIDIIJob = async () => {
  try {
    console.log("🚀 Running FII/DII scraping job at 8:00 AM IST...");
    await scrapeAndSaveFIIDIIData();
    console.log("✅ FII/DII data scraped and saved.");
  } catch (error) {
    console.error("❌ Error in FII/DII job:", error.message);
  }
};

// Cron expression: Minute Hour * * *
// This runs at 08:00 AM every day
const FiiDiiJob = cron.schedule("0 9,21 * * *", runFIIDIIJob, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});


console.log("📅 Scheduled FII/DII scraping job: 9:00 AM IST every day ✅");

export default FiiDiiJob;
