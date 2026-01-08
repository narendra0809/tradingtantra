import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * Check if maintenance mode is enabled
 * @returns {Promise<{isMaintenance: boolean, message: string}>}
 */
export const checkMaintenanceMode = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/maintenance/status`);
    return {
      isMaintenance: response.data?.maintenanceMode || false,
      message: response.data?.message || "We are under maintenance. Please check back soon.",
    };
  } catch (error) {
    // If API fails, assume no maintenance (fail open)
    console.error("Error checking maintenance mode:", error);
    return {
      isMaintenance: false,
      message: "",
    };
  }
};

