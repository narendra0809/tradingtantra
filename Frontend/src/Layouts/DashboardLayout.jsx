import React, { useEffect } from "react";
import Sidebar from "../Components/Dashboard/Sidebar";
import { Outlet } from "react-router-dom";
import Header from "../Components/Dashboard/Header";
import StockCarouselForDashboard from "../Components/Dashboard/StockCarouselForDashboard";
import Footer from "../Components/Web/Footer";
import { useSelector } from "react-redux";
import { TickerTape } from "react-ts-tradingview-widgets";
import ScrollToTop from "../Components/Web/ScrollTop";
import { tickerSymbol } from "../utils/tickerSymbol";
const DashboardLayout = () => {
  // const TickerTapeSymbol = [
  //   { proName: "RELIANCE", description: "RELIANCE" },
  //   { proName: "TCS", description: "TCS" },
  //   { proName: "INFY", description: "INFOSYS" },
  //   { proName: "HDFCBANK", description: "HDFC BANK" },
  //   { proName: "ICICIBANK", description: "ICICI BANK" },
  //   { proName: "SBIN", description: "SBI" },
  //   { proName: "BHARTIARTL", description: "BHARTI AIRTEL" },
  //   { proName: "HCLTECH", description: "HCL TECH" },
  //   { proName: "LT", description: "L&T" },
  //   { proName: "ITC", description: "ITC" },
  //   { proName: "KOTAKBANK", description: "KOTAK BANK" },
  //   { proName: "ASIANPAINT", description: "ASIAN PAINTS" },
  //   { proName: "MARUTI", description: "MARUTI" },
  //   { proName: "HINDUNILVR", description: "HINDUSTAN UNILEVER" },
  //   { proName: "TITAN", description: "TITAN" },
  //   { proName: "ULTRACEMCO", description: "ULTRATECH CEMENT" },
  // ];
  const theme = useSelector((state) => state.theme.theme);

  console.log(theme, "layout");
  useEffect(() => {
    if (theme === "dark") {
      document.body.style.backgroundColor = "#02000E";
      document.body.style.color = "#fff";
    } else {
      document.body.style.backgroundColor = "#ededf0";
      document.body.style.color = "#000";
    }
  }, [theme]);

  return (
    <>
      <div className="flex h-screen w-screen md:gap-5 gap-0 px-2 font-abcRepro   ">
        <aside>
          <Sidebar />
        </aside>

        <main className="w-full overflow-y-auto overflow-x-hidden scrollbar-hidden transition-all duration-300 ease-linear">
          <Header />
          <TickerTape
            colorTheme={`${theme === "dark" ? "dark" : "light"}`}
            isTransparent={true}
            symbols={tickerSymbol}
          ></TickerTape>
          <ScrollToTop />
          <Outlet />
          <Footer />
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;
