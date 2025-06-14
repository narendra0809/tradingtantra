import express from "express";
import verifyAdmin from "../../middlewares/verifyAdmin.middleware.js";
import {
  getAdminDataApiKeys,
  getAdminPaymentKeys,
  updateDataApiKeys,
  updatePaymentKeys,
} from "../../controllers/adminControllers/adminKeys.controller.js";

const router = express.Router();

router.get("/get-payment-keys", verifyAdmin, getAdminPaymentKeys);
router.put("/update-payment-keys", verifyAdmin, updatePaymentKeys);
router.get("/get-data-keys", verifyAdmin, getAdminDataApiKeys);
router.get("/update-data-keys", verifyAdmin, updateDataApiKeys);

export default router;
