import React, { useEffect, useState } from "react";
import StockCard from "../../Components/Dashboard/StockCard";
import meter from "../../assets/Images/Dashboard/marketdepthpage/meter.png";
import dayHigh from "../../assets/Images/Dashboard/marketdepthpage/dayHigh.png";
import Loader from "../../Components/Loader";
import HighPowerStock from "../../Components/Dashboard/Cards/HighPowerStock";
import { TopGainers, TopLoosers } from "../../Components/Dashboard/Cards/TopGainersAndLoosers";
import { io } from "socket.io-client";
import { DayHigh, DayLow } from "../../Components/Dashboard/Cards/DayHighandLow";
import { PreviousVolume } from "../../Components/Dashboard/Cards/PreviousVolume";
import Cookies from "js-cookie";

const MarketDepthPage = () => {
  const [turnOverData, setTurnOverData] = useState([]);
  const [dayHighBreakResponse, setDayHighBreakResponse] = useState([]);
  const [dayLowBreakResponse, setDayLowBreakResponse] = useState([]);
  const [getTopGainersAndLosersResponse, setGetTopGainersAndLosersResponse] = useState([]);
  const [previousDaysVolumeResponse, setPreviousDaysVolumeResponse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(null);

  const SOCKET_URI = import.meta.env.VITE_SOCKET_URI;
  const token = localStorage.getItem("token");

  const socket = io(`${SOCKET_URI}`, {
    auth: { token },
    transports: ["websocket"],
  });

  useEffect(() => {
    const Subscribed = Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed);
    setLoading(true);

    if (!token) {
      console.error("No token found in localStorage");
      setError("Authentication token missing");
      setLoading(false);
      return;
    }

    let interval;

    // Define event handlers
    const handleTurnOver = (data) => {
      console.log("Received turnOver:", data);
      setTurnOverData(data?.data);
      setLoading(false);
    };

    const handleDayLowBreak = (data) => {
      console.log("Received dayLowBreak:", data);
      setDayLowBreakResponse(data?.dayLowBreak);
      setLoading(false);
    };

    const handleDayHighBreak = (data) => {
      console.log("Received dayHighBreak:", data);
      setDayHighBreakResponse(data?.dayHighBreak);
      setLoading(false);
    };

    const handleTopGainersAndLosers = (data) => {
      console.log("Received topGainersAndLosers:", data);
      setGetTopGainersAndLosersResponse(data);
      setLoading(false);
    };

    const handlePreviousDaysVolume = (data) => {
      console.log("Received previousDaysVolume:", data);
      setPreviousDaysVolumeResponse(data?.combinedData);
      setLoading(false);
    };

    // Attach event listeners
    socket.on("turnOver", handleTurnOver);
    socket.on("dayLowBreak", handleDayLowBreak);
    socket.on("dayHighBreak", handleDayHighBreak);
    socket.on("getTopGainersAndLosers", handleTopGainersAndLosers);
    socket.on("previousDaysVolume", handlePreviousDaysVolume);

    socket.on("error", (error) => {
      console.error("Socket error:", error);
      setError(error.message);
      setLoading(false);
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket Connection Error:", err.message);
      if (err.message.includes("Subscription required")) {
        alert("⚠️ Subscription Required: Please subscribe to access this feature.");
      }
      // Retry after 5 seconds
      setTimeout(() => {
        socket.emit("getMarketDepthData", { token });
      }, 5000);
    });

    // Emit getMarketDepthData only after connection is established
    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket Server:", socket.id);
      if (!isFetching) {
        console.log("Emitting getMarketDepthData");
        socket.emit("getMarketDepthData", { token });
        setIsFetching(true);
      }
    });

    // Set up interval for periodic data fetching
    if (isFetching) {
      interval = setInterval(() => {
        console.log("Emitting getMarketDepthData (interval)");
        socket.emit("getMarketDepthData", { token });
      }, 45000);
    }

    // Cleanup
    return () => {
      socket.off("connect");
      socket.off("turnOver", handleTurnOver);
      socket.off("dayLowBreak", handleDayLowBreak);
      socket.off("dayHighBreak", handleDayHighBreak);
      socket.off("getTopGainersAndLosers", handleTopGainersAndLosers);
      socket.off("previousDaysVolume", handlePreviousDaysVolume);
      socket.off("error");
      socket.off("connect_error");
      clearInterval(interval);
    };
  }, [isFetching, token]);

  return (
    <section>
      <h1 className="text-3xl font-medium mt-5">Market Depth</h1>

      <div className="grid md:grid-cols-2 grid-cols-1 gap-6 w-full mt-10">
        <HighPowerStock
          data={turnOverData}
          loading={loading}
          isSubscribed={isSubscribed}
        />

        <PreviousVolume
          data={previousDaysVolumeResponse}
          loading={loading}
          error={error}
          isSubscribed={isSubscribed}
        />

        <DayHigh
          data={dayHighBreakResponse}
          loading={loading}
          error={error}
          isSubscribed={isSubscribed}
        />
        <DayLow
          data={dayLowBreakResponse}
          loading={loading}
          error={error}
          isSubscribed={isSubscribed}
        />

        <TopGainers
          data={getTopGainersAndLosersResponse?.topGainers}
          loading={loading}
          error={error}
          isSubscribed={isSubscribed}
        />
        <TopLoosers
          data={getTopGainersAndLosersResponse?.topLosers}
          loading={loading}
          error={error}
          isSubscribed={isSubscribed}
        />
      </div>
    </section>
  );
};

export default MarketDepthPage;