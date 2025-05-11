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
   const theme = useSelector((state) => state.theme.theme);

  // console.log(theme, "layout");
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
