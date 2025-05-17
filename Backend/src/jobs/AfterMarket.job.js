import cron from "node-cron";
import {
  AIContraction,
  dailyCandleReversal,
  fiveDayRangeBreakers,
  tenDayRangeBreakers,
  candleBreakoutBreakdown
} from "../controllers/swingAnalysis.controllers.js";

// Schedule after-market analysis at 3:32 PM IST, Monday-Friday
const scheduleAfterMarketJob = cron.schedule(
  "35 15 * * 1-5",
  // "* * * * *",
  async () => {
    try {
      console.log("🏁 Starting after-market analysis at", new Date().toLocaleString("en-IN"));
      
      const results = await Promise.allSettled([
        fiveDayRangeBreakers(),
        tenDayRangeBreakers(),
        dailyCandleReversal(),
        AIContraction(),
        candleBreakoutBreakdown()
      ]);
      
      console.log("✅ After-market analysis completed. Results:");
      results.forEach((result, i) => {
        const taskNames = [
          "5-Day Range Breakers",
          "10-Day Range Breakers", 
          "Daily Candle Reversal",
          "AI Contraction",
          "Candle Breakout/Breakdown"
        ];
        console.log(`${taskNames[i]}:`, 
          result.status === "fulfilled" ? "Success" : "Failed",
          result.status === "fulfilled" ? result.value : result.reason
        );
      });
      
    } catch (error) {
      console.error("❌ Cron job error:", error);
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata"
  }
);

// Export for server initialization
export default scheduleAfterMarketJob;