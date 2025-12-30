import express from "express";
import {
  AIContractionDB,
  AICandleBreakers,
  AICandleReversal,
  FiveDayBO,
  TenDayBO,
} from "../controllers/AIswingTrades.controller.js";
import verifyUser from "../middlewares/verifyUser.middleware.js";
const router = express.Router();

router.get("/five-days-bo", verifyUser,FiveDayBO);
router.get("/ten-days-bo",verifyUser, TenDayBO);
router.get("/ai-candle-reversal",verifyUser, AICandleReversal);
router.get("/ai-candle-breakers", verifyUser,AICandleBreakers);
router.get("/ai-contraction", verifyUser,AIContractionDB);

export default router;
