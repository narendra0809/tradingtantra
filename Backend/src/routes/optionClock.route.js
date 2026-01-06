import { Router } from "express";
import verifyAuthAndSubscription from "../middlewares/verifyAuthAndSubscription.js";
import {
  getClockExpiriesByIndex,
  getOptionClockData,
} from "../controllers/optionClock.controller.js";

export const optionClockRouter = Router();

optionClockRouter.get("/clock-data", verifyAuthAndSubscription, getOptionClockData);
optionClockRouter.get(
  "/clock-data/expiries",
  verifyAuthAndSubscription,
  getClockExpiriesByIndex
);
