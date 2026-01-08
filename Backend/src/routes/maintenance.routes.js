import express from "express";
import Settings from "../models/adminModels/settings.model.js";

const router = express.Router();

// Public endpoint to check maintenance status (for frontend)
router.get("/maintenance/status", async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    return res.status(200).json({
      success: true,
      maintenanceMode: settings.maintenanceMode,
      message: settings.maintenanceMessage || "We are under maintenance. Please check back soon.",
    });
  } catch (error) {
    console.error("Error getting maintenance status:", error);
    return res.status(500).json({
      success: false,
      maintenanceMode: false,
      message: "Error checking maintenance status",
    });
  }
});

export default router;

