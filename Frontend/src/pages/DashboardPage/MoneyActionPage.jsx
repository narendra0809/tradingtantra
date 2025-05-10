import React, { useEffect, useState } from "react";
import TreemapChart from "../../Components/Dashboard/TreemapChart";
import candles from "../../assets/Images/Dashboard/marketdepthpage/candles.png";
import { FaPlayCircle } from "react-icons/fa";
import { FcCandleSticks } from "react-icons/fc";
import StockCard from "../../Components/Dashboard/StockCard";
import LomShortTerm from "../../assets/Images/Dashboard/monryActionPage/LomShortTerm.png";
import LomLongTerm from "../../assets/Images/Dashboard/monryActionPage/LomLongTerm.png";
import contraction from "../../assets/Images/Dashboard/monryActionPage/Contraction.png";
import OneDayHL from "../../assets/Images/Dashboard/monryActionPage/oneDayHL.png";
import twoDayHL from "../../assets/Images/Dashboard/monryActionPage/twoDayHL.png";
import TwoDayHLBreak from "../../Components/Dashboard/Cards/Smart money action/TwoDayHLBreak";
import axios from "axios";
import DayHighLowReversal from "../../Components/Dashboard/Cards/Smart money action/DayHighLowReversal";
import DailyRangeBreakout from "../../Components/Dashboard/Cards/Smart money action/DailyRangeBreakout";
import AIMomentumCatcherTenMins from "../../Components/Dashboard/Cards/Smart money action/AIMomentumCatcherTenMins";
import AIMomentumCatcherFiveMins from "../../Components/Dashboard/Cards/Smart money action/AIMomentumCatcherFiveMins";
import AIIntradayReversalDaily from "../../Components/Dashboard/Cards/Smart money action/AIIntradayReversalDaily";
import AIIntradayReversalFiveMins from "../../Components/Dashboard/Cards/Smart money action/AIIntradayReversalFiveMins";
import { io } from "socket.io-client";
import Cookies from "js-cookie";

const MonryActionPage = () => {
  // const stockDataList = [

  //   {
  //     title: "AI Intraday Reversal (TF - 5 min)",
  //     img: LomShortTerm,
  //     price: "purchased",
  //     stocks: [
  //       {
  //         symbol: "KPITTECH",
  //         icon: "https://via.placeholder.com/20/00FF00",
  //         percent: 2.96,
  //         turnover: 332.89,
  //       },
  //       {
  //         symbol: "ZOMATO",
  //         icon: "https://via.placeholder.com/20/FF0000",
  //         percent: 6.72,
  //         turnover: 1.94,
  //       },
  //       {
  //         symbol: "TVS MOTOR",
  //         icon: "https://via.placeholder.com/20/FFA500",
  //         percent: 5.94,
  //         turnover: 0.77,
  //       },
  //       {
  //         symbol: "SUPER MEIND",
  //         icon: "https://via.placeholder.com/20/FF4500",
  //         percent: 5.64,
  //         turnover: 1.89,
  //       },
  //       {
  //         symbol: "SUPER MEIND",
  //         icon: "https://via.placeholder.com/20/FF4500",
  //         percent: 5.64,
  //         turnover: 1.89,
  //       },
  //       {
  //         symbol: "SUPER MEIND",
  //         icon: "https://via.placeholder.com/20/FF4500",
  //         percent: 5.64,
  //         turnover: 1.89,
  //       },
  //       {
  //         symbol: "SUPER MEIND",
  //         icon: "https://via.placeholder.com/20/FF4500",
  //         percent: 5.64,
  //         turnover: 1.89,
  //       },
  //       {
  //         symbol: "SUPER MEIND",
  //         icon: "https://via.placeholder.com/20/FF4500",
  //         percent: 5.64,
  //         turnover: 1.89,
  //       },
  //       {
  //         symbol: "SUPER MEIND",
  //         icon: "https://via.placeholder.com/20/FF4500",
  //         percent: 5.64,
  //         turnover: 1.89,
  //       },
  //     ],
  //   },
  //   {
  //     title: "AI Swing Reversal (TF - 15M)",
  //     img: LomLongTerm,
  //     price: "purchased",
  //     stocks: [
  //       {
  //         symbol: "HDFC",
  //         icon: "https://via.placeholder.com/20/008000",
  //         percent: 1.23,
  //         turnover: 125.3,
  //       },
  //       {
  //         symbol: "ICICI",
  //         icon: "https://via.placeholder.com/20/FF4500",
  //         percent: 2.45,
  //         turnover: 76.5,
  //       },
  //       {
  //         symbol: "TATA STEEL",
  //         icon: "https://via.placeholder.com/20/0000FF",
  //         percent: 3.78,
  //         turnover: 56.1,
  //       },
  //     ],
  //   },
  //   {
  //     title: "AI Swing Reversal (TF - 15M)",
  //     img: LomLongTerm,
  //     price: "purchased",
  //     stocks: [
  //       {
  //         symbol: "HDFC",
  //         icon: "https://via.placeholder.com/20/008000",
  //         percent: 1.23,
  //         turnover: 125.3,
  //       },
  //       {
  //         symbol: "ICICI",
  //         icon: "https://via.placeholder.com/20/FF4500",
  //         percent: 2.45,
  //         turnover: 76.5,
  //       },
  //       {
  //         symbol: "TATA STEEL",
  //         icon: "https://via.placeholder.com/20/0000FF",
  //         percent: 3.78,
  //         turnover: 56.1,
  //       },
  //     ],
  //   },
  //   {
  //     title: "AI Swing Reversal (TF - 15M)",
  //     img: LomLongTerm,
  //     price: "purchased",
  //     stocks: [
  //       {
  //         symbol: "HDFC",
  //         icon: "https://via.placeholder.com/20/008000",
  //         percent: 1.23,
  //         turnover: 125.3,
  //       },
  //       {
  //         symbol: "ICICI",
  //         icon: "https://via.placeholder.com/20/FF4500",
  //         percent: 2.45,
  //         turnover: 76.5,
  //       },
  //       {
  //         symbol: "TATA STEEL",
  //         icon: "https://via.placeholder.com/20/0000FF",
  //         percent: 3.78,
  //         turnover: 56.1,
  //       },
  //     ],
  //   },
  //   {
  //     title: "AI Range Breakout (TF - Daily)",
  //     img: contraction,
  //     price: "no",
  //     stocks: [
  //       {
  //         symbol: "IRCTC",
  //         icon: "https://via.placeholder.com/20/800080",
  //         percent: 4.11,
  //         turnover: 98.2,
  //       },
  //       {
  //         symbol: "YES BANK",
  //         icon: "https://via.placeholder.com/20/FFD700",
  //         percent: 1.98,
  //         turnover: 23.4,
  //       },
  //       {
  //         symbol: "BIOCON",
  //         icon: "https://via.placeholder.com/20/FF69B4",
  //         percent: 3.22,
  //         turnover: 45.8,
  //       },
  //     ],
  //   },
  //   {
  //     title: "Day H/L Reversal",
  //     img: OneDayHL,
  //     price: "no",
  //     stocks: [
  //       {
  //         symbol: "IRCTC",
  //         icon: "https://via.placeholder.com/20/800080",
  //         percent: 4.11,
  //         turnover: 98.2,
  //       },
  //       {
  //         symbol: "YES BANK",
  //         icon: "https://via.placeholder.com/20/FFD700",
  //         percent: 1.98,
  //         turnover: 23.4,
  //       },
  //       {
  //         symbol: "BIOCON",
  //         icon: "https://via.placeholder.com/20/FF69B4",
  //         percent: 3.22,
  //         turnover: 45.8,
  //       },
  //     ],
  //   },
  //   {
  //     title: "2 Day H/L BO",
  //     img: twoDayHL,
  //     price: "no",
  //     stocks: [
  //       {
  //         symbol: "IRCTC",
  //         icon: "https://via.placeholder.com/20/800080",
  //         percent: 4.11,
  //         turnover: 98.2,
  //       },
  //       {
  //         symbol: "YES BANK",
  //         icon: "https://via.placeholder.com/20/FFD700",
  //         percent: 1.98,
  //         turnover: 23.4,
  //       },
  //       {
  //         symbol: "BIOCON",
  //         icon: "https://via.placeholder.com/20/FF69B4",
  //         percent: 3.22,
  //         turnover: 45.8,
  //       },
  //     ],
  //   },
  // ];
  const SOCKET_URI = import.meta.env.VITE_SOCKET_URI;

  const token = localStorage.getItem("token");
  const socket = io(SOCKET_URI, {
    auth: { token },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("✅ Connected to WebSocket Server:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ WebSocket Connection Error:", err.message);
  });
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dayHLReversalRes, setDayHLReversalRes] = useState([]);
  const [DailyRangeBreakoutRes, setDailyRangeBreakoutRes] = useState([]);
  const [MomentumCatherTenMinRes, setMomentumCatherTenMinRes] = useState([]);
  const [MomentumCatherFiveMinRes, setMomentumCatherFiveMinRes] = useState([]);
  const [AIIntradayReversalFiveMinsRes, setAIIntradayReversalFiveMinsRes] =
    useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const [AIIntradayReversalDailyRes, setAIIntradayReversalDailyRes] = useState(
    []
  );

  const [isSubscribed, setIsSubscribed] = useState(null);
  useEffect(() => {
    const Subscribed =Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed);

    // Flag to check if any data has arrived

    let interval;

    // socket.emit("getData");

    if (!isFetching) {
      socket.emit("getSmartMoneyActionData", { token });
      setIsFetching(true);
    } else {
      interval = setInterval(() => {
        socket.emit("getSmartMoneyActionData", { token });
      }, 30000);
    }
    let hasDataArrived = false;

    // Define event handlers
    const handleTwoDayHLBreak = (data) => {
      setStocks(data.data);
      hasDataArrived = true;
      setLoading(false);
    };

    const handleDayHighLowReversal = (DhlRdata) => {
      setDayHLReversalRes(DhlRdata);
      hasDataArrived = true;
      setLoading(false);
    };

    const handleDailyRangeBreakout = (data) => {
      setDailyRangeBreakoutRes(data);
      hasDataArrived = true;
      setLoading(false);
    };

    const handleMomentumCatcherTenMins = (data) => {
      setMomentumCatherTenMinRes(data);
      hasDataArrived = true;
      setLoading(false);
    };

    const handleMomentumCatcherFiveMins = (data) => {
      setMomentumCatherFiveMinRes(data);
      hasDataArrived = true;
      setLoading(false);
    };

    const handleAIIntradayReversalFiveMins = (data) => {
      setAIIntradayReversalFiveMinsRes(data);
      hasDataArrived = true;
      setLoading(false);
    };
    const handleAIIntradayReversalDaily = (data) => {
      setAIIntradayReversalDailyRes(data);
      hasDataArrived = true;
      setLoading(false);
    };

    socket.on("connect_error", (err) => {
      console.warn("Socket Connection Error:", err.message);
      
      if (err.message.includes("Subscription required")) {
          alert("⚠️ Subscription Required: Please subscribe to access this feature.");
      }
  })  
    // Attach event listeners
    socket.on("twoDayHLBreak", handleTwoDayHLBreak);
    socket.on("DayHighLowReversal", handleDayHighLowReversal);
    socket.on("DailyRangeBreakout", handleDailyRangeBreakout);
    socket.on("AIMomentumCatcherTenMins", handleMomentumCatcherTenMins);
    socket.on("AIMomentumCatcherFiveMins", handleMomentumCatcherFiveMins);
    socket.on("AIIntradayReversalFiveMins", handleAIIntradayReversalFiveMins);
    socket.on("AIIntradayReversalDaily", handleAIIntradayReversalDaily);
     
    // Set a timeout to stop loading if no data is received
    // const timeout = setTimeout(() => {
    //   if (!hasDataArrived) {
    //     setLoading(false);
    //     console.log("No data received within the expected time.");
    //   }
    // }, 20000); // Adjust timeout duration as needed

    return () => {
      // Cleanup event listeners when component unmounts
      socket.off("twoDayHLBreak", handleTwoDayHLBreak);
      socket.off("DayHighLowReversal", handleDayHighLowReversal);
      socket.off("DailyRangeBreakout", handleDailyRangeBreakout);
      socket.off("AIMomentumCatcherTenMins", handleMomentumCatcherTenMins);
      socket.off("AIMomentumCatcherFiveMins", handleMomentumCatcherFiveMins);
      socket.off(
        "AIIntradayReversalFiveMins",
        handleAIIntradayReversalFiveMins
      );
      socket.off("AIIntradayReversalDaily", handleAIIntradayReversalDaily);
      socket.off("connect_error");
      clearInterval(interval);

      // clearTimeout(timeout);
    };
  }, [isFetching]);

  return (
    <>
      {/* // 5 MIN MOMENTUM SPIKE card  */}
      {/* <section className="dark:bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-2xl mt-10">
        <div className="dark:bg-db-primary bg-db-primary-light p-4 rounded-2xl">
          <div className="flex items-center gap-2">
            <img src={candles} alt="candle" className="w-15 object-contain" />
            <div>
              <h2 className=" text-xl font-semibold flex items-center gap-2">
                5 MIN MOMENTUM SPIKE <FcCandleSticks />
              </h2>
              <p className="dark:text-gray-400  text-sm flex items-center gap-2">
                How to use <FaPlayCircle className="text-[#0256F5]" />{" "}
                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                  Live
                </span>
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl">
            <TreemapChart />
          </div>
        </div>
      </section> */}
      {/* 
// 10 MIN MOMENTUM SPIKE card */}

      {/* <section className="dark:bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-2xl mt-10">
        <div className="dark:bg-db-primary bg-db-primary-light p-4 rounded-2xl">
          <div className="flex items-center gap-2">
            <img src={candles} alt="candle" className="w-15 object-contain" />
            <div>
              <h2 className=" text-xl font-semibold flex items-center gap-2">
                10 MIN MOMENTUM SPIKE <FcCandleSticks />
              </h2>
              <p className="dark:text-gray-400 text-sm flex items-center gap-2">
                How to use <FaPlayCircle className="text-[#0256F5]" />{" "}
                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                  Live
                </span>
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl">
            <TreemapChart />
          </div>
        </div>
      </section> */}

      {/* stock cards section */}

      <section className="grid lg:grid-cols-2 grid-col-1 gap-8 mt-10">
        <AIMomentumCatcherFiveMins
          data={MomentumCatherFiveMinRes.updatedData}
          loading={loading}
          isSubscribed={isSubscribed}
        />
        <AIMomentumCatcherTenMins
          data={MomentumCatherTenMinRes.data}
          loading={loading}
          isSubscribed={isSubscribed}
        />
        <AIIntradayReversalFiveMins
          data={AIIntradayReversalFiveMinsRes.data}
          loading={loading}
          isSubscribed={isSubscribed}
        />
        <AIIntradayReversalDaily
          data={AIIntradayReversalDailyRes.data}
          loading={loading}
          isSubscribed={isSubscribed}
        />
        <DailyRangeBreakout
          data={DailyRangeBreakoutRes.data}
          loading={loading}
          isSubscribed={isSubscribed}
        />
        <DayHighLowReversal
          data={dayHLReversalRes.data}
          loading={loading}
          isSubscribed={isSubscribed}
        />
        <TwoDayHLBreak
          data={stocks}
          loading={loading}
          isSubscribed={isSubscribed}
        />
      </section>
    </>
  );
};

export default MonryActionPage;
