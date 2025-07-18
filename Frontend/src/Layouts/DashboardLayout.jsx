/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import Sidebar from "../Components/Dashboard/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../Components/Dashboard/Header";
import Footer from "../Components/Web/Footer";
import { useDispatch, useSelector } from "react-redux";
import { TickerTape } from "react-ts-tradingview-widgets";

import { toggleSideBar } from "../contexts/Redux/Slices/sidebarTogglerSlice";
import axios from "axios";
import { ADMIN_SERVER_URI } from "../pages/AdminPages/Home";

const DashboardLayout = () => {
  const theme = useSelector((state) => state.theme.theme);
  const isSidebarOpen = useSelector((state) => state.sidebar.sideBarToggler);
  const dispatch = useDispatch();
  const location = useLocation();
  const mainContentRef = useRef(null);
  const [tickers, setTickers] = useState([
    {
      proName: "FOREXCOM:SPXUSD",
      title: "S&P 500",
    },
    {
      proName: "FOREXCOM:NSXUSD",
      title: "Nasdaq 100",
    },
    {
      proName: "FX_IDC:EURUSD",
      title: "EUR/USD",
    },
    {
      description: "BTC/USD",
      proName: "BITSTAMP:BTCUSD",
    },
    {
      description: "ETH/USD",
      proName: "BITSTAMP:ETHUSD",
    },
  ]);

  const fetchTickers = async () => {
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-tickers`);
      setTickers(res.data?.tickers || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTickers();
  }, []);
  // Handle theme changes
  useEffect(() => {
    if (theme === "dark") {
      document.body.style.backgroundColor = "#02000E";
      document.body.style.color = "#fff";
    } else {
      document.body.style.backgroundColor = "#E3EBFF";
      document.body.style.color = "#000";
    }
  }, [theme]);

  // Scroll to top on route change
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    // Close sidebar on mobile when navigating
    if (window.innerWidth <= 768 && isSidebarOpen) {
      dispatch(toggleSideBar());
    }
  }, [location.pathname]);

  // Handle mobile sidebar behavior
  useEffect(() => {
    if (window.innerWidth <= 768) {
      if (isSidebarOpen) {
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
      } else {
        document.body.style.overflow = "auto";
        document.body.style.position = "static";
      }
    }

    return () => {
      document.body.style.overflow = "auto";
      document.body.style.position = "static";
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen w-screen md:gap-5 gap-0 px-2 font-abcRepro">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen && window.innerWidth <= 768 ? "fixed z-50" : ""
        }`}
      >
        <Sidebar />
      </aside>

      {/* Main content area with scrollable container */}
      <main
        ref={mainContentRef}
        className="w-full overflow-y-auto overflow-x-hidden scrollbar-hidden transition-all duration-300 ease-linear"
      >
        <Header />
        <div
          className={`w-full mt-2 h-12 ${
            theme === "dark"
              ? "bg-transparent border-none"
              : "bg-[#273D8F] border border-[#8EA7EC] rounded-lg"
          }`}
        >
          <TickerTape
            colorTheme="dark"
            isTransparent={true}
            displayMode="regular"
            symbols={tickers}
            showSymbolLogo={true}
            locale="en"
            container_id="tradingview-widget-container"
          />
        </div>
        <Outlet />
        <Footer />
      </main>
    </div>
  );
};

export default DashboardLayout;
