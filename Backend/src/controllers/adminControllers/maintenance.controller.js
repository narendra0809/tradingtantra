import Settings from "../../models/adminModels/settings.model.js";

/**
 * Get maintenance mode status
 */
export const getMaintenanceStatus = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    return res.status(200).json({
      success: true,
      data: {
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage,
        frontendVersion: settings.frontendVersion,
      },
    });
  } catch (error) {
    console.error("Error getting maintenance status:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get maintenance status",
    });
  }
};

/**
 * Get frontend version (public endpoint for version check)
 */
export const getFrontendVersion = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    return res.status(200).json({
      success: true,
      version: settings.frontendVersion || "1.0.0",
    });
  } catch (error) {
    console.error("Error getting frontend version:", error);
    return res.status(500).json({
      success: false,
      version: "1.0.0",
    });
  }
};

/**
 * Update frontend version (admin only)
 */
export const updateFrontendVersion = async (req, res) => {
  try {
    const { version } = req.body;
    
    if (!version) {
      return res.status(400).json({
        success: false,
        message: "Version is required",
      });
    }

    const settings = await Settings.getSettings();
    settings.frontendVersion = version;
    await settings.save();

    console.log(`📦 Frontend version updated to: ${version}`);

    return res.status(200).json({
      success: true,
      message: "Frontend version updated",
      version: settings.frontendVersion,
    });
  } catch (error) {
    console.error("Error updating frontend version:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update frontend version",
    });
  }
};

/**
 * Toggle maintenance mode ON/OFF
 */
export const toggleMaintenanceMode = async (req, res) => {
  try {
    const { maintenanceMode, maintenanceMessage } = req.body;

    console.log("🔧 Toggle maintenance request:", { maintenanceMode, maintenanceMessage });

    const settings = await Settings.getSettings();
    
    // Explicitly set the value (don't toggle if value is provided)
    if (maintenanceMode !== undefined) {
      settings.maintenanceMode = Boolean(maintenanceMode);
    } else {
      // If no value provided, toggle it
      settings.maintenanceMode = !settings.maintenanceMode;
    }
    
    // Update message if provided
    if (maintenanceMessage !== undefined && maintenanceMessage !== null) {
      settings.maintenanceMessage = maintenanceMessage;
    }

    await settings.save();

    console.log(`🔧 Maintenance mode ${settings.maintenanceMode ? "ENABLED" : "DISABLED"}`);
    console.log("🔧 Current settings:", {
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
    });

    return res.status(200).json({
      success: true,
      message: `Maintenance mode ${settings.maintenanceMode ? "enabled" : "disabled"}`,
      data: {
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage,
      },
    });
  } catch (error) {
    console.error("❌ Error toggling maintenance mode:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle maintenance mode",
    });
  }
};

