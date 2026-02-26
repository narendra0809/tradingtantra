import Settings from "../models/adminModels/settings.model.js";

/**
 * Middleware to check if maintenance mode is enabled
 * Allows admin routes and admin login to bypass maintenance
 */
const checkMaintenance = async (req, res, next) => {
  try {
    // Get the full path (req.path might not include /api prefix when routes are mounted)
    const fullPath = req.originalUrl || req.path;
    const path = req.path;
    const baseUrl = req.baseUrl || "";
    
    // Debug logging for maintenance toggle issue
    if (fullPath.includes("maintenance/toggle")) {
      console.log("🔍 Maintenance toggle request:", { 
        path, 
        fullPath, 
        baseUrl,
        method: req.method,
        url: req.url 
      });
    }
    
    // Allow admin routes to bypass maintenance (check both path and originalUrl)
    // req.path will be like "/admin/maintenance/toggle" when mounted at /api/admin
    // req.originalUrl will be like "/api/admin/maintenance/toggle"
    // req.url will be like "/admin/maintenance/toggle" (without query)
    const isAdminRoute = 
      path.startsWith("/admin") ||
      fullPath.startsWith("/api/admin") ||
      fullPath.includes("/admin/") ||
      req.url?.startsWith("/admin");
    
    if (isAdminRoute) {
      // Admin routes always bypass maintenance
      if (fullPath.includes("maintenance/toggle")) {
        console.log("✅ Admin maintenance route bypassed");
      }
      return next();
    }

    // Allow auth routes to bypass maintenance (users need to login)
    if (
      path.startsWith("/auth") ||
      fullPath.startsWith("/api/auth") ||
      fullPath.includes("/auth/")
    ) {
      return next();
    }

    // Allow public maintenance status check endpoint
    if (
      (path === "/maintenance/status" || fullPath === "/api/maintenance/status") &&
      req.method === "GET"
    ) {
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
    console.error("❌ Error checking maintenance mode:", error);
    // On error, allow request to proceed (fail open)
    next();
  }
};

export default checkMaintenance;

