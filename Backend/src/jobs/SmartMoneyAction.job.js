import cron from "node-cron";
import { runAllStrategies } from "../controllers/liveMarketDataControllers/momentumFunction.js";

class SmartMoneyActionJob {
  constructor() {
    this.task = null;
  }

  start() {
    if (this.task) return;

    this.task = cron.schedule(
      "*/2 9-15 * * 1-5",
      async () => {
        try {
          console.log("Running smart money data fetch...");
          const res = await runAllStrategies();
          console.log("Result of SmartMoneyAction job : ", res);
        } catch (error) {
          console.error("Error in Smart Money Action job:", error);
        }
      },
      {
        scheduled: true,
        timezone: "Asia/Kolkata",
      }
    );
    console.log("Smart Money Action Job Started !");
  }

  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log("Smart Money Action Job stopped");
    }
  }
}
export default new SmartMoneyActionJob();
