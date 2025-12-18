import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosNotifications } from "react-icons/io";
import userImg from "../../assets/Images/Dashboard/HeaderImg/user.png";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "../../contexts/Redux/Slices/themeSlice";
import logo from "../../assets/Images/logo.svg";
import hamburger from "../../assets/Images/hamburger.svg";
import { toggleSideBar } from "../../contexts/Redux/Slices/sidebarTogglerSlice";
import myPlan from "../../assets/Images/Dashboard/HeaderImg/myPlan.svg";
import myProfile from "../../assets/Images/Dashboard/HeaderImg/myProfile.svg";
import feedBack from "../../assets/Images/Dashboard/HeaderImg/feedBack.svg";
import whiteLogo from "../../assets/Images/whitelogo.png";
import darkThemeIcon from "../../assets/Images/Dashboard/HeaderImg/darkThemeIcon.png"; // Placeholder, replace with actual path
import lightThemeIcon from "../../assets/Images/Dashboard/HeaderImg/lightThemeIcon.png"; // Placeholder, replace with actual path
import Cookies from "js-cookie";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const Header = () => {
  const [hovered, setHovered] = useState(false);
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
    <div className="relative bg-[#000517] dark:border dark:border-[#000B34] mt-2.5   h-20 w-full mx-auto rounded-[10px] p-3 flex items-center justify-between not-dark:bg-primary-light">
      {!isOpen && isSubscribed && (
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
          <img
            src={isDarkMode === "dark" ? logo : whiteLogo}
            alt="logo"
            className="h-8 md:h-14"
          />
        </div>
      )}

      <div className="w-1/2 flex items-center gap-7">
        <button
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative overflow-hidden bg-linear-to-b from-[#0256F5] to-[#74A4FE] text-white px-6 py-3 rounded-lg h-12 w-30 lg:flex justify-center items-center hidden"
        >
          <motion.span
            initial={{ y: 0, opacity: 1 }}
            animate={hovered ? { y: -20, opacity: 0 } : { y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute"
          >
            <Link to="/">Go to Website</Link>
          </motion.span>

          <motion.span
            initial={{ y: 20, opacity: 0 }}
            animate={hovered ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute"
          >
            <Link to="/">Go to Website</Link>
          </motion.span>
        </button>

        <img
          src={hamburger}
          alt="icon"
          className="w-4 h-4 xl:hidden block cursor-pointer not-dark:bg-db-secondary"
          onClick={() => dispatch(toggleSideBar(!isOpen))}
        />

        {isSubscribed ? (
          <img
            src={isDarkMode === "dark" ? logo : whiteLogo}
            alt="logo"
            className="w-25 sm:hidden block"
          />
        ) : (
          <div className="p-[0.9px] rounded-lg bg-linear-to-b from-[#0A7CFF] to-transparent inline-block">
            <button
              onClick={() => navigate("/dashboard/plan")}
              className="block w-full h-full px-3 py-3 rounded-[calc(0.5rem-0.9px)] bg-[#0256F5] text-white"
            >
              Buy Now
            </button>
          </div>
        )}
      </div>

      <div className="w-1/2 flex justify-end gap-5 items-center">
        <div
          onClick={() => {
            themeToggler();
          }}
          className="w-14 h-7 bg-[#EDEDED]  dark:bg-[#000E40] rounded-full flex items-center p-1 cursor-pointer transition-all "
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

        {/* <IoIosNotifications
          onClick={() => navigate("/dashboard/notifications")}
          className="text-white not-dark:text-[#000E40] text-3xl"
        /> */}

        <div className="relative" ref={dropdownRef}>
          <img
            onClick={() => setProfileDropDown(!profileDropDown)}
            src={userImg}
            className="w-10 h-10 rounded-sm cursor-pointer"
            alt=""
          />
          {profileDropDown && (
            <div className="absolute w-[280px] space-y-[30px] py-5 px-[15px] rounded-[10px] bg-db-secondary not-dark:bg-primary-light  right-0 top-15 z-20">
              <div className="flex items-center gap-3">
                <img src={userImg} className="w-10 h-10 rounded-sm" alt="" />
                <div>
                  <p className="text-sm">{user.displayName}</p>
                  <div className="text-xs flex gap-3 items-center">
                    <p>Active now</p>
                    <p className=" bg-primary px-2 text-[10px] rounded-full text-xs">
                      pro
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  className="flex gap-3 hover:font-semibold hover:text-blue-400"
                  onClick={() => {
                    navigate("/dashboard/profile");
                    setProfileDropDown(!profileDropDown);
                  }}
                >
                  <img src={myProfile} alt="" />
                  <p>My Profile</p>
                </button>

                <button
                  className="flex gap-3 hover:font-semibold hover:text-blue-400"
                  onClick={() => {
                    navigate("/dashboard/plan");
                    setProfileDropDown(!profileDropDown);
                  }}
                >
                  <img src={myPlan} alt="" />
                  <p>My Plan</p>
                </button>

                <button
                  className="flex gap-3 hover:font-semibold hover:text-blue-400"
                  onClick={() => {
                    navigate("/dashboard/feedback");
                    setProfileDropDown(!profileDropDown);
                  }}
                >
                  <img src={feedBack} alt="" />
                  <p>Feedback</p>
                </button>
              </div>
              <div>
                <button
                  className="flex items-center gap-3 hover:font-semibold hover:text-red-400"
                  onClick={logout}
                >
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
