/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { FiTrash2, FiSettings, FiUpload, FiImage } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-hot-toast";
import logo from "../../assets/adminImages/logo.png";
import { ADMIN_SERVER_URI } from "./Home";
import AdminCard from "../../Components/AdminComponents/AdminCard";
import AdminButton from "../../Components/AdminComponents/AdminButton";
import AdminInput from "../../Components/AdminComponents/AdminInput";

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
    <AdminCard hoverEffect={false} className="w-full max-w-sm">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Image Preview */}
        <div className="bg-[#040724] rounded-xl w-full h-32 sm:w-28 sm:h-28 flex items-center justify-center overflow-hidden flex-shrink-0">
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

          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <label
              htmlFor={`${title}-file-input`}
              className={`bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded-md cursor-pointer flex items-center gap-2 ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <FiUpload size={14} />
              {uploading ? "Uploading..." : "Upload"}
            </label>
            {preview && preview !== logo && (
              <button
                onClick={handleRemove}
                className="text-gray-400 hover:text-red-500 text-sm flex items-center gap-1 transition-colors"
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
    </AdminCard>
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
    <div className="min-h-screen text-white p-4 sm:p-8 bg-[#000A2D]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <AdminCard gradient>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <FiSettings className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Settings & Upload</h2>
              <p className="text-sm text-gray-400">Manage maintenance mode and branding</p>
            </div>
          </div>
        </AdminCard>

        {/* Maintenance Mode Section */}
        <AdminCard>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <FiSettings className="text-blue-400" />
            Maintenance Mode
          </h3>

          {/* Toggle Switch */}
          <div className="flex items-center justify-between mb-6 p-4 bg-white/5 rounded-xl">
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
          <div className="space-y-4">
            <AdminInput
              label="Maintenance Message"
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="Enter maintenance message..."
            />
            <div className="flex gap-3">
              <AdminButton 
                variant="primary" 
                onClick={handleUpdateMessage}
                loading={loading}
                disabled={!maintenanceMessage.trim()}
              >
                Update Message
              </AdminButton>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="mt-6 flex items-center gap-2">
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
        </AdminCard>

        {/* Logo & Favicon Upload Section */}
        <AdminCard>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <FiImage className="text-purple-400" />
            Branding Upload
          </h3>
          <div className="flex flex-col md:flex-row items-start gap-6">
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
        </AdminCard>
      </div>
    </div>
  );
}
