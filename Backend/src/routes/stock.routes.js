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
router.get("/get-turnover", verifyUser,getStocksData);
router.get("/get-top-gainers-and-losers",verifyUser, getTopGainersAndLosers);
router.get("/get-day-high-break",verifyUser, getDayHighBreak);
router.get("/get-day-low-break",verifyUser, getDayLowBreak);
router.get("/previous-volume", verifyUser,previousDaysVolume);
router.get("/sector-data", verifyUser,sectorStockData);

router.get("/five-min-intraday-reversal-candle",verifyUser, AIIntradayReversalFiveMins);
router.get("/daily-intraday-reversal-candle",verifyUser, AIIntradayReversalDaily);
router.get("/daily-range-breakout",verifyUser, DailyRangeBreakout);
router.get("/day-high-low-reversal",verifyUser, dayHighLowReversal);
router.get("/two-day-hl-break", verifyUser,twoDayHLBreak);
router.get("/five-min-momentum",verifyUser, AIMomentumCatcherFiveMins);
router.get("/ten-min-momentum", verifyUser,AIMomentumCatcherTenMins);

router.get("/five-day-range-break", verifyUser,fiveDayRangeBreakers);
router.get("/ten-day-range-break", verifyUser,tenDayRangeBreakers);
router.get("/daily-candel-reversal",verifyUser, dailyCandleReversal);
router.get("/ai-contraction",verifyUser, AIContractionDB);

router.get("/fii-dii", verifyUser,getFiiDiiData);

router.get("/index-candles",verifyUser, getIndexCandlesData);
router.get("/get-all-index-points",verifyUser, getAllIndexPoints);
router.get("/index-contribution/:indexName",verifyUser, getContributionInIndex);

//Outside market hours routes for data fetching :
router.get("/smart-money-action",verifyUser, getSmartMoneyActionData);
router.get("/sector-depth", verifyUser,sectorDepth);
router.get("/market-depth",verifyUser, marketDepth);

export default router;
