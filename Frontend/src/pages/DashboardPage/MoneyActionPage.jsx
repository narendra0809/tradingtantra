/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import TwoDayHLBreak from "../../Components/Dashboard/Cards/Smart money action/TwoDayHLBreak";
import DayHighLowReversal from "../../Components/Dashboard/Cards/Smart money action/DayHighLowReversal";
import DailyRangeBreakout from "../../Components/Dashboard/Cards/Smart money action/DailyRangeBreakout";
import AIMomentumCatcherTenMins from "../../Components/Dashboard/Cards/Smart money action/AIMomentumCatcherTenMins";
import AIMomentumCatcherFiveMins from "../../Components/Dashboard/Cards/Smart money action/AIMomentumCatcherFiveMins";
import AIIntradayReversalDaily from "../../Components/Dashboard/Cards/Smart money action/AIIntradayReversalDaily";
import AIIntradayReversalFiveMins from "../../Components/Dashboard/Cards/Smart money action/AIIntradayReversalFiveMins";
import { io } from "socket.io-client";
import Cookies from "js-cookie";
import axios from "axios";

const MoneyActionPage = () => {
  const SOCKET_URI = import.meta.env.VITE_SOCKET_URI;
  const VITE_SERVER_URI = import.meta.env.VITE_SERVER_URI;

  const token = localStorage.getItem("token");
  const [socket, setSocket] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dayHLReversalRes, setDayHLReversalRes] = useState([]);
  const [DailyRangeBreakoutRes, setDailyRangeBreakoutRes] = useState([]);
  const [MomentumCatherTenMinRes, setMomentumCatherTenMinRes] = useState([]);
  const [MomentumCatherFiveMinRes, setMomentumCatherFiveMinRes] = useState([]);
  const [AIIntradayReversalFiveMinsRes, setAIIntradayReversalFiveMinsRes] =
    useState([]);
  const [AIIntradayReversalDailyRes, setAIIntradayReversalDailyRes] = useState(
    []
  );
  const [isSubscribed, setIsSubscribed] = useState(null);
  const [isMarketHours, setIsMarketHours] = useState(false);

  const checkMarketHours = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const day = now.getDay();
    const isWeekday = day >= 1 && day <= 5;

    const isMarketTime =
      (hours === 9 && minutes >= 15) ||
      (hours > 9 && hours < 15) ||
      (hours === 15 && minutes <= 30);

    return isWeekday && isMarketTime;
  };

  const fetchHistoricalData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${VITE_SERVER_URI}/smart-money-action`);
      if (response.status !== 200) {
        throw new Error("Fetch failed for Smart Money Action !");
      }
      const data = response.data;
      setMomentumCatherFiveMinRes(data[0].value.momentumFiveMins || []);
      setMomentumCatherTenMinRes(data[1].value.momentumTenMins || []);
      setAIIntradayReversalFiveMinsRes(
        data[2].value.intradayReversalFiveMin || []
      );
      setAIIntradayReversalDailyRes(data[3].value.intradayReversalDaily || []);
      setDailyRangeBreakoutRes(data[4].value.dailyRangeBreakout || []);
      setDayHLReversalRes(data[5].value.dailyHighLowReversal || []);
      setStocks(data[6].value.twoDayHighLowBreak || []);
    } catch (error) {
      console.error("Error fetching historical data:", error);
    } finally {
      setLoading(false);
    }
  };

  const initWebSocket = () => {
    const newSocket = io(SOCKET_URI, {
      auth: { token },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to WebSocket Server:", newSocket.id);
      newSocket.emit("getSmartMoneyActionData", { token });
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ WebSocket Connection Error:", err.message);
      if (err.message.includes("Subscription required")) {
        alert(
          "⚠️ Subscription Required: Please subscribe to access this feature."
        );
      }
    });

    newSocket.on("twoDayHLBreak", (data) => {
      setStocks(data);
      setLoading(false);
    });

    newSocket.on("DayHighLowReversal", (data) => {
      setDayHLReversalRes(data);
      setLoading(false);
    });

    newSocket.on("DailyRangeBreakout", (data) => {
      setDailyRangeBreakoutRes(data);
      setLoading(false);
    });

    newSocket.on("AIMomentumCatcherTenMins", (data) => {
      setMomentumCatherTenMinRes(data);
      setLoading(false);
    });

    newSocket.on("AIMomentumCatcherFiveMins", (data) => {
      console.log(data);
      setMomentumCatherFiveMinRes(data);
      setLoading(false);
    });

    newSocket.on("AIIntradayReversalFiveMins", (data) => {
      setAIIntradayReversalFiveMinsRes(data);
      setLoading(false);
    });

    newSocket.on("AIIntradayReversalDaily", (data) => {
      setAIIntradayReversalDailyRes(data);
      setLoading(false);
    });

    setSocket(newSocket);
    return newSocket;
  };

  useEffect(() => {
    const Subscribed = Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed === "true");

    const marketOpen = checkMarketHours();
    setIsMarketHours(marketOpen);

    if (marketOpen) {
      const ws = initWebSocket();

      const marketCheckInterval = setInterval(() => {
        const stillOpen = checkMarketHours();
        if (!stillOpen) {
          setIsMarketHours(false);

          if (ws) ws.disconnect();

          fetchHistoricalData();
        }
      }, 60000);

      return () => {
        clearInterval(marketCheckInterval);
        if (ws) ws.disconnect();
      };
    } else {
      fetchHistoricalData();
    }
  }, []);

  return (
    <>
      <section className="grid lg:grid-cols-2 grid-col-1 gap-8 mt-10">
        <AIMomentumCatcherFiveMins
          data={
            MomentumCatherFiveMinRes.updatedData ||
            MomentumCatherFiveMinRes.data ||
            MomentumCatherFiveMinRes
          }
          loading={loading}
          isSubscribed={isSubscribed}
          isLive={isMarketHours}
        />
        <AIMomentumCatcherTenMins
          data={MomentumCatherTenMinRes.data || MomentumCatherTenMinRes}
          loading={loading}
          isSubscribed={isSubscribed}
          isLive={isMarketHours}
        />
        <AIIntradayReversalFiveMins
          data={
            AIIntradayReversalFiveMinsRes.data || AIIntradayReversalFiveMinsRes
          }
          loading={loading}
          isSubscribed={isSubscribed}
          isLive={isMarketHours}
        />
        <AIIntradayReversalDaily
          data={AIIntradayReversalDailyRes.data || AIIntradayReversalDailyRes}
          loading={loading}
          isSubscribed={isSubscribed}
          isLive={isMarketHours}
        />
        <DailyRangeBreakout
          data={DailyRangeBreakoutRes.data || DailyRangeBreakoutRes}
          loading={loading}
          isSubscribed={isSubscribed}
          isLive={isMarketHours}
        />
        <DayHighLowReversal
          data={dayHLReversalRes.data || dayHLReversalRes}
          loading={loading}
          isSubscribed={isSubscribed}
          isLive={isMarketHours}
        />
        <TwoDayHLBreak
          data={stocks.data || stocks}
          loading={loading}
          isSubscribed={isSubscribed}
          isLive={isMarketHours}
        />
      </section>
    </>
  );
};

export default MoneyActionPage;
