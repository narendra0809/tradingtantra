import express from "express";
import verifyAdmin from "../../middlewares/verifyAdmin.middleware.js";
import {
  getAdminDetails,
  updateAdminDetails,
} from "../../controllers/adminControllers/adminDetails.controller.js";
import { updateAdminPassword } from "../../controllers/adminControllers/adminAuth.controller.js";

const router = express.Router();

router.get("/get-admin", verifyAdmin, getAdminDetails);
router.put("/update-admin", verifyAdmin, updateAdminDetails);

router.put("/update-password", verifyAdmin, updateAdminPassword);

export default router;
