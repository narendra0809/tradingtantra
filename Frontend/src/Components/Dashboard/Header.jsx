import React, { useEffect, useState, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import user from "../../assets/Images/Dashboard/HeaderImg/user.png";
import lightThemeIcon from "../../assets/Images/Dashboard/HeaderImg/lightThemeIcon.png";
import darkThemeIcon from "../../assets/Images/Dashboard/HeaderImg/darkThemeIcon.png";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "../../contexts/Redux/Slices/themeSlice";
import logo from "../../assets/Images/logo.svg";
import hamburger from "../../assets/Images/hamburger.svg";
import { toggleSideBar } from "../../contexts/Redux/Slices/sidebarTogglerSlice";
import myPlan from "../../assets/Images/Dashboard/HeaderImg/myPlan.svg";
import myProfile from "../../assets/Images/Dashboard/HeaderImg/myProfile.svg";
import feedBack from "../../assets/Images/Dashboard/HeaderImg/feedBack.svg";
import logout from "../../assets/Images/Dashboard/HeaderImg/logout.svg";
import { useAuth } from "../../contexts/AuthContext";

const Header = () => {
  const [hovered, setHovered] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState("dark");
  const [profileDropDown, setProfileDropDown] = useState(false);
  const dropdownRef = useRef(null); // Ref for the dropdown area

  const isOpen = useSelector((state) => state.sidebar.sideBarToggler);

  const dispatch = useDispatch();

  const { logout } = useAuth();

  const themeToggler = () => {
    if (isDarkMode === "dark") {
      setIsDarkMode("light");
      dispatch(setTheme("light"));
    } else {
      setIsDarkMode("dark");
      dispatch(setTheme("dark"));
    }
  };

  useEffect(() => {
    if (isDarkMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropDown(false);
      }
    };

    // Add event listener when dropdown is open
    if (profileDropDown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup: Remove event listener on unmount or when dropdown closes
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropDown]); // Dependency on profileDropDown to add/remove listener dynamically

  return (
    <div className="bg-[#000517] border mt-2.5  border-[#000B34] h-20 w-full mx-auto rounded-[10px] p-3 flex items-center justify-between">
      <div className="w-1/2 flex items-center gap-2">
        <button
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative overflow-hidden bg-gradient-to-b from-[#0256F5] to-[#74A4FE] text-white px-6 py-3 rounded-lg h-12 w-30 sm:flex justify-center items-center hidden"
        >
          <motion.span
            initial={{ y: 0, opacity: 1 }}
            animate={hovered ? { y: -20, opacity: 0 } : { y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute"
          >
            Go to Website
          </motion.span>

          <motion.span
            initial={{ y: 20, opacity: 0 }}
            animate={hovered ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute"
          >
            Go to Website
          </motion.span>
        </button>

        <img
          src={hamburger}
          alt="icon"
          className="w-4 h-4 sm:hidden block cursor-pointer"
          onClick={() => dispatch(toggleSideBar(!isOpen))}
        />

        <img src={logo} alt="logo" className="w-25 h-20 sm:hidden block" />
      </div>

      <div className="w-1/2 flex justify-end gap-5 items-center">
        <div className="dark:bg-db-secondary bg-transparent border dark:border-[#0256F5] border-white px-2 py-2 rounded-lg hidden sm:flex">
          <input
            type="text"
            className="outline-none border-none bg-transparent text-white"
          />
          <FaSearch className="text-xl text-white" />
        </div>

        <div
          onClick={() => {
            themeToggler();
          }}
          className="w-14 h-7 bg-white dark:bg-[#000E40] rounded-full flex items-center p-1 cursor-pointer transition-all"
        >
          <div
            className={`w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md transform transition-all ${
              isDarkMode === "light" ? "translate-x-6" : ""
            }`}
          >
            {isDarkMode === "dark" ? (
              <img src={darkThemeIcon} className="w-5 h-5" />
            ) : (
              <img src={lightThemeIcon} className="w-5 h-5 text-yellow-500" />
            )}
          </div>
        </div>

        <IoIosNotifications className="text-white text-3xl" />

        <div className="relative" ref={dropdownRef}>
          <img
            onClick={() => setProfileDropDown(!profileDropDown)}
            src={user}
            className="w-10 h-10 rounded-sm cursor-pointer"
            alt=""
          />
          {profileDropDown && (
            <div className="absolute w-[280px] space-y-[30px] py-5 px-[15px] rounded-[10px] dark:bg-db-secondary bg-[#273D8F] text-white right-0 top-15 z-20">
              <div className="flex items-center gap-3">
                <img src={user} className="w-10 h-10 rounded-sm" alt="" />
                <div>
                  <p className="text-sm">JuliusCesar1014</p>
                  <div className="text-xs flex gap-3 items-center">
                    <p>Active now</p>
                    <p className="text-white bg-primary px-2 text-[10px] rounded-full text-xs">
                      pro
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <img src={myProfile} alt="" />
                  <p>My Profile</p>
                </div>
                <div className="flex gap-3">
                  <img src={myPlan} alt="" />
                  <p>My Plan</p>
                </div>
                <div className="flex gap-3">
                  <img src={feedBack} alt="" />
                  <p>Feedback</p>
                </div>
              </div>
              <div>
                {/* <button className="flex items-center gap-3" onClick={logout}> */}
                <button className="flex items-center gap-3" onClick={logout}>
                  <img src={logout} alt="" />
                  <p>Log out</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
