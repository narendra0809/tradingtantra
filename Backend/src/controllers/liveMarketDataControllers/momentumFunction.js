import { AIIntradayReversalFiveMins } from "./aiIntradayReversalFiveMins.js";
import { AIIntradayReversalDaily } from "./aiIntradayReversalDaily.js";
import { AIMomentumCatcherFiveMins } from "./aiMomentumCatcherFiveMins.js";
import { AIMomentumCatcherTenMins } from "./aiMomentumCatcherTenMins.js";
import { DailyRangeBreakout } from "./dailyRangeBreakout.js";
import { dayHighLowReversal } from "./dayHighLowReversal.js";
import { twoDayHLBreak } from "./twoDayHLBreak.js";

export const runAllStrategies = async () => {
  try {
    console.log("Starting all momentum strategies at", new Date());

    const results = await Promise.allSettled([
      AIMomentumCatcherFiveMins(),
      AIMomentumCatcherTenMins(),
      DailyRangeBreakout(),
      dayHighLowReversal(),
      twoDayHLBreak(),
      AIIntradayReversalDaily(),
      AIIntradayReversalFiveMins(),
    ]);

    results.forEach((result, index) => {
      const strategyNames = [
        "AIMomentumCatcherFiveMins",
        "AIMomentumCatcherTenMins",
        "DailyRangeBreakout",
        "dayHighLowReversal",
        "twoDayHLBreak",
        "AIIntradayReversalDaily",
        "AIIntradayReversalFiveMins",
      ];

      if (result.status === "fulfilled") {
        console.log(`${strategyNames[index]} completed successfully`);
      } else {
        console.error(`${strategyNames[index]} failed:`, result.reason);
      }
    });

    return {
      success: true,
      message: "All strategies executed",
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Error in runAllStrategies:", error);
    return {
      success: false,
      message: "Error executing strategies",
      error: error.message,
    };
  }
};
