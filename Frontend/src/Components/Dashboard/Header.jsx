import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosNotifications } from "react-icons/io";
import userImg from "../../assets/Images/Dashboard/HeaderImg/user.png";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "../../contexts/Redux/Slices/themeSlice";
import logo from "../../assets/Images/logo.svg";
import whiteLogo from "../../assets/Images/whitelogo.png";
import darkThemeIcons from "../../assets/Images/Dashboard/HeaderImg/swingdark.png"; 
import lightThemeIcons from "../../assets/Images/Dashboard/HeaderImg/swinglight.png";
import hamburger from "../../assets/Images/hamburger.svg";
import { toggleSideBar } from "../../contexts/Redux/Slices/sidebarTogglerSlice";
import myPlan from "../../assets/Images/Dashboard/HeaderImg/myPlan.svg";
import myProfile from "../../assets/Images/Dashboard/HeaderImg/myProfile.svg";
import feedBack from "../../assets/Images/Dashboard/HeaderImg/feedBack.svg";
import darkThemeIcon from "../../assets/Images/Dashboard/HeaderImg/darkThemeIcon.png"; // Placeholder, replace with actual path
import lightThemeIcon from "../../assets/Images/Dashboard/HeaderImg/lightThemeIcon.png"; // Placeholder, replace with actual path
import Cookies from "js-cookie";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import logout1 from "../../assets/Images/Dashboard/HeaderImg/logout.svg";

const Header = () => {
  const [isSubscribed, setIsSubscribed] = useState(null);
  const [profileDropDown, setProfileDropDown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null); // Ref for the dropdown area
  const { theme: isDarkMode } = useSelector((state) => state.theme);
  const isOpen = useSelector((state) => state.sidebar.sideBarToggler);

  const dispatch = useDispatch();

  const { user, logout } = useAuth();

  const themeToggler = async () => {
    if (isDarkMode === "dark") {
      dispatch(setTheme("light"));
    } else {
      dispatch(setTheme("dark"));
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_SERVER_URI}/users/profile/toggle/theme`,
        {},
        { withCredentials: true }
      );
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const Subscribed = Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed === "true");
  }, []);

  useEffect(() => {
    if (isDarkMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropDown(false);
      }
    };

    if (profileDropDown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropDown]);

  return (
    <div className="relative bg-[#000517] dark:border dark:border-[#000B34] mt-2 sm:mt-2.5 h-14 sm:h-16 md:h-17 w-full mx-auto rounded-lg sm:rounded-[10px] p-2 sm:p-3 flex items-center justify-between not-dark:bg-primary-light gap-2 sm:gap-3 md:gap-4">
      {/* Logo in center when sidebar is closed */}
      {!isOpen && (
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
          <img
            src={isDarkMode === "dark" ? logo : whiteLogo}
            alt="logo"
            className="h-6 md:h-10 lg:h-12"
          />
        </div>
      )}

      {/* Left side - Hamburger Menu (Mobile) and Go to Website Button */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Hamburger Menu - Visible on mobile/tablet to open sidebar */}
        <img
          src={hamburger}
          alt="menu"
          className="w-5 h-5 sm:w-6 sm:h-6 xl:hidden block cursor-pointer not-dark:bg-db-secondary flex-shrink-0"
          onClick={() => dispatch(toggleSideBar(true))}
        />
        
        {/* Go to Website Button */}
        <button
          onClick={() => navigate("/")}
          className="px-2 sm:px-3 md:px-4 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-lg bg-gradient-to-b from-[#0256F5] to-[#74A4FE] text-white font-semibold text-[10px] xs:text-xs sm:text-sm md:text-base hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          Go to Website
        </button>
      </div>

      {/* Center - Logo on mobile when sidebar is open */}
      <div className="flex-1 flex items-center justify-center min-w-0">
        {isOpen && (
          <img
            src={isDarkMode === "dark" ? logo : whiteLogo}
            alt="logo"
            className="h-6 sm:h-8 xl:hidden block flex-shrink-0"
          />
        )}
      </div>

      <div className="flex-shrink-0 sm:w-1/2 flex justify-end gap-2 sm:gap-3 md:gap-5 items-center">
        <div
          onClick={() => {
            themeToggler();
          }}
          className="w-12 h-6 sm:w-14 sm:h-7 bg-[#EDEDED] dark:bg-[#000E40] rounded-full flex items-center p-1 cursor-pointer transition-all"
        >
          <div
            className={`w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center shadow-md transform transition-all ${
              isDarkMode === "light" ? "translate-x-5 sm:translate-x-6" : ""
            }`}
          >
            {isDarkMode === "dark" ? (
              <img src={darkThemeIcon} className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <img src={lightThemeIcon} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            )}
          </div>
        </div>

        <div className="relative" ref={dropdownRef}>
          <img
            onClick={() => setProfileDropDown(!profileDropDown)}
            src={userImg}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-sm cursor-pointer"
            alt=""
          />
          {profileDropDown && (
            <div className="absolute w-[240px] sm:w-[280px] space-y-4 sm:space-y-[30px] py-4 sm:py-5 px-3 sm:px-[15px] rounded-lg sm:rounded-[10px] bg-db-secondary not-dark:bg-primary-light right-0 top-12 sm:top-15 z-20 shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <img src={userImg} className="w-8 h-8 sm:w-10 sm:h-10 rounded-sm" alt="" />
                <div>
                  <p className="text-xs sm:text-sm truncate max-w-[140px] sm:max-w-none">{user?.displayName || "User"}</p>
                  <div className="text-[10px] sm:text-xs flex gap-2 sm:gap-3 items-center">
                    <p>Active now</p>
                    <p className="bg-primary px-1.5 sm:px-2 text-[9px] sm:text-[10px] rounded-full">
                      pro
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <button
                  className="flex gap-2 sm:gap-3 hover:font-semibold hover:text-blue-400 text-xs sm:text-sm w-full text-left"
                  onClick={() => {
                    navigate("/dashboard/profile");
                    setProfileDropDown(!profileDropDown);
                  }}
                >
                  <img src={myProfile} alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
                  <p>My Profile</p>
                </button>

                <button
                  className="flex gap-2 sm:gap-3 hover:font-semibold hover:text-blue-400 text-xs sm:text-sm w-full text-left"
                  onClick={() => {
                    navigate("/dashboard/plan");
                    setProfileDropDown(!profileDropDown);
                  }}
                >
                  <img src={myPlan} alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
                  <p>My Plan</p>
                </button>

                <button
                  className="flex gap-2 sm:gap-3 hover:font-semibold hover:text-blue-400 text-xs sm:text-sm w-full text-left"
                  onClick={() => {
                    navigate("/dashboard/feedback");
                    setProfileDropDown(!profileDropDown);
                  }}
                >
                  <img src={feedBack} alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
                  <p>Feedback</p>
                </button>
              </div>
              <div>
                <button
                  className="flex items-center gap-2 sm:gap-3 hover:font-semibold hover:text-red-400 text-xs sm:text-sm w-full text-left"
                  onClick={logout}
                >
                  <img src={logout1} alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
                  
                  {/* <img src={logout1} alt="" className="w-4 h-4 sm:w-5 sm:h-5" /> */}

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
