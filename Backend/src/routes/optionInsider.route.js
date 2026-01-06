import { Router } from "express";
import verifyAuthAndSubscription from "../middlewares/verifyAuthAndSubscription.js";
import {
  getExpiriesByIndex,
  getOptionInsiderData,
} from "../controllers/insider.controller.js";

export const optionInsiderRoute = Router();

optionInsiderRoute.get("/insider-data", verifyAuthAndSubscription, getOptionInsiderData);
optionInsiderRoute.get("/insider-data/expiries", getExpiriesByIndex);
