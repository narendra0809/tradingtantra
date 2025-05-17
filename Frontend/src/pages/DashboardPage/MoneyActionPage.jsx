import React, { useEffect, useState, Suspense, useRef } from "react";
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
import { io } from "socket.io-client";
import Cookies from "js-cookie";

// Lazy load components with debugging
const TwoDayHLBreak = React.lazy(() => {
  console.log("Attempting to load TwoDayHLBreak");
  return import("../../Components/Dashboard/Cards/Smart money action/TwoDayHLBreak")
    .then((module) => {
      console.log("TwoDayHLBreak module:", module);
      const component = module.default || module.TwoDayHLBreak;
      if (!component) {
        console.error("TwoDayHLBreak export missing");
        throw new Error("TwoDayHLBreak export missing");
      }
      console.log("TwoDayHLBreak loaded successfully");
      return { default: component };
    })
    .catch((err) => {
      console.error("Failed to load TwoDayHLBreak:", err);
      return { default: () => <div>Failed to load TwoDayHLBreak</div> };
    });
});
const DayHighLowReversal = React.lazy(() => {
  console.log("Attempting to load DayHighLowReversal");
  return import("../../Components/Dashboard/Cards/Smart money action/DayHighLowReversal")
    .then((module) => {
      console.log("DayHighLowReversal module:", module);
      const component = module.default || module.DayHighLowReversal;
      if (!component) {
        console.error("DayHighLowReversal export missing");
        throw new Error("DayHighLowReversal export missing");
      }
      console.log("DayHighLowReversal loaded successfully");
      return { default: component };
    })
    .catch((err) => {
      console.error("Failed to load DayHighLowReversal:", err);
      return { default: () => <div>Failed to load DayHighLowReversal</div> };
    });
});
const DailyRangeBreakout = React.lazy(() => {
  console.log("Attempting to load DailyRangeBreakout");
  return import("../../Components/Dashboard/Cards/Smart money action/DailyRangeBreakout")
    .then((module) => {
      console.log("DailyRangeBreakout module:", module);
      const component = module.default || module.DailyRangeBreakout;
      if (!component) {
        console.error("DailyRangeBreakout export missing");
        throw new Error("DailyRangeBreakout export missing");
      }
      console.log("DailyRangeBreakout loaded successfully");
      return { default: component };
    })
    .catch((err) => {
      console.error("Failed to load DailyRangeBreakout:", err);
      return { default: () => <div>Failed to load DailyRangeBreakout</div> };
    });
});
const AIMomentumCatcherTenMins = React.lazy(() => {
  console.log("Attempting to load AIMomentumCatcherTenMins");
  return import("../../Components/Dashboard/Cards/Smart money action/AIMomentumCatcherTenMins")
    .then((module) => {
      console.log("AIMomentumCatcherTenMins module:", module);
      const component = module.default || module.AIMomentumCatcherTenMins;
      if (!component) {
        console.error("AIMomentumCatcherTenMins export missing");
        throw new Error("AIMomentumCatcherTenMins export missing");
      }
      console.log("AIMomentumCatcherTenMins loaded successfully");
      return { default: component };
    })
    .catch((err) => {
      console.error("Failed to load AIMomentumCatcherTenMins:", err);
      return { default: () => <div>Failed to load AIMomentumCatcherTenMins</div> };
    });
});
const AIMomentumCatcherFiveMins = React.lazy(() => {
  console.log("Attempting to load AIMomentumCatcherFiveMins");
  return import("../../Components/Dashboard/Cards/Smart money action/AIMomentumCatcherFiveMins")
    .then((module) => {
      console.log("AIMomentumCatcherFiveMins module:", module);
      const component = module.default || module.AIMomentumCatcherFiveMins;
      if (!component) {
        console.error("AIMomentumCatcherFiveMins export missing");
        throw new Error("AIMomentumCatcherFiveMins export missing");
      }
      console.log("AIMomentumCatcherFiveMins loaded successfully");
      return { default: component };
    })
    .catch((err) => {
      console.error("Failed to load AIMomentumCatcherFiveMins:", err);
      return { default: () => <div>Failed to load AIMomentumCatcherFiveMins</div> };
    });
});
const AIIntradayReversalFiveMins = React.lazy(() => {
  console.log("Attempting to load AIIntradayReversalFiveMins");
  return import("../../Components/Dashboard/Cards/Smart money action/AIIntradayReversalFiveMins")
    .then((module) => {
      console.log("AIIntradayReversalFiveMins module:", module);
      const component = module.default || module.AIIntradayReversalFiveMins;
      if (!component) {
        console.error("AIIntradayReversalFiveMins export missing");
        throw new Error("AIIntradayReversalFiveMins export missing");
      }
      console.log("AIIntradayReversalFiveMins loaded successfully");
      return { default: component };
    })
    .catch((err) => {
      console.error("Failed to load AIIntradayReversalFiveMins:", err);
      return { default: () => <div>Failed to load AIIntradayReversalFiveMins</div> };
    });
});
const AIIntradayReversalDaily = React.lazy(() => {
  console.log("Attempting to load AIIntradayReversalDaily");
  return import("../../Components/Dashboard/Cards/Smart money action/AIIntradayReversalDaily")
    .then((module) => {
      console.log("AIIntradayReversalDaily module:", module);
      const component = module.default || module.AIIntradayReversalDaily;
      if (!component) {
        console.error("AIIntradayReversalDaily export missing");
        throw new Error("AIIntradayReversalDaily export missing");
      }
      console.log("AIIntradayReversalDaily loaded successfully");
      return { default: component };
    })
    .catch((err) => {
      console.error("Failed to load AIIntradayReversalDaily:", err);
      return { default: () => <div>Failed to load AIIntradayReversalDaily</div> };
    });
});

// Preload critical components statically
Promise.all([
  import("../../Components/Dashboard/Cards/Smart money action/TwoDayHLBreak"),
  import("../../Components/Dashboard/Cards/Smart money action/DayHighLowReversal"),
  import("../../Components/Dashboard/Cards/Smart money action/DailyRangeBreakout"),
]).catch((err) => console.error("Preload failed:", err));

const MonryActionPage = () => {
  const SOCKET_URI = import.meta.env.VITE_SOCKET_URI;
  const token = localStorage.getItem("token");
  const socket = io(SOCKET_URI, {
    auth: { token },
    transports: ["websocket"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  const [data, setData] = useState({
    twoDayHLBreak: [],
    dayHighLowReversal: [],
    dailyRangeBreakout: [],
    momentumCatcherTenMins: [],
    momentumCatcherFiveMins: [],
    intradayReversalFiveMins: [],
    intradayReversalDaily: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(null);
  const pendingUpdatesRef = useRef([]);
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current += 1;
    console.log(`MonryActionPage re-rendered ${renderCountRef.current} times`);

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
    let emitTime = Date.now();
    let debounceTimeout;

    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket Server:", socket.id);
      if (!isFetching) {
        emitDataRequest();
      }
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket Connection Error:", err.message);
      if (err.message.includes("Subscription required")) {
        alert("⚠️ Subscription Required: Please subscribe to access this feature.");
      }
      setTimeout(() => {
        emitTime = Date.now();
        console.log("Retrying getSmartMoneyActionData");
        socket.emit("getSmartMoneyActionData", { token });
      }, 1000);
    });

    // Batch and apply updates
    const applyUpdates = () => {
      if (pendingUpdatesRef.current.length > 0) {
        setData((prev) => ({
          ...prev,
          ...pendingUpdatesRef.current.reduce((acc, update) => ({ ...acc, ...update }), {}),
        }));
        pendingUpdatesRef.current = [];
        setLoading(false);
      }
    };

    // Define event handlers
    const handleTwoDayHLBreak = (data) => {
      console.log(`Received twoDayHLBreak after ${Date.now() - emitTime}ms:`, data);
      pendingUpdatesRef.current.push({ twoDayHLBreak: data?.data || [] });
      if (!debounceTimeout) {
        applyUpdates();
      }
    };

    const handleDayHighLowReversal = (data) => {
      console.log(`Received dayHighLowReversal after ${Date.now() - emitTime}ms:`, data);
      pendingUpdatesRef.current.push({ dayHighLowReversal: data?.data || [] });
      if (!debounceTimeout) {
        debounceTimeout = setTimeout(applyUpdates, 100);
      }
    };

    const handleDailyRangeBreakout = (data) => {
      console.log(`Received dailyRangeBreakout after ${Date.now() - emitTime}ms:`, data);
      pendingUpdatesRef.current.push({ dailyRangeBreakout: data?.data || [] });
      if (!debounceTimeout) {
        debounceTimeout = setTimeout(applyUpdates, 100);
      }
    };

    const handleMomentumCatcherTenMins = (data) => {
      console.log(`Received momentumCatcherTenMins after ${Date.now() - emitTime}ms:`, data);
      pendingUpdatesRef.current.push({ momentumCatcherTenMins: data?.data || [] });
      if (!debounceTimeout) {
        debounceTimeout = setTimeout(applyUpdates, 100);
      }
    };

    const handleMomentumCatcherFiveMins = (data) => {
      console.log(`Received momentumCatcherFiveMins after ${Date.now() - emitTime}ms:`, data);
      pendingUpdatesRef.current.push({ momentumCatcherFiveMins: data?.updatedData || [] });
      if (!debounceTimeout) {
        debounceTimeout = setTimeout(applyUpdates, 100);
      }
    };

    const handleAIIntradayReversalFiveMins = (data) => {
      console.log(`Received intradayReversalFiveMins after ${Date.now() - emitTime}ms:`, data);
      pendingUpdatesRef.current.push({ intradayReversalFiveMins: data?.data || [] });
      if (!debounceTimeout) {
        debounceTimeout = setTimeout(applyUpdates, 100);
      }
    };

    const handleAIIntradayReversalDaily = (data) => {
      console.log(`Received intradayReversalDaily after ${Date.now() - emitTime}ms:`, data);
      pendingUpdatesRef.current.push({ intradayReversalDaily: data?.data || [] });
      if (!debounceTimeout) {
        debounceTimeout = setTimeout(applyUpdates, 100);
      }
    };

    // Attach event listeners
    socket.on("twoDayHLBreak", handleTwoDayHLBreak);
    socket.on("DayHighLowReversal", handleDayHighLowReversal);
    socket.on("DailyRangeBreakout", handleDailyRangeBreakout);
    socket.on("AIMomentumCatcherTenMins", handleMomentumCatcherTenMins);
    socket.on("AIMomentumCatcherFiveMins", handleMomentumCatcherFiveMins);
    socket.on("AIIntradayReversalFiveMins", handleAIIntradayReversalFiveMins);
    socket.on("AIIntradayReversalDaily", handleAIIntradayReversalDaily);

    socket.on("error", (error) => {
      console.error("Socket error:", error);
      setError(error.message);
      setLoading(false);
    });

    // Emit getSmartMoneyActionData with retry
    const emitDataRequest = () => {
      emitTime = Date.now();
      console.log("Emitting getSmartMoneyActionData");
      socket.emit("getSmartMoneyActionData", { token });
      setIsFetching(true);
      pendingUpdatesRef.current = [];
    };

    // Initial emission with retry
    if (socket.connected) {
      emitDataRequest();
    } else {
      console.log("Socket not connected, waiting for connect event");
      const retryInterval = setInterval(() => {
        if (socket.connected) {
          emitDataRequest();
          clearInterval(retryInterval);
        }
      }, 500);
    }

    // Set up interval for periodic data fetching (15s)
    interval = setInterval(() => {
      emitTime = Date.now();
      console.log("Emitting getSmartMoneyActionData (interval)");
      socket.emit("getSmartMoneyActionData", { token });
      pendingUpdatesRef.current = [];
    }, 15000);

    // Cleanup
    return () => {
      socket.off("connect");
      socket.off("twoDayHLBreak");
      socket.off("DayHighLowReversal");
      socket.off("DailyRangeBreakout");
      socket.off("AIMomentumCatcherTenMins");
      socket.off("AIMomentumCatcherFiveMins");
      socket.off("AIIntradayReversalFiveMins");
      socket.off("AIIntradayReversalDaily");
      socket.off("error");
      socket.off("connect_error");
      clearInterval(interval);
      clearTimeout(debounceTimeout);
    };
  }, [isFetching, token]);

  return (
    <>
      <section className="grid lg:grid-cols-2 grid-col-1 gap-8 mt-10">
        <Suspense fallback={<div>Loading...</div>}>
          <AIMomentumCatcherFiveMins
            data={data.momentumCatcherFiveMins}
            loading={loading}
            isSubscribed={isSubscribed}
          />
          <AIMomentumCatcherTenMins
            data={data.momentumCatcherTenMins}
            loading={loading}
            isSubscribed={isSubscribed}
          />
          <AIIntradayReversalFiveMins
            data={data.intradayReversalFiveMins}
            loading={loading}
            isSubscribed={isSubscribed}
          />
          <AIIntradayReversalDaily
            data={data.intradayReversalDaily}
            loading={loading}
            isSubscribed={isSubscribed}
          />
          <DailyRangeBreakout
            data={data.dailyRangeBreakout}
            loading={loading}
            isSubscribed={isSubscribed}
          />
          <DayHighLowReversal
            data={data.dayHighLowReversal}
            loading={loading}
            isSubscribed={isSubscribed}
          />
          <TwoDayHLBreak
            data={data.twoDayHLBreak}
            loading={loading}
            isSubscribed={isSubscribed}
          />
        </Suspense>
      </section>
    </>
  );
};

export default MonryActionPage;