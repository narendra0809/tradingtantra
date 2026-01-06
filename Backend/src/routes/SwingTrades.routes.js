import express from "express";
import {
  AIContractionDB,
  AICandleBreakers,
  AICandleReversal,
  FiveDayBO,
  TenDayBO,
} from "../controllers/AIswingTrades.controller.js";
import verifyAuthAndSubscription from "../middlewares/verifyAuthAndSubscription.js";
const router = express.Router();

router.get("/five-days-bo", verifyAuthAndSubscription, FiveDayBO);
router.get("/ten-days-bo", verifyAuthAndSubscription, TenDayBO);
router.get("/ai-candle-reversal", verifyAuthAndSubscription, AICandleReversal);
router.get("/ai-candle-breakers", verifyAuthAndSubscription, AICandleBreakers);
router.get("/ai-contraction", verifyAuthAndSubscription, AIContractionDB);

export default router;
