import express from "express";
import verifyAdmin from "../../middlewares/verifyAdmin.middleware.js";

import {
  addCoupon,
  deleteCoupon,
  editCoupon,
  getCoupons,
} from "../../controllers/adminControllers/adminCoupon.controller.js";

const router = express.Router();

router.post("/add-coupon", verifyAdmin, addCoupon);
router.get("/get-coupons", getCoupons);
router.put("/edit-coupon", verifyAdmin, editCoupon);
router.delete("/delete-coupon", verifyAdmin, deleteCoupon);

export default router;
