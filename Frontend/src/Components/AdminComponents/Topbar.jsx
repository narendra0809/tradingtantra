/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { FiUser, FiLogOut, FiMenu, FiBell, FiSearch, FiHome } from "react-icons/fi";
import { useAdminAuth } from "../../contexts/adminContext/AdminAuthContext";
import ServerRestartButton from "./ServerRestartButton";

const Topbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { logout } = useAdminAuth();
  
  // Get admin context safely
  let admin = { firstName: "Admin", lastName: "", email: "admin@tradingtantra.com" };
  try {
    const context = useOutletContext();
    if (context) {
      admin = context.admin || admin;
    }
  } catch (e) {
    // Context not available, use default
  }

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsProfileOpen(false);
    if (isProfileOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isProfileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("adminAccessToken");
    window.location.href = "/admin";
  };

  // Get page title from location
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin") return "Dashboard";
    const pageName = path.split("/").pop().replace(/-/g, " ");
    return pageName.charAt(0).toUpperCase() + pageName.slice(1);
  };

  return (
    <div 
      className={`
        bg-gradient-to-r from-[#060818] via-[#0a0f1a] to-[#060818] 
        w-full text-white px-4 py-3 transition-all duration-300
        ${scrolled ? 'shadow-lg shadow-black/20' : ''}
        border-b border-white/5
      `}
    >
      <div className="flex items-center justify-between w-full">
        {/* Left side - Menu and Title */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
          >
            <FiMenu className="text-xl" />
          </button>

          {/* Page Title - Hidden on mobile */}
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-white">{getPageTitle()}</h1>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search Button - Hidden on small screens */}
          <button className="hidden lg:flex p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
            <FiSearch className="text-lg" />
          </button>

          {/* Notifications - Hidden on small screens */}
          <button className="hidden sm:flex p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white relative">
            <FiBell className="text-lg" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Server Restart Button */}
          <div className="hidden sm:block">
            <ServerRestartButton />
          </div>

          {/* Dashboard Button - Hidden on mobile */}
          <button
            onClick={() => navigate("/admin")}
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs px-4 py-2 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
          >
            <FiHome className="text-sm" />
            Dashboard
          </button>

          {/* Profile Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FiUser className="text-white text-sm" />
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-gradient-to-b from-[#0f172a] to-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-medium text-white">
                    {admin?.firstName} {admin?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{admin?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    onClick={() => {
                      navigate("/admin/profile");
                      setIsProfileOpen(false);
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <FiUser className="text-white text-xs" />
                    </div>
                    <span>Profile</span>
                  </button>
                  <button
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    onClick={handleLogout}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                      <FiLogOut className="text-white text-xs" />
                    </div>
                    <span>Logout</span>
                  </button>
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
