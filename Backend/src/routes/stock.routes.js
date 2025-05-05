import express from "express";
import {
  getDayHighBreak,
  getDayLowBreak,
  getStocksData,
  getTopGainersAndLosers,
  previousDaysVolume,
  sectorStockData,
} from "../controllers/stock.contollers.js";
import verifyUser from "../middlewares/verifyUser.middleware.js";
import {
  AIIntradayReversalDaily,
  AIIntradayReversalFiveMins,
  AIMomentumCatcherFiveMins,
  AIMomentumCatcherTenMins,
  DailyRangeBreakout,
  DayHighLowReversal,
  startWebSocket,
  twoDayHLBreak,
} from "../controllers/liveMarketData.controller.js";
import {
  dailyCandleReversal,
  fiveDayRangeBreakers,
  tenDayRangeBreakers,
} from "../controllers/swingAnalysis.controllers.js";
import getFiiDiiData from "../controllers/FiiDii.controller.js";
import {
  AICandleBreakers,
  AIContractionDB,
} from "../controllers/AIswingTrades.controller.js";
const router = express.Router();
router.get("/get-turnover", getStocksData);
router.get("/get-top-gainers-and-losers", getTopGainersAndLosers);
router.get("/get-day-high-break", getDayHighBreak);
router.get("/get-day-low-break", getDayLowBreak);
router.get("/previous-volume", previousDaysVolume);
router.get("/sector-data", sectorStockData);

router.get("/five-min-intraday-reversal-candle", AIIntradayReversalFiveMins);
router.get("/daily-intraday-reversal-candle", AIIntradayReversalDaily);
router.get("/daily-range-breakout", DailyRangeBreakout);
router.get("/day-high-low-reversal", DayHighLowReversal);
router.get("/two-day-hl-break", twoDayHLBreak);
router.get("/five-min-momentum", AIMomentumCatcherFiveMins);
router.get("/ten-min-momentum", AIMomentumCatcherTenMins);

router.get("/five-day-range-break", fiveDayRangeBreakers);
router.get("/ten-day-range-break", tenDayRangeBreakers);
router.get("/daily-candel-reversal", dailyCandleReversal);
router.get("/ai-contraction", AIContractionDB);

router.get("/fii-dii", getFiiDiiData);
export default router;
