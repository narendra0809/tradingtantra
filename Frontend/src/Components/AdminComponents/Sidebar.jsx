/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

// Import icons
import { VscThreeBars } from "react-icons/vsc";
import { RxCross2 } from "react-icons/rx";
import { FaHome, FaUsers, FaShoppingCart, FaTag, FaComment, FaChartLine, FaCreditCard, FaNewspaper, FaLightbulb, FaChartBar, FaUser, FaCog, FaAngleRight, FaDatabase } from "react-icons/fa";

const menuItems = [
  { name: "Dashboard", icon: FaHome, path: "/admin" },
  { name: "User Management", icon: FaUsers, path: "manage-users" },
  { name: "Manage Orders", icon: FaShoppingCart, path: "manage-orders" },
  { name: "Manage Coupon", icon: FaTag, path: "coupon" },
  { name: "Feedback", icon: FaComment, path: "feedback" },
  { name: "Ticker", icon: FaChartLine, path: "ticker" },
  { name: "Payment Method", icon: FaCreditCard, path: "payment-method" },
  { name: "Updates", icon: FaNewspaper, path: "updates" },
  { name: "Data API", icon: FaDatabase, path: "data-api" },
  { name: "Our Strategy", icon: FaLightbulb, path: "our-strategy" },
  { name: "Stock Details", icon: FaChartBar, path: "stockdetails" },
  { name: "Profile", icon: FaUser, path: "profile" },
  { name: "Setting", icon: FaCog, path: "setting" },
];

const Sidebar = ({ closeSidebar }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.includes(`/admin/${path}`);
  };

  return (
    <aside
      className={`
        ${isOpen ? "w-64" : "w-20"} 
        h-screen bg-gradient-to-b from-[#060818] via-[#0a0f1a] to-[#0d1424] 
        text-white flex flex-col transition-all duration-300 ease-in-out
        fixed md:sticky md:top-0 z-50
      `}
    >
      {/* === Toggle Button === */}
      <div className="flex justify-between items-center p-4 border-b border-white/5 flex-shrink-0">
        {isOpen ? (
          <div className="flex flex-col">
            <div className="text-xl font-bold tracking-wide">
              <span className="text-blue-500">T</span>
              <span className="text-white">rading</span>
              <span className="text-blue-500 ml-1">T</span>
              <span className="text-white">antra</span>
            </div>
            <span className="text-xs text-gray-500 mt-0.5">Powered by AI</span>
          </div>
        ) : (
          <span className="text-blue-500 text-2xl font-bold mx-auto">T</span>
        )}

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            closeSidebar && closeSidebar();
          }}
          className="p-2 rounded-lg hover:bg-white/5 transition-all duration-200 text-gray-400 hover:text-white"
        >
          {isOpen ? (
            <RxCross2 className="w-5 h-5" />
          ) : (
            <VscThreeBars className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* === Menu Items === */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={index}>
                <Link
                  to={item.path}
                  replace
                  onClick={() => closeSidebar && closeSidebar()}
                  onMouseEnter={() => setHoveredItem(index)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300
                    ${active 
                      ? "bg-gradient-to-r from-blue-600/20 to-blue-600/10 text-white border-l-4 border-blue-500" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }
                    ${hoveredItem === index && !active ? "translate-x-1" : ""}
                  `}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-white/5'}`}>
                    <Icon className={`text-sm transition-transform duration-300 ${hoveredItem === index ? 'scale-110' : ''}`} />
                  </div>
                  
                  {isOpen && (
                    <>
                      <span className="font-medium text-sm truncate">{item.name}</span>
                      {active && (
                        <FaAngleRight className="ml-auto text-xs animate-pulse" />
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* === Footer === */}
      {isOpen && (
        <div className="p-4 border-t border-white/5 flex-shrink-0">
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl p-4">
            <p className="text-xs text-gray-500 text-center">
              Admin Panel v2.0
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
