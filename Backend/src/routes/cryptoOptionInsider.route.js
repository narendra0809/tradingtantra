import { Router } from "express";
import verifyAuthAndSubscription from "../middlewares/verifyAuthAndSubscription.js";
import {
  getCryptoExpiriesByIndex,
  getCryptoOptionInsiderData,
} from "../controllers/cryptoInsider.controller.js";

export const cryptoOptionInsiderRoute = Router();

cryptoOptionInsiderRoute.get(
  "/crypto-insider-data",
  verifyAuthAndSubscription,
  getCryptoOptionInsiderData
);
cryptoOptionInsiderRoute.get(
  "/crypto-insider-data/expiries",
  getCryptoExpiriesByIndex
);
