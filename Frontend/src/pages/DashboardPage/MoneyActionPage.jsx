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
