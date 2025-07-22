/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiLogOut, FiMenu } from "react-icons/fi";
import { useAdminAuth } from "../../contexts/adminContext/AdminAuthContext";
import ServerRestartButton from "./ServerRestartButton";

const Topbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { logout } = useAdminAuth();

  return (
    <div className="bg-[#060818] w-full text-white px-4 py-3 border-b border-[#1a1f33] shadow-sm">
      <div className="flex items-center justify-between w-full min-w-0">
        {" "}
        {/* Added min-w-0 */}
        {/* Left side - Menu and Dashboard button */}
        <div className="flex items-center gap-3 min-w-0 overflow-hidden">
          {" "}
          {/* Added overflow-hidden */}
          <button
            onClick={() => onToggleSidebar()}
            className="md:hidden text-white text-2xl p-1 flex-shrink-0"
          >
            <FiMenu />
          </button>
          <button
            onClick={() => navigate("/admin")}
            className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] text-white text-xs px-4 py-1 rounded-md hover:opacity-90 transition-all border border-blue-500 whitespace-nowrap truncate"
          >
            Go to Dashboard
          </button>
          <ServerRestartButton />
        </div>
        {/* Right side - Profile */}
        <div className="flex-shrink-0 ml-2">
          {" "}
          {/* Simplified and added flex-shrink-0 */}
          <div className="relative">
            <img
              src="https://i.pravatar.cc/32"
              alt="User"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 rounded-full border border-gray-600 object-cover cursor-pointer"
            />
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 bg-[#0e1325] border border-gray-700 rounded-md shadow-lg w-40 z-50">
                <div
                  className="flex items-center gap-2 px-4 py-2 hover:bg-[#1a1f33] cursor-pointer"
                  onClick={() => {
                    navigate("/admin/profile");
                    setIsProfileOpen(false);
                  }}
                >
                  <FiUser className="text-blue-400" /> <span>Profile</span>
                </div>
                <div
                  className="flex items-center gap-2 px-4 py-2 hover:bg-[#1a1f33] cursor-pointer"
                  onClick={() => {
                    logout();
                    setIsProfileOpen(false);
                  }}
                >
                  <FiLogOut className="text-blue-400" /> <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Topbar;
