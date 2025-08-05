/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import dashboardImg from "../../assets/adminImages/sidebar/dashboard.svg";
import manageUserImg from "../../assets/adminImages/sidebar/paidUnpaid.png";
import ordersImg from "../../assets/adminImages/sidebar/orders.png";
import feedbackImg from "../../assets/adminImages/sidebar/feedback.png";
import tickerImg from "../../assets/adminImages/sidebar/ticker.png";
import paymentImg from "../../assets/adminImages/sidebar/payment.png";
import updatesImg from "../../assets/adminImages/sidebar/update.png";
import dataApiImg from "../../assets/adminImages/sidebar/dataApi.png";
import strategyImg from "../../assets/adminImages/sidebar/strategy.png";
import profileImg from "../../assets/adminImages/sidebar/profile.png";
import settingImg from "../../assets/adminImages/sidebar/setting.png";
import lockImg from "../../assets/adminImages/sidebar/lock.png";
// import { FaThreads } from "react-icons/fa6";
import { VscThreeBars } from "react-icons/vsc";
import { RxCross2 } from "react-icons/rx";

const menuItems = [
  { name: "Dashboard", icon: dashboardImg, path: "/admin" },
  {
    name: "User Paid/Unpaid",
    icon: manageUserImg,
    path: "manage-users",
  },
  { name: "Manage Orders", icon: ordersImg, path: "manage-orders" },
  { name: "Feedback", icon: feedbackImg, path: "feedback" },
  { name: "Ticker", icon: tickerImg, path: "ticker" },
  { name: "Payment Method", icon: paymentImg, path: "payment-method" },
  { name: "Updates", icon: updatesImg, path: "updates" },
  { name: "Data API", icon: dataApiImg, path: "data-api" },
  { name: "Our Strategy", icon: strategyImg, path: "our-strategy" },
  { name: "Stock Details", icon: strategyImg, path: "stockdetails" },
  { name: "Profile", icon: profileImg, path: "profile" },
  { name: "Setting", icon: settingImg, path: "setting" },
];

const Sidebar = ({ closeSidebar }) => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-20"
      } min-h-screen bg-[#060818] text-white p-4 flex flex-col transition-all duration-300`}
    >
      {/* === Toggle Button === */}
      <div className="flex justify-between items-center mb-8 px-2">
        {isOpen ? (
          <div className="text-xl font-bold">
            <span className="text-blue-500">T</span>
            <span className="text-white">rading</span>
            <span className="text-blue-500 ml-1">T</span>
            <span className="text-white">antra</span>
            <div className="text-xs text-gray-400">Powered by AI</div>
          </div>
        ) : (
          <span className="text-blue-500 text-xl font-bold">T</span>
        )}

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            closeSidebar();
          }}
          className="text-blue-400 text-xl"
        >
          {isOpen ? (
            // <img src={lockImg} alt="Close" className="w-6 h-6" />
            <RxCross2 className="w-6 h-6 text-white font-bold" />
          ) : (
            <VscThreeBars className="w-6 h-6 text-white font-bold" />
          )}
        </button>
      </div>

      {/* === Menu Items === */}
      <nav className="flex flex-col gap-4">
        {menuItems.map((item, index) => (
          <Link
            to={item.path}
            replace
            key={index}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
              location.pathname ===
              `${item.path === "/admin" ? item.path : `/admin/${item.path}`}`
                ? "bg-[#10172a] text-blue-400"
                : "hover:bg-[#10172a] text-white"
            }`}
            onClick={() => closeSidebar()}
          >
            <div className="flex items-center gap-3">
              <img
                src={item.icon}
                alt={`${item.name} icon`}
                className="w-5 h-5 text-blue-400" // same size as text-lg icon ~20px
                style={{
                  filter:
                    "invert(58%) sepia(80%) saturate(429%) hue-rotate(180deg) brightness(85%) contrast(85%)",
                }} // optional: color tint effect to match blue-400
              />
              {isOpen && <span>{item.name}</span>}
            </div>
            {isOpen && (
              <img
                src={lockImg}
                alt="Lock icon"
                className="w-4 h-4 text-blue-400"
                style={{
                  filter:
                    "invert(58%) sepia(80%) saturate(429%) hue-rotate(180deg) brightness(85%) contrast(85%)",
                }}
              />
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
