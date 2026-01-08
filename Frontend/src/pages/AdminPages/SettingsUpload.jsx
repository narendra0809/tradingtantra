/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { FiTrash2 } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-hot-toast";
import logo from "../../assets/adminImages/logo.png";
import { ADMIN_SERVER_URI } from "./Home";

const UploadCard = ({ title, size, image, onUpload, onRemove }) => {
  const [preview, setPreview] = useState(image || null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", title.toLowerCase());

      try {
        const response = await axios.post(
          `${ADMIN_SERVER_URI}/image-upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
        const imageUrl = response.data.imageUrl;
        console.log("Response  :", imageUrl);
        onUpload(imageUrl);
        setPreview(imageUrl);
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload image. Please try again.");
        setPreview(image || null);
      } finally {
        setUploading(false);
      }
    } else {
      alert("Please select a valid image file.");
    }
  };

  const handleRemove = async () => {
    try {
      await axios.delete(`${ADMIN_SERVER_URI}/image-upload`, {
        data: { type: title.toLowerCase() },
      });
      setPreview(null);
      onRemove();
    } catch (error) {
      console.error("Remove failed:", error);
      alert("Failed to remove image. Please try again.");
    }
  };

  return (
    <div
      className="rounded-xl w-full max-w-sm flex flex-col sm:flex-row items-center sm:items-start p-4 gap-4 shadow-md h-auto sm:h-[140px]"
      style={{ background: "rgba(1, 7, 28, 1)" }}
    >
      {/* Image Preview */}
      <div className="bg-[#040724] rounded-xl w-full h-32 sm:w-1/2 sm:h-full flex items-center justify-center overflow-hidden">
        <img
          src={preview || logo}
          alt={`${title} preview`}
          className="object-contain w-full h-full"
        />
      </div>

      {/* Right: Info + Buttons */}
      <div className="flex flex-col justify-between h-full w-full">
        <div>
          <h3 className="text-white text-md font-semibold leading-tight">
            {title} Change
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Size: {size} Width * Height
          </p>
        </div>

        <div className="flex items-center gap-4 mt-4 flex-wrap">
          <label
            htmlFor={`${title}-file-input`}
            className={`bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded-md cursor-pointer ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {uploading ? "Uploading..." : "Upload"}
          </label>
          {preview && preview !== logo && (
            <button
              onClick={handleRemove}
              className="text-white hover:text-red-500 text-sm flex items-center gap-1"
              disabled={uploading}
            >
              <FiTrash2 size={16} /> Remove
            </button>
          )}
        </div>

        <input
          type="file"
          id={`${title}-file-input`}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
    </div>
  );
};

export default function SettingsUpload() {
  const [logo, setLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch maintenance status on mount
  useEffect(() => {
    const fetchMaintenanceStatus = async () => {
      try {
        const response = await axios.get(`${ADMIN_SERVER_URI}/maintenance`, {
          withCredentials: true,
        });
        if (response.data?.success) {
          setMaintenanceMode(response.data.data.maintenanceMode);
          setMaintenanceMessage(
            response.data.data.maintenanceMessage ||
              "We are under maintenance. Please check back soon."
          );
        }
      } catch (error) {
        console.error("Error fetching maintenance status:", error);
      }
    };

    fetchMaintenanceStatus();
  }, []);

  // Toggle maintenance mode
  const handleToggleMaintenance = async () => {
    const newMaintenanceMode = !maintenanceMode;
    setLoading(true);
    try {
      console.log("Toggling maintenance mode to:", newMaintenanceMode);
      const response = await axios.post(
        `${ADMIN_SERVER_URI}/maintenance/toggle`,
        {
          maintenanceMode: newMaintenanceMode,
          maintenanceMessage: maintenanceMessage || "We are under maintenance. Please check back soon.",
        },
        {
          withCredentials: true,
        }
      );

      console.log("Maintenance toggle response:", response.data);

      if (response.data?.success) {
        const updatedMode = response.data.data.maintenanceMode;
        setMaintenanceMode(updatedMode);
        toast.success(
          `Maintenance mode ${updatedMode ? "enabled" : "disabled"}`
        );
      } else {
        throw new Error(response.data?.message || "Failed to toggle");
      }
    } catch (error) {
      console.error("Error toggling maintenance mode:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to toggle maintenance mode";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update maintenance message
  const handleUpdateMessage = async () => {
    if (!maintenanceMessage.trim()) {
      toast.error("Please enter a maintenance message");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${ADMIN_SERVER_URI}/maintenance/toggle`,
        {
          maintenanceMode: maintenanceMode,
          maintenanceMessage: maintenanceMessage,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data?.success) {
        toast.success("Maintenance message updated");
      }
    } catch (error) {
      console.error("Error updating maintenance message:", error);
      toast.error("Failed to update maintenance message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#00010f] min-h-screen p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Maintenance Mode Section */}
        <div
          className="rounded-xl w-full p-6 shadow-md"
          style={{ background: "rgba(1, 7, 28, 1)" }}
        >
          <h2 className="text-white text-xl font-semibold mb-4">
            Maintenance Mode
          </h2>

          {/* Toggle Switch */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white text-base font-medium">
                Enable Maintenance Mode
              </p>
              <p className="text-gray-400 text-sm mt-1">
                When enabled, all users (except admins) will see the maintenance
                page
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => {
                  // Don't update state immediately, let API response update it
                  handleToggleMaintenance();
                }}
                disabled={loading}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                maintenanceMode ? "bg-blue-600" : "bg-gray-700"
              } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}></div>
            </label>
          </div>

          {/* Maintenance Message */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">
              Maintenance Message
            </label>
            <textarea
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="Enter maintenance message..."
              className="w-full px-4 py-2 rounded-md bg-[#040724] border border-blue-400 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            <button
              onClick={handleUpdateMessage}
              disabled={loading || !maintenanceMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Message"}
            </button>
          </div>

          {/* Status Indicator */}
          <div className="mt-4 flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                maintenanceMode ? "bg-red-500" : "bg-green-500"
              }`}
            ></div>
            <span className="text-gray-400 text-sm">
              Status:{" "}
              <span className="text-white font-medium">
                {maintenanceMode ? "Maintenance ON" : "Maintenance OFF"}
              </span>
            </span>
          </div>
        </div>

        {/* Logo & Favicon Upload Section */}
        <div className="flex flex-col md:flex-row items-start gap-6 sm:gap-12">
          <UploadCard
            title="Logo"
            size="194 * 53"
            image={logo}
            onUpload={(img) => setLogo(img)}
            onRemove={() => setLogo(null)}
          />
          <UploadCard
            title="Favicon"
            size="32 * 32"
            image={favicon}
            onUpload={(img) => setFavicon(img)}
            onRemove={() => setFavicon(null)}
          />
        </div>
      </div>
    </div>
  );
}
