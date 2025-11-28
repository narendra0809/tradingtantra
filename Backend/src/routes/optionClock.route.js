import { Router } from "express";
import verifyUser from "../middlewares/verifyUser.middleware.js";
import {
  getClockExpiriesByIndex,
  getOptionClockData,
} from "../controllers/optionClock.controller.js";

export const optionClockRouter = Router();

optionClockRouter.get("/clock-data", verifyUser, getOptionClockData);
optionClockRouter.get(
  "/clock-data/expiries",
  verifyUser,
  getClockExpiriesByIndex
);
