import Settings from "../models/adminModels/settings.model.js";

/**
 * Middleware to check if maintenance mode is enabled
 * Allows admin routes and admin login to bypass maintenance
 */
const checkMaintenance = async (req, res, next) => {
  try {
    // Allow admin routes to bypass maintenance
    if (req.path.startsWith("/api/admin")) {
      return next();
    }

    // Allow auth routes to bypass maintenance (users need to login)
    if (req.path.startsWith("/api/auth")) {
      return next();
    }

    // Allow public maintenance status check endpoint
    if (req.path === "/api/maintenance/status" && req.method === "GET") {
      return next();
    }

    // Check maintenance mode status
    const settings = await Settings.getSettings();

    if (settings.maintenanceMode) {
      // Maintenance mode is ON
      // Return maintenance status for frontend to handle
      return res.status(503).json({
        success: false,
        maintenanceMode: true,
        message: settings.maintenanceMessage || "We are under maintenance. Please check back soon.",
      });
    }

    // Maintenance mode is OFF, continue normally
    next();
  } catch (error) {
    console.error("Error checking maintenance mode:", error);
    // On error, allow request to proceed (fail open)
    next();
  }
};

export default checkMaintenance;

