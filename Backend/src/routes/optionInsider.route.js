import { Router } from "express";
import verifyUser from "../middlewares/verifyUser.middleware.js";
import {
  getExpiriesByIndex,
  getOptionInsiderData,
} from "../controllers/insider.controller.js";

export const optionInsiderRoute = Router();

optionInsiderRoute.get("/insider-data", verifyUser, getOptionInsiderData);
optionInsiderRoute.get("/insider-data/expiries", getExpiriesByIndex);
