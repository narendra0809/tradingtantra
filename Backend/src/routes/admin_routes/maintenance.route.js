import express from "express";
import verifyAdmin from "../../middlewares/verifyAdmin.middleware.js";
import {
  getMaintenanceStatus,
  toggleMaintenanceMode,
  getFrontendVersion,
  updateFrontendVersion,
} from "../../controllers/adminControllers/maintenance.controller.js";

const router = express.Router();

// Get maintenance status (admin only)
router.get("/maintenance", verifyAdmin, getMaintenanceStatus);

// Toggle maintenance mode (admin only)
router.post("/maintenance/toggle", verifyAdmin, toggleMaintenanceMode);

// Get frontend version (public - for version check)
router.get("/version", getFrontendVersion);

// Update frontend version (admin only)
router.post("/version", verifyAdmin, updateFrontendVersion);

export default router;

