/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiBell,
  FiGlobe,
  FiUser,
  FiLogOut,
  FiMenu,
} from "react-icons/fi";

const Topbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      alert(`Searching for "${searchQuery}"...`);
      setSearchQuery("");
    }
  };

  return (
    <div className="bg-[#060818]  w-full max-w-[100%] text-white px-2 py-3 border-b border-[#1a1f33] shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Side - Hamburger + Dashboard Button */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu - only on small screens */}
          <button
            onClick={() => onToggleSidebar()}
            className="md:hidden text-white text-2xl p-1"
          >
            <FiMenu />
          </button>

          {/* Dashboard Button */}
          <button
            onClick={() => navigate("/admin")}
            className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] text-white text-xs px-4 py-1 rounded-md hover:opacity-90 transition-all border border-blue-500"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* Search Box */}
          <div className="flex items-center bg-[#0e1325] border border-gray-600 px-3 py-[5px] rounded-md w-40 sm:w-56 md:w-52">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-transparent outline-none text-sm placeholder-gray-400 w-full"
            />
            <button onClick={handleSearch}>
              <FiSearch className="ml-2 text-gray-400 cursor-pointer" />
            </button>
          </div>

          {/* Globe Icon */}
          <div className="bg-[#0e1325] border border-gray-600 p-2 rounded-full cursor-pointer hover:bg-[#1e293b]">
            <FiGlobe className="text-white text-sm" />
          </div>

          {/* Bell Icon */}
          <div className="bg-[#0e1325] border border-gray-600 p-2 rounded-full cursor-pointer hover:bg-[#1e293b]">
            <FiBell className="text-white text-sm" />
          </div>

          {/* Profile Dropdown */}
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
                    navigate("/profile");
                    setIsProfileOpen(false);
                  }}
                >
                  <FiUser className="text-blue-400" /> <span>Profile</span>
                </div>
                <div
                  className="flex items-center gap-2 px-4 py-2 hover:bg-[#1a1f33] cursor-pointer"
                  onClick={() => {
                    alert("You are now logged out.");
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
