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
  dailyCandleReversal,
  fiveDayRangeBreakers,
  tenDayRangeBreakers,
} from "../controllers/swingAnalysis.controllers.js";
import getFiiDiiData from "../controllers/FiiDii.controller.js";
import { AIContractionDB } from "../controllers/AIswingTrades.controller.js";
import { AIIntradayReversalFiveMins } from "../controllers/liveMarketDataControllers/aiIntradayReversalFiveMins.js";
import { AIIntradayReversalDaily } from "../controllers/liveMarketDataControllers/aiIntradayReversalDaily.js";
import { AIMomentumCatcherFiveMins } from "../controllers/liveMarketDataControllers/aiMomentumCatcherFiveMins.js";
import { AIMomentumCatcherTenMins } from "../controllers/liveMarketDataControllers/aiMomentumCatcherTenMins.js";
import { DailyRangeBreakout } from "../controllers/liveMarketDataControllers/dailyRangeBreakout.js";
import { dayHighLowReversal } from "../controllers/liveMarketDataControllers/dayHighLowReversal.js";
import { twoDayHLBreak } from "../controllers/liveMarketDataControllers/twoDayHLBreak.js";
import { getSmartMoneyActionData } from "../controllers/liveMarketDataControllers/getSmartActionMoneyData.js";
import { sectorDepth } from "../controllers/sectorDepth/sectorDepth.controller.js";
import { marketDepth } from "../controllers/marketDepth/getMarketDepthData.js";
import { getIndexCandlesData } from "../controllers/indexCandles.controller.js";
import { getAllIndexPoints } from "../controllers/indexCandlesPoints.controller.js";
import { getContributionInIndex } from "../controllers/contributors.controller.js";

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
router.get("/day-high-low-reversal", dayHighLowReversal);
router.get("/two-day-hl-break", twoDayHLBreak);
router.get("/five-min-momentum", AIMomentumCatcherFiveMins);
router.get("/ten-min-momentum", AIMomentumCatcherTenMins);

router.get("/five-day-range-break", fiveDayRangeBreakers);
router.get("/ten-day-range-break", tenDayRangeBreakers);
router.get("/daily-candel-reversal", dailyCandleReversal);
router.get("/ai-contraction", AIContractionDB);

router.get("/fii-dii", getFiiDiiData);

router.get("/index-candles", getIndexCandlesData);
router.get("/get-all-index-points", getAllIndexPoints);
router.get("/index-contribution/:indexName", getContributionInIndex);

//Outside market hours routes for data fetching :
router.get("/smart-money-action", getSmartMoneyActionData);
router.get("/sector-depth", sectorDepth);
router.get("/market-depth", marketDepth);

export default router;
