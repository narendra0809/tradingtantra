/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "../../assets/Images/logo.svg";
import logoLight from "../../assets/Images/logoLight.png";
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
import AiOptionInsider from "../../assets/Images/sidebar/AiOptionInsider.png";

const Sidebar = () => {
  // const theme = useSelector((state) => state.theme.theme);
  const [isSubscribed, setIsSubscribed] = useState(null);

  useEffect(() => {
    const Subscribed = Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed === "true");
  }, []);

  const isOpen = useSelector((state) => state.sidebar.sideBarToggler);
  const theme = useSelector((state) => state.theme.theme);

  const dispatch = useDispatch();
  const NAV_SECTIONS = [
    {
      label: "OPTIONS",
      items: [
        {
          icon: AiOptionInsider,
          label: "AI Option Insider",
          path: "/dashboard/option-insider",
        },
        {
          icon: AiOptionData,
          label: "AI Option Data",
          path: "/dashboard/option-data",
        },
        {
          icon: AiOptionClock,
          label: "AI Option Clock",
          path: "/dashboard/option-clock",
        },
      ],
    },
    {
      label: "STOCKS",
      items: [
        {
          icon: marketDepth,
          label: "AI Market Depth",
          path: "/dashboard/market-depth",
        },
        {
          icon: AiSectorDepth,
          label: "AI Sector Depth",
          path: "/dashboard/sector-depth",
        },
        {
          icon: AiSwing,
          label: "AI Swing Analysis",
          path: "/dashboard/swing-trades",
        },
        {
          icon: smartMoneyAction,
          label: "AI Smart Money Action",
          path: "/dashboard/smart-action",
        },
      ],
    },
    {
      label: "OTHERS",
      items: [
        {
          icon: FiiDii,
          label: "FII / DII Data",
          path: "/dashboard/fii-dii",
        },
        {
          icon: tradingJournal,
          label: "Trading Journal",
          path: "/dashboard/trading-journal",
        },
        {
          icon: learnFromUs,
          label: "Learn From Us",
          path: "/dashboard/learn-from-us",
        },
        {
          icon: ourStrategy,
          label: "Our Strategy",
          path: "/dashboard/our-strategy",
        },
        {
          icon: financialCalender,
          label: "Financial Calendar",
          path: "/dashboard/calender",
        },
        {
          icon: calculator,
          label: "Calculator",
          path: "/dashboard/calculator",
        },
        {
          icon: feedback,
          label: "Feedback Form",
          path: "/dashboard/feedback",
        },
        {
          icon: profit,
          label: "Profit",
          path: "/dashboard/profit",
        },
        {
          icon: updates,
          label: "Updates",
          path: "/dashboard/updates",
        },
      ],
    },
  ];

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
          className={`bg-[#000517] not-dark:bg-[#FFFFFF] text-[#D7E3FF] not-dark:text-[#000517] dark:border dark:border-[#000B34] h-full transition-all duration-300 rounded-lg overflow-hidden ${
            isOpen ? "w-64" : "w-20"
          }`}
        >
          {/* Fixed Header */}
          <div className="dark:bg-gradient-to-r from-[#000517] via-[#011459] to-[#000517] bg-clip-border not-dark:bg-[#FFFFFF]">
            <div className="flex items-center w-full h-fit justify-center bg-[#000517] not-dark:bg-[#FFFFFF]  py-5">
              {isOpen ? (
                <img src={theme === "dark" ? logo : logoLight} alt="logo" />
              ) : (
                <button
                  className="text-[#000517] dark:text-white w-fit p-2 mb-4 cursor-pointer"
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
                {NAV_SECTIONS.map((section) => (
                  <li key={section.label} className="w-full">
                    {isOpen && (
                      <div className="px-4 mb-2 text-[11px] font-semibold tracking-[0.15em] text-[#97A2C3] dark:text-[#8F9BCE] uppercase">
                        {section.label}
                      </div>
                    )}

                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <NavItem
                          key={item.path}
                          icon={item.icon}
                          label={item.label}
                          isOpen={isOpen}
                          path={item.path}
                          isSubscribed={isSubscribed}
                        />
                      ))}
                    </ul>
                  </li>
                ))}
                {/* NAV_SECTIONS already renders these items above; removed duplicates */}
              </ul>
              {/* <ul className="w-full space-y-5">
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
                <NavItem
                  icon={AiOptionClock}
                  label="Option Clock"
                  isOpen={isOpen}
                  path={"/dashboard/option-clock"}
                  isSubscribed={isSubscribed}
                />

                <NavItem
                  icon={indexDepth}
                  label="Index Depth"
                  isOpen={isOpen}
                  path={"/dashboard/index-depth"}
                  isSubscribed={isSubscribed}
                />
                <NavItem
                  icon={AiOptionData}
                  label="AI Option Data"
                  isOpen={isOpen}
                  path={"/dashboard/option-data"}
                  isSubscribed={isSubscribed}
                />
                <NavItem
                  icon={AiOptionInsider}
                  label="AI Option Insider"
                  isOpen={isOpen}
                  path={"/dashboard/option-insider"}
                  isSubscribed={isSubscribed}
                />
                <NavItem
                  icon={FiiDii}
                  label="FII / DII Data"
                  isOpen={isOpen}
                  path={"/dashboard/fii-dii"}
                  isSubscribed={isSubscribed}
                />
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
              </ul> */}
            </nav>
          </div>
        </div>
      </div>

      {/* Close Button (Fixed) */}
      <div
        className={` w-fit h-fit  flex items-center rounded-lg justify-center  ml-1 bg-[#000517] not-dark:bg-[#FFFFFF] not-dark:text-[#000517] ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <button
          className=" p-2 cursor-pointer"
          onClick={() => dispatch(toggleSideBar(!isOpen))}
        >
          <X size={24} />
        </button>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, isOpen, path, isSubscribed }) => {
  const theme = useSelector((state) => state.theme.theme);

  return (
    <NavLink
      to={path}
      end={path === "/dashboard"}
      className={({ isActive }) => {
        const activeClass =
          theme === "dark"
            ? "bg-gradient-to-r from-[#000517] via-[#011459] to-[#000517] border-l-4 border-blue-500 text-white"
            : "bg-[#0256F5] border-l-4 border-blue-500 text-white";

        const inactiveClass =
          theme === "dark"
            ? "hover:bg-gradient-to-r from-[#000517] via-[#011459] to-[#000517] text-white"
            : "hover:bg-[#0256F5] text-[#000517]";

        return `flex cursor-pointer items-center transition-all duration-300 ease-in-out group ${
          isActive ? activeClass : inactiveClass
        }`;
      }}
    >
      {({ isActive }) => (
        <li
          className={`flex items-center justify-between w-full px-4 py-2 rounded-md text-base font-medium space-x-4 transition-all duration-300 ease-in-out
          ${
            isActive
              ? "text-white"
              : theme === "dark"
              ? "text-white"
              : "text-[#000517] hover:text-white"
          }`}
        >
          <span className="flex items-center space-x-2">
            <img
              src={icon}
              alt={label}
              className={`w-auto h-5 transition-all duration-300
                ${
                  isActive
                    ? "brightness-0 invert" // active
                    : theme === "dark"
                    ? "brightness-200 group-hover:brightness-0 group-hover:invert" // dark + hover
                    : "brightness-0 group-hover:invert" // light + hover
                }`}
            />
            {isOpen && <span>{label}</span>}
          </span>

          {!isSubscribed && isOpen && (
            <svg width="24" height="24" viewBox="0 0 24 24">
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
      )}
    </NavLink>
  );
};

export default Sidebar;

/* eslint-disable react/prop-types */
// import { useEffect, useState } from "react";
// import { Menu, X } from "lucide-react";
// import logo from "../../assets/Images/logo.svg";
// import logoLight from "../../assets/Images/logoLight.png";
// import { RiLockFill } from "react-icons/ri";
// import AiOptionClock from "../../assets/Images/sidebar/AiOptionClock.svg";
// import AiOptionData from "../../assets/Images/sidebar/AiOptionData.svg";
// import AiSectorDepth from "../../assets/Images/sidebar/AiSectorDepth.svg";
// import AiSwing from "../../assets/Images/sidebar/AiSwing.svg";
// import calculator from "../../assets/Images/sidebar/calculator.svg";
// import feedback from "../../assets/Images/sidebar/feedback.svg";
// import FiiDii from "../../assets/Images/sidebar/FiiDii.svg";
// import financialCalender from "../../assets/Images/sidebar/financialCalender.svg";
// import indexDepth from "../../assets/Images/sidebar/indexDepth.svg";
// import learnFromUs from "../../assets/Images/sidebar/learnFromUs.svg";
// import marketDepth from "../../assets/Images/sidebar/marketDepth.svg";
// import ourStrategy from "../../assets/Images/sidebar/ourStrategy.svg";
// import profit from "../../assets/Images/sidebar/profit.svg";
// import smartMoneyAction from "../../assets/Images/sidebar/smartMoneyAction.svg";
// import tradingJournal from "../../assets/Images/sidebar/tradingJournal.svg";
// import updates from "../../assets/Images/sidebar/updates.svg";
// import dashboard from "../../assets/Images/sidebar/dashboard.svg";
// import Cookies from "js-cookie";
// import { NavLink } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { toggleSideBar } from "../../contexts/Redux/Slices/sidebarTogglerSlice";
// import AiOptionInsider from "../../assets/Images/sidebar/AiOptionInsider.png";

// const Sidebar = () => {
//   // const theme = useSelector((state) => state.theme.theme);
//   const [isSubscribed, setIsSubscribed] = useState(null);

//   useEffect(() => {
//     const Subscribed = Cookies.get("isSubscribed");
//     setIsSubscribed(Subscribed === "true");
//   }, []);

//   const isOpen = useSelector((state) => state.sidebar.sideBarToggler);
//   const theme = useSelector((state) => state.theme.theme);

//   const dispatch = useDispatch();
//   const NAV_SECTIONS = [
//     {
//       label: "OPTIONS",
//       items: [
//         {
//           icon: AiOptionInsider,
//           label: "AI Option Insider",
//           path: "/dashboard/option-insider",
//         },
//         {
//           icon: AiOptionData,
//           label: "AI Option Data",
//           path: "/dashboard/option-data",
//         },
//         {
//           icon: AiOptionClock,
//           label: "AI Option Clock",
//           path: "/dashboard/option-clock",
//         },
//       ],
//     },
//     {
//       label: "STOCKS",
//       items: [
//         {
//           icon: marketDepth,
//           label: "AI Market Depth",
//           path: "/dashboard/market-depth",
//         },
//         {
//           icon: AiSectorDepth,
//           label: "AI Sector Depth",
//           path: "/dashboard/sector-depth",
//         },
//         {
//           icon: AiSwing,
//           label: "AI Swing Analysis",
//           path: "/dashboard/swing-trades",
//         },
//         {
//           icon: smartMoneyAction,
//           label: "AI Smart Money Action",
//           path: "/dashboard/smart-action",
//         },
//       ],
//     },
//   ];

//   return (
//     <aside
//       className={`absolute top-0 left-0 md:static z-50 flex h-screen  ${
//         isOpen
//           ? "translate-x-0 sm:translate-x-0"
//           : "-translate-x-full sm:translate-x-0"
//       } `}
//     >
//       <div className="w-fit">
//         {/* Sidebar */}
//         <div
//           className={`bg-[#000517] not-dark:bg-[#FFFFFF] text-[#D7E3FF] not-dark:text-[#000517] dark:border dark:border-[#000B34] h-full transition-all duration-300 rounded-lg overflow-hidden ${
//             isOpen ? "w-64" : "w-20"
//           }`}
//         >
//           {/* Fixed Header */}
//           <div className="dark:bg-gradient-to-r from-[#000517] via-[#011459] to-[#000517] bg-clip-border not-dark:bg-[#FFFFFF]">
//             <div className="flex items-center w-full h-fit justify-center bg-[#000517] not-dark:bg-[#FFFFFF]  py-5">
//               {isOpen ? (
//                 <img src={theme === "dark" ? logo : logoLight} alt="logo" />
//               ) : (
//                 <button
//                   className="text-[#000517] dark:text-white w-fit p-2 mb-4 cursor-pointer"
//                   onClick={() => dispatch(toggleSideBar(!isOpen))}
//                 >
//                   <Menu size={24} />
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Scrollable Nav Section */}
//           <div className="overflow-y-auto h-[calc(100vh-100px)] px-2 scrollbar-hidden">
//             <nav className="flex flex-col items-start space-y-4  mt-8 ">
//               <ul className="w-full space-y-5">
//                 <NavItem
//                   icon={dashboard}
//                   label="Dashboard"
//                   isOpen={isOpen}
//                   path={"/dashboard"}
//                   isSubscribed={isSubscribed}
//                 />
//                 {NAV_SECTIONS.map((section) => (
//                   <NavDropdown
//                     key={section.label}
//                     label={section.label}
//                     icon={section.items[0]?.icon}
//                     items={section.items}
//                     isOpen={isOpen}
//                     isSubscribed={isSubscribed}
//                   />
//                 ))}
//                 <NavItem
//                   icon={FiiDii}
//                   label="FII / DII Data"
//                   isOpen={isOpen}
//                   path={"/dashboard/fii-dii"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={tradingJournal}
//                   label="Trading Journal"
//                   isOpen={isOpen}
//                   path={"/dashboard/trading-journal"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={learnFromUs}
//                   label="Learn From Us"
//                   isOpen={isOpen}
//                   path={"/dashboard/learn-from-us"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={ourStrategy}
//                   label="Our Strategy"
//                   isOpen={isOpen}
//                   path={"/dashboard/our-strategy"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={financialCalender}
//                   label="Financial Calendar"
//                   isOpen={isOpen}
//                   path={"/dashboard/calender"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={calculator}
//                   label="Calculator"
//                   isOpen={isOpen}
//                   path={"/dashboard/calculator"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={feedback}
//                   label="Feedback Form"
//                   isOpen={isOpen}
//                   path={"/dashboard/feedback"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={profit}
//                   label="Profit"
//                   isOpen={isOpen}
//                   path={"/dashboard/profit"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={updates}
//                   label="Updates"
//                   isOpen={isOpen}
//                   path={"/dashboard/updates"}
//                   isSubscribed={isSubscribed}
//                 />
//               </ul>
//               {/* <ul className="w-full space-y-5">
//                 <NavItem
//                   icon={dashboard}
//                   label="Dashboard"
//                   isOpen={isOpen}
//                   path={"/dashboard"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={marketDepth}
//                   label="AI Market Depth"
//                   isOpen={isOpen}
//                   path={"/dashboard/market-depth"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={smartMoneyAction}
//                   label="Smart Money Action"
//                   isOpen={isOpen}
//                   path={"/dashboard/smart-action"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={AiSectorDepth}
//                   label="AI Sector Depth"
//                   isOpen={isOpen}
//                   path={"/dashboard/sector-depth"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={AiSwing}
//                   label="AI Swing Analysis"
//                   isOpen={isOpen}
//                   path={"/dashboard/swing-trades"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={AiOptionClock}
//                   label="Option Clock"
//                   isOpen={isOpen}
//                   path={"/dashboard/option-clock"}
//                   isSubscribed={isSubscribed}
//                 />

//                 <NavItem
//                   icon={indexDepth}
//                   label="Index Depth"
//                   isOpen={isOpen}
//                   path={"/dashboard/index-depth"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={AiOptionData}
//                   label="AI Option Data"
//                   isOpen={isOpen}
//                   path={"/dashboard/option-data"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={AiOptionInsider}
//                   label="AI Option Insider"
//                   isOpen={isOpen}
//                   path={"/dashboard/option-insider"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={FiiDii}
//                   label="FII / DII Data"
//                   isOpen={isOpen}
//                   path={"/dashboard/fii-dii"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={tradingJournal}
//                   label="Trading Journal"
//                   isOpen={isOpen}
//                   path={"/dashboard/trading-journal"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={learnFromUs}
//                   label="Learn From Us"
//                   isOpen={isOpen}
//                   path={"/dashboard/learn-from-us"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={ourStrategy}
//                   label="Our Strategy"
//                   isOpen={isOpen}
//                   path={"/dashboard/our-strategy"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={financialCalender}
//                   label="Financial Calendar"
//                   isOpen={isOpen}
//                   path={"/dashboard/calender"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={calculator}
//                   label="Calculator"
//                   isOpen={isOpen}
//                   path={"/dashboard/calculator"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={feedback}
//                   label="Feedback Form"
//                   isOpen={isOpen}
//                   path={"/dashboard/feedback"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={profit}
//                   label="Profit"
//                   isOpen={isOpen}
//                   path={"/dashboard/profit"}
//                   isSubscribed={isSubscribed}
//                 />
//                 <NavItem
//                   icon={updates}
//                   label="Updates"
//                   isOpen={isOpen}
//                   path={"/dashboard/updates"}
//                   isSubscribed={isSubscribed}
//                 />
//               </ul> */}
//             </nav>
//           </div>
//         </div>
//       </div>

//       {/* Close Button (Fixed) */}
//       <div
//         className={` w-fit h-fit  flex items-center rounded-lg justify-center  ml-1 bg-[#000517] not-dark:bg-[#FFFFFF] not-dark:text-[#000517] ${
//           isOpen ? "block" : "hidden"
//         }`}
//       >
//         <button
//           className=" p-2 cursor-pointer"
//           onClick={() => dispatch(toggleSideBar(!isOpen))}
//         >
//           <X size={24} />
//         </button>
//       </div>
//     </aside>
//   );
// };

// const NavItem = ({ icon, label, isOpen, path, isSubscribed }) => {
//   const theme = useSelector((state) => state.theme.theme);

//   return (
//     <NavLink
//       to={path}
//       end={path === "/dashboard"}
//       className={({ isActive }) => {
//         const activeClass =
//           theme === "dark"
//             ? "bg-gradient-to-r from-[#000517] via-[#011459] to-[#000517] border-l-4 border-blue-500 text-white"
//             : "bg-[#0256F5] border-l-4 border-blue-500 text-white";

//         const inactiveClass =
//           theme === "dark"
//             ? "hover:bg-gradient-to-r from-[#000517] via-[#011459] to-[#000517] text-white"
//             : "hover:bg-[#0256F5] text-[#000517]";

//         return `flex cursor-pointer items-center transition-all duration-300 ease-in-out group ${
//           isActive  && path !=="#" ? activeClass : inactiveClass
//         }`;
//       }}
//     >
//       {({ isActive }) => (
//         <li
//           className={`flex items-center justify-between w-full px-4 py-2 rounded-md text-base font-medium space-x-4 transition-all duration-300 ease-in-out
//           ${
//             isActive
//               ? "text-white"
//               : theme === "dark"
//               ? "text-white"
//               : "text-[#000517] hover:text-white"
//           }`}
//         >
//           <span className="flex items-center space-x-2">
//             <img
//               src={icon}
//               alt={label}
//               className={`w-auto h-5 transition-all duration-300
//                 ${
//                   isActive
//                     ? "brightness-0 invert" // active
//                     : theme === "dark"
//                     ? "brightness-200 group-hover:brightness-0 group-hover:invert" // dark + hover
//                     : "brightness-0 group-hover:invert" // light + hover
//                 }`}
//             />
//             {isOpen && <span>{label}</span>}
//           </span>

//           {!isSubscribed && isOpen && (
//             <svg width="24" height="24" viewBox="0 0 24 24">
//               <defs>
//                 <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
//                   <stop offset="0%" stopColor="#0256F5" />
//                   <stop offset="100%" stopColor="#77A6FF" />
//                 </linearGradient>
//               </defs>
//               <RiLockFill size={24} fill="url(#gradient)" />
//             </svg>
//           )}
//         </li>
//       )}
//     </NavLink>
//   );
// };

// export default Sidebar;

// // Dropdown wrapper for main NavItem with submenu
// const NavDropdown = ({ label, icon, isOpen, items, isSubscribed }) => {
//   // hover state to control submenu visibility
//   const [hovered, setHovered] = useState(false);

//   return (
//     <div
//       className="relative flex flex-col"
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//     >
//       <NavItem
//         icon={icon}
//         label={label}
//         isOpen={isOpen}
//         path="#"
//         isSubscribed={isSubscribed}
//       />
//       {hovered && isOpen && (
//         <div className="ml-2 w-full  rounded-md shadow-lg z-50">
//           <ul className="py-2">
//             {items.map((item) => (
//               <NavItem
//                 key={item.path}
//                 icon={item.icon}
//                 label={item.label}
//                 isOpen={true}
//                 path={item.path}
//                 isSubscribed={isSubscribed}
//               />
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };
