import { useEffect, useState } from "react";
import { Home, User, Settings, Menu, X } from "lucide-react";
import logo from "../../assets/Images/logo.svg";
import { RiLockFill } from "react-icons/ri";
import AiOptionClock from "../../assets/Images/sidebar/AiOptionClock.svg";
import AiOptionData from "../../assets/Images/sidebar/AiOptionData.svg";
import AiSectorDepth from "../../assets/Images/sidebar/AiSectorDepth.svg";
import AiSwing from "../../assets/Images/sidebar/AiSwing.svg";
import calculator from "../../assets/Images/sidebar/calculator.svg";
import feedback from "../../assets/Images/sidebar/feedback.svg";
import FiiDii from "../../assets/Images/sidebar/FiiDii.svg";
import financialCalender from "../../assets/Images/sidebar/financialCalender.svg";
import indexDepth from "../../assets/Images/sidebar/indexDepth.svg";
import learnFromUs from "../../assets/Images/sidebar/learnFromUs.svg";
import marketDepth from "../../assets/Images/sidebar/marketDepth.svg";
import ourStrategy from "../../assets/Images/sidebar/ourStrategy.svg";
import profit from "../../assets/Images/sidebar/profit.svg";
import smartMoneyAction from "../../assets/Images/sidebar/smartMoneyAction.svg";
import tradingJournal from "../../assets/Images/sidebar/tradingJournal.svg";
import updates from "../../assets/Images/sidebar/updates.svg";
import dashboard from "../../assets/Images/sidebar/dashboard.svg";
import Cookies from "js-cookie";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleSideBar } from "../../contexts/Redux/Slices/sidebarTogglerSlice";

const Sidebar = () => {
  const [isSubscribed, setIsSubscribed] = useState(null);

  useEffect(() => {
    const Subscribed =Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed);
  }, []);

  const isOpen = useSelector((state) => state.sidebar.sideBarToggler);

  const dispatch = useDispatch();
  // const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={`absolute top-0 left-0 md:static z-50 flex h-screen  ${
        isOpen
          ? "translate-x-0 sm:translate-x-0"
          : "-translate-x-full sm:translate-x-0"
      } `}
    >
      <div className="w-fit">
        {/* Sidebar */}
        <div
          className={`bg-[#000517]    text-[#D7E3FF] border border-[#000B34] h-full transition-all duration-300 rounded-lg overflow-hidden ${
            isOpen ? "w-64" : "w-20"
          }`}
        >
          {/* Fixed Header */}
          <div className="border-b-2 border-transparent bg-gradient-to-r from-[#000517] via-[#011459] to-[#000517] bg-clip-border">
            <div className="flex items-center w-full h-fit justify-center bg-[#000517]   py-5">
              {isOpen ? (
                <img src={logo} alt="logo" />
              ) : (
                <button
                  className="text-white w-fit p-2 mb-4 cursor-pointer"
                  onClick={() => dispatch(toggleSideBar(!isOpen))}
                >
                  <Menu size={24} />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Nav Section */}
          <div className="overflow-y-auto h-[calc(100vh-100px)] px-2 scrollbar-hidden">
            <nav className="flex flex-col items-start space-y-4  mt-8 ">
              <ul className="w-full space-y-5">
                <NavItem
                  icon={dashboard}
                  label="Dashboard"
                  isOpen={isOpen}
                  path={"/dashboard"}
                  isSubscribed={isSubscribed}
                />
                <NavItem
                  icon={marketDepth}
                  label="AI Market Depth"
                  isOpen={isOpen}
                  path={"/dashboard/market-depth"}
                  isSubscribed={isSubscribed}
                />
                <NavItem
                  icon={smartMoneyAction}
                  label="Smart Money Action"
                  isOpen={isOpen}
                  path={"/dashboard/smart-action"}
                  isSubscribed={isSubscribed}
                />
                <NavItem
                  icon={AiSectorDepth}
                  label="AI Sector Depth"
                  isOpen={isOpen}
                  path={"/dashboard/sector-depth"}
                  isSubscribed={isSubscribed}
                />
                <NavItem
                  icon={AiSwing}
                  label="AI Swing Analysis"
                  isOpen={isOpen}
                  path={"/dashboard/swing-trades"}
                  isSubscribed={isSubscribed}
                />
                {/* <NavItem
                  icon={AiOptionClock}
                  label="Option Clock"
                  isOpen={isOpen}
                  path={"/dashboard/option-clock"}
                /> */}
                {/* <NavItem
                  icon={AiOptionData}
                  label="AI Option Data"
                  isOpen={isOpen}
                  path={"/dashboard/option-data"}
                /> */}
                <NavItem
                  icon={FiiDii}
                  label="FII / DII Data"
                  isOpen={isOpen}
                  path={"/dashboard/fii-dii"}
                  isSubscribed={isSubscribed}
                />
                {/* <NavItem
                  icon={indexDepth}
                  label="Index Depth"
                  isOpen={isOpen}
                  path={"/dashboard/index-depth"}
                /> */}
                <NavItem
                  icon={tradingJournal}
                  label="Trading Journal"
                  isOpen={isOpen}
                  path={"/dashboard/trading-journal"}
                  isSubscribed={isSubscribed}
                />
                <NavItem
                  icon={learnFromUs}
                  label="Learn From Us"
                  isOpen={isOpen}
                  path={"/dashboard/learn-from-us"}
                  isSubscribed={isSubscribed}
                />
                <NavItem
                  icon={ourStrategy}
                  label="Our Strategy"
                  isOpen={isOpen}
                  path={"/dashboard/our-strategy"}
                  isSubscribed={isSubscribed}
                />
                <NavItem
                  icon={financialCalender}
                  label="Financial Calendar"
                  isOpen={isOpen}
                  path={"/dashboard/calender"}
                  isSubscribed={isSubscribed}
                />
                <NavItem
                  icon={calculator}
                  label="Calculator"
                  isOpen={isOpen}
                  path={"/dashboard/calculator"}
                  isSubscribed={isSubscribed}
                />
                <NavItem
                  icon={feedback}
                  label="Feedback Form"
                  isOpen={isOpen}
                  path={"/dashboard/feedback"}
                  isSubscribed={isSubscribed}
                />
                <NavItem
                  icon={profit}
                  label="Profit"
                  isOpen={isOpen}
                  path={"/dashboard/profit"}
                  isSubscribed={isSubscribed}
                />
                <NavItem
                  icon={updates}
                  label="Updates"
                  isOpen={isOpen}
                  path={"/dashboard/updates"}
                  isSubscribed={isSubscribed}
                />
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Close Button (Fixed) */}
      <div
        className={` w-fit h-fit border flex items-center rounded-lg justify-center border-[#000B34] ml-1 bg-[#000517]  ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <button
          className="text-white p-2 cursor-pointer"
          onClick={() => dispatch(toggleSideBar(!isOpen))}
        >
          <X size={24} />
        </button>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, isOpen, path, isSubscribed }) => (
  <NavLink
    to={path}
    className={({ isActive }) =>
      ` 
    cursor-pointer flex
    ${
      isActive
        ? "bg-gradient-to-r from-[#000517] via-[#011459] to-[#000517] border-l-2 border-primary"
        : "hover:bg-gradient-to-r from-[#000517] via-[#011459] to-[#000517] text-white"
    }`
    }
    end
  >
    <li
      className={`flex  items-center justify-between w-full  px-4 py-2  rounded-md cursor-pointer text-base font-medium space-x-4 hover:bg-gradient-to-r from-[#000517] via-[#011459] to-[#000517] transition-all duration-300 ease-in-out  `}
    >
      <span className="flex items-center space-x-2 ">
        <img src={icon} alt={label} className="w-auto h-5" />
        {isOpen && <span>{label}</span>}
      </span>

      {isSubscribed === "false" && isOpen && (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0256F5" />
              <stop offset="100%" stopColor="#77A6FF" />
            </linearGradient>
          </defs>
          <RiLockFill size={24} fill="url(#gradient)" />
        </svg>
      )}
    </li>
  </NavLink>
);

export default Sidebar;
