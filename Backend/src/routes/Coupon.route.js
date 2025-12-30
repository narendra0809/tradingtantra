import express from "express";
import { verifyCoupon } from "../../src/controllers/coupon.controller.js";
import verifyUser from "../middlewares/verifyUser.middleware.js";

const router = express.Router();

// user-authenticated coupon verify
router.get("/verify-coupon", verifyUser, verifyCoupon);

export default router;
