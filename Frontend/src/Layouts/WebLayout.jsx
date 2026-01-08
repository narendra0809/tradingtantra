import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../Components/Web/Header";
import { Outlet } from "react-router-dom";
import Footer from "../Components/Web/Footer";
import { TickerTape } from "react-ts-tradingview-widgets";
import { ADMIN_SERVER_URI } from "../pages/AdminPages/Home";
import axios from "axios";
import { checkMaintenanceMode } from "../utils/checkMaintenance";

const WebLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
      if (res.data?.tickers && res.data.tickers.length > 0) {
        setTickers(res.data.tickers);
      }
    } catch (error) {
      console.log(error);
      // Keep default tickers if API fails
    }
  };
  useEffect(() => {
    document.body.style.backgroundColor = "#02000E";
    document.body.style.color = "#fff";
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    fetchTickers();
  }, []);

  // Check maintenance mode on mount and route changes
  useEffect(() => {
    const checkMaintenance = async () => {
      // Don't check maintenance for admin routes
      if (location.pathname.startsWith("/admin")) {
        return;
      }

      // Don't redirect if already on maintenance page
      if (location.pathname === "/maintenance") {
        return;
      }

      // Don't check maintenance for login/signup/auth pages
      if (
        location.pathname === "/login" ||
        location.pathname === "/signup" ||
        location.pathname === "/forget-password" ||
        location.pathname === "/reset-password" ||
        location.pathname === "/password-changed" ||
        location.pathname === "/otp"
      ) {
        return;
      }

      try {
        const { isMaintenance } = await checkMaintenanceMode();
        if (isMaintenance) {
          navigate("/maintenance", { replace: true });
        }
      } catch (error) {
        console.error("Error checking maintenance mode:", error);
      }
    };

    checkMaintenance();
  }, [location.pathname, navigate]);

  return (
    <>
      <div className="h-8 sm:h-9 md:h-10">
        <TickerTape 
          colorTheme="dark" 
          isTransparent={true} 
          symbols={tickers}
          displayMode="regular"
          showSymbolLogo={true}
          locale="en"
          container_id="tradingview-widget-container-web"
        />
      </div>
      <Header />
      <main className="w-full px-4 sm:px-6 md:px-[5%] cursor-default overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default WebLayout;
