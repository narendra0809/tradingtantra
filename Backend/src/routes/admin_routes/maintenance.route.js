import express from "express";
import verifyAdmin from "../../middlewares/verifyAdmin.middleware.js";
import {
  getMaintenanceStatus,
  toggleMaintenanceMode,
} from "../../controllers/adminControllers/maintenance.controller.js";

const router = express.Router();

// Get maintenance status
router.get("/maintenance", verifyAdmin, getMaintenanceStatus);

// Toggle maintenance mode
router.post("/maintenance/toggle", verifyAdmin, toggleMaintenanceMode);

export default router;

