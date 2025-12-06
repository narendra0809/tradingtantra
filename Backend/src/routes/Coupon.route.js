import express from "express";
import { verifyCoupon } from "../../src/controllers/coupon.controller.js";

const router = express.Router();

// user-authenticated coupon verify
router.get("/verify-coupon", verifyCoupon);

export default router;
