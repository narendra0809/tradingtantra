import express from "express";
import {
  getDayHighBreak,
  getDayLowBreak,
  getStocksData,
  getTopGainersAndLosers,
  previousDaysVolume,
  sectorStockData,
} from "../controllers/stock.contollers.js";
import verifyAuthAndSubscription from "../middlewares/verifyAuthAndSubscription.js";

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
router.get("/get-turnover", verifyAuthAndSubscription, getStocksData);
router.get("/get-top-gainers-and-losers", verifyAuthAndSubscription, getTopGainersAndLosers);
router.get("/get-day-high-break", verifyAuthAndSubscription, getDayHighBreak);
router.get("/get-day-low-break", verifyAuthAndSubscription, getDayLowBreak);
router.get("/previous-volume", verifyAuthAndSubscription, previousDaysVolume);
router.get("/sector-data", verifyAuthAndSubscription, sectorStockData);

router.get("/five-min-intraday-reversal-candle", verifyAuthAndSubscription, AIIntradayReversalFiveMins);
router.get("/daily-intraday-reversal-candle", verifyAuthAndSubscription, AIIntradayReversalDaily);
router.get("/daily-range-breakout", verifyAuthAndSubscription, DailyRangeBreakout);
router.get("/day-high-low-reversal", verifyAuthAndSubscription, dayHighLowReversal);
router.get("/two-day-hl-break", verifyAuthAndSubscription, twoDayHLBreak);
router.get("/five-min-momentum", verifyAuthAndSubscription, AIMomentumCatcherFiveMins);
router.get("/ten-min-momentum", verifyAuthAndSubscription, AIMomentumCatcherTenMins);

router.get("/five-day-range-break", verifyAuthAndSubscription, fiveDayRangeBreakers);
router.get("/ten-day-range-break", verifyAuthAndSubscription, tenDayRangeBreakers);
router.get("/daily-candel-reversal", verifyAuthAndSubscription, dailyCandleReversal);
router.get("/ai-contraction", verifyAuthAndSubscription, AIContractionDB);

router.get("/fii-dii", verifyAuthAndSubscription, getFiiDiiData);

router.get("/index-candles", verifyAuthAndSubscription, getIndexCandlesData);
router.get("/get-all-index-points", verifyAuthAndSubscription, getAllIndexPoints);
router.get("/index-contribution/:indexName", verifyAuthAndSubscription, getContributionInIndex);

//Outside market hours routes for data fetching :
router.get("/smart-money-action", verifyAuthAndSubscription, getSmartMoneyActionData);
router.get("/sector-depth", verifyAuthAndSubscription, sectorDepth);
router.get("/market-depth", verifyAuthAndSubscription, marketDepth);

export default router;
