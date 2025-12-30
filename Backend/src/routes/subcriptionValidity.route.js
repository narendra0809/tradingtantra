import { getSubcriptionValidity } from "../controllers/subcriptionValidity.controller.js";
import express from "express";
import verifyUser from "../middlewares/verifyUser.middleware.js";

const router = express.Router();

router.get(
  "/subcription-end-date",
  verifyUser, // 🔥 MUST
  getSubcriptionValidity
);


export default router;
