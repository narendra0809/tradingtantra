import { useState, useEffect } from "react";
import { FaDownload, FaTimes, FaSync } from "react-icons/fa";
import { APP_VERSION, VERSION_CHECK_URL } from "../../config/version";
import axios from "axios";

const UpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [deployedVersion, setDeployedVersion] = useState("");
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check for updates on mount
    const checkForUpdates = async () => {
      try {
        // Check backend for version
        const res = await axios.get(VERSION_CHECK_URL, { timeout: 5000 });
        
        if (res.data && res.data.success) {
          const backendVersion = res.data.version;
          setDeployedVersion(backendVersion);
          
          // Compare versions
          if (backendVersion !== APP_VERSION) {
            setUpdateAvailable(true);
            // Store for comparison
            localStorage.setItem("deployedVersion", backendVersion);
          } else {
            localStorage.setItem("deployedVersion", APP_VERSION);
          }
        }
      } catch (error) {
        console.log("Version check failed, using localStorage fallback");
        // Fallback to localStorage check
        const storedVersion = localStorage.getItem("deployedVersion");
        if (storedVersion && storedVersion !== APP_VERSION) {
          setDeployedVersion(storedVersion);
          setUpdateAvailable(true);
        } else {
          localStorage.setItem("deployedVersion", APP_VERSION);
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkForUpdates();
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("updateDismissed", "true");
  };

  // Check if dismissed previously (only for same version)
  useEffect(() => {
    const wasDismissed = localStorage.getItem("updateDismissed");
    const lastVersion = localStorage.getItem("deployedVersion");
    
    if (wasDismissed === "true" && lastVersion === deployedVersion) {
      setDismissed(true);
    } else if (lastVersion !== deployedVersion) {
      // Reset dismissal if version changed
      setDismissed(false);
      localStorage.setItem("updateDismissed", "false");
    }
  }, [deployedVersion]);

  if (isChecking) {
    return null; // Don't show anything while checking
  }

  if (!updateAvailable || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl shadow-2xl flex items-center gap-4 max-w-sm">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <FaDownload className="text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">New Update Available!</h4>
          <p className="text-xs text-white/80">
            Version {deployedVersion} is now available. Click to refresh.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Dismiss"
          >
            <FaTimes className="text-sm" />
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 bg-white text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <FaSync className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
