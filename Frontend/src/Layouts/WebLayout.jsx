import { useEffect, useState } from "react";
import Header from "../Components/Web/Header";
import { Outlet } from "react-router-dom";
import Footer from "../Components/Web/Footer";
import { TickerTape } from "react-ts-tradingview-widgets";
import { ADMIN_SERVER_URI } from "../pages/AdminPages/Home";
import axios from "axios";

const WebLayout = () => {
  const [tickers, setTickers] = useState([]);

  const fetchTickers = async () => {
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-tickers`);
      setTickers(res.data?.tickers || []);
    } catch (error) {
      console.log(error);
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

  return (
    <>
      <div className="">
        <TickerTape colorTheme="dark" isTransparent={true} symbols={tickers} />
      </div>
      <Header />
      <main className="w-full px-[5%] cursor-default">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default WebLayout;
