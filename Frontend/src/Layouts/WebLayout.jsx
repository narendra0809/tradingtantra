import React, { useEffect } from "react";
import Header from "../Components/Web/Header";
import { Outlet } from "react-router-dom";
import Footer from "../Components/Web/Footer";
import StockCarousel from "../Components/Web/StockCarousel";

const WebLayout = () => {
  useEffect(() => {
    document.body.style.backgroundColor = "#02000E";
    document.body.style.color = "#fff";
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <>
  <StockCarousel/>
      <Header />
      <main className="w-full px-[5%] cursor-default">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default WebLayout;
