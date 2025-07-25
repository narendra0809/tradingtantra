/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, Suspense } from "react";
import { io } from "socket.io-client";
import Cookies from "js-cookie";
import axios from "axios";

// Lazy load components with enhanced debugging and normalization
// const StockCard = React.lazy(async () => {
//   console.log("Attempting to load StockCard");
//   try {
//     const module = await import("../../Components/Dashboard/StockCard");
//     console.log("StockCard module:", module);
//     const component = module.default || module.StockCard;
//     if (!component) {
//       console.error("StockCard export missing (no default or named export)");
//       throw new Error("StockCard export missing");
//     }
//     console.log("StockCard loaded successfully");
//     return { default: component };
//   } catch (err) {
//     console.error("Failed to load StockCard:", err);
//     return { default: () => <div>Failed to load StockCard</div> };
//   }
// });
// const Loader = React.lazy(async () => {
//   console.log("Attempting to load Loader");
//   try {
//     const module = await import("../../Components/Loader");
//     console.log("Loader module:", module);
//     const component = module.default || module.Loader;
//     if (!component) {
//       console.error("Loader export missing (no default or named export)");
//       throw new Error("Loader export missing");
//     }
//     console.log("Loader loaded successfully");
//     return { default: component };
//   } catch (err) {
//     console.error("Failed to load Loader:", err);
//     return { default: () => <div>Loading...</div> };
//   }
// });
const HighPowerStock = React.lazy(async () => {
  console.log("Attempting to load HighPowerStock");
  try {
    const module = await import(
      "../../Components/Dashboard/Cards/HighPowerStock"
    );
    console.log("HighPowerStock module:", module);
    const component = module.default || module.HighPowerStock;
    if (!component) {
      console.error(
        "HighPowerStock export missing (no default or named export)"
      );
      throw new Error("HighPowerStock export missing");
    }
    console.log("HighPowerStock loaded successfully");
    return { default: component };
  } catch (err) {
    console.error("Failed to load HighPowerStock:", err);
    return { default: () => <div>Failed to load HighPowerStock</div> };
  }
});
const TopGainers = React.lazy(async () => {
  console.log("Attempting to load TopGainers");
  try {
    const module = await import(
      "../../Components/Dashboard/Cards/TopGainersAndLoosers"
    );
    console.log("TopGainersAndLoosers module:", module);
    if (!module.TopGainers) {
      console.error("TopGainers export missing in TopGainersAndLoosers");
      throw new Error("TopGainers export missing");
    }
    console.log("TopGainers loaded successfully");
    return { default: module.TopGainers };
  } catch (err) {
    console.error("Failed to load TopGainers:", err);
    return { default: () => <div>Failed to load TopGainers</div> };
  }
});
const TopLoosers = React.lazy(async () => {
  console.log("Attempting to load TopLoosers");
  try {
    const module = await import(
      "../../Components/Dashboard/Cards/TopGainersAndLoosers"
    );
    console.log("TopGainersAndLoosers module:", module);
    if (!module.TopLoosers) {
      console.error("TopLoosers export missing in TopGainersAndLoosers");
      throw new Error("TopLoosers export missing");
    }
    console.log("TopLoosers loaded successfully");
    return { default: module.TopLoosers };
  } catch (err) {
    console.error("Failed to load TopLoosers:", err);
    return { default: () => <div>Failed to load TopLoosers</div> };
  }
});
const DayHigh = React.lazy(async () => {
  console.log("Attempting to load DayHigh");
  try {
    const module = await import(
      "../../Components/Dashboard/Cards/DayHighandLow"
    );
    console.log("DayHighandLow module:", module);
    if (!module.DayHigh) {
      console.error("DayHigh export missing in DayHighandLow");
      throw new Error("DayHigh export missing");
    }
    console.log("DayHigh loaded successfully");
    return { default: module.DayHigh };
  } catch (err) {
    console.error("Failed to load DayHigh:", err);
    return { default: () => <div>Failed to load DayHigh</div> };
  }
});
const DayLow = React.lazy(async () => {
  console.log("Attempting to load DayLow");
  try {
    const module = await import(
      "../../Components/Dashboard/Cards/DayHighandLow"
    );
    console.log("DayHighandLow module:", module);
    if (!module.DayLow) {
      console.error("DayLow export missing in DayHighandLow");
      throw new Error("DayLow export missing");
    }
    console.log("DayLow loaded successfully");
    return { default: module.DayLow };
  } catch (err) {
    console.error("Failed to load DayLow:", err);
    return { default: () => <div>Failed to load DayLow</div> };
  }
});
const PreviousVolume = React.lazy(async () => {
  console.log("Attempting to load PreviousVolume");
  try {
    const module = await import(
      "../../Components/Dashboard/Cards/PreviousVolume"
    );
    console.log("PreviousVolume module:", module);
    const component = module.default || module.PreviousVolume;
    if (!component) {
      console.error(
        "PreviousVolume export missing (no default or named export)"
      );
      throw new Error("PreviousVolume export missing");
    }
    console.log("PreviousVolume loaded successfully");
    return { default: component };
  } catch (err) {
    console.error("Failed to load PreviousVolume:", err);
    return { default: () => <div>Failed to load PreviousVolume</div> };
  }
});

// const MarketDepthPage = () => {
//   const [turnOverData, setTurnOverData] = useState([]);
//   const [dayHighBreakResponse, setDayHighBreakResponse] = useState([]);
//   const [dayLowBreakResponse, setDayLowBreakResponse] = useState([]);
//   const [getTopGainersAndLosersResponse, setGetTopGainersAndLosersResponse] =
//     useState([]);
//   const [previousDaysVolumeResponse, setPreviousDaysVolumeResponse] = useState(
//     []
//   );
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isFetching, setIsFetching] = useState(false);
//   const [isSubscribed, setIsSubscribed] = useState(null);

//   const SOCKET_URI = import.meta.env.VITE_SOCKET_URI;
//   const token = localStorage.getItem("token");

//   const socket = io(`${SOCKET_URI}`, {
//     auth: { token },
//     transports: ["websocket"],
//   });

//   useEffect(() => {
//     const Subscribed = Cookies.get("isSubscribed");
//     setIsSubscribed(Subscribed==="true");
//     setLoading(true);

//     if (!token) {
//       console.error("No token found in localStorage");
//       setError("Authentication token missing");
//       setLoading(false);
//       return;
//     }

//     let interval;

//     // Define event handlers
//     const handleTurnOver = (data) => {
//       console.log("Received turnOver:", data);
//       setTurnOverData(data?.data);
//       setLoading(false);
//     };

//     const handleDayLowBreak = (data) => {
//       console.log("Received dayLowBreak:", data);
//       setDayLowBreakResponse(data?.dayLowBreak);
//       setLoading(false);
//     };

//     const handleDayHighBreak = (data) => {
//       console.log("Received dayHighBreak:", data);
//       setDayHighBreakResponse(data?.dayHighBreak);
//       setLoading(false);
//     };

//     const handleTopGainersAndLosers = (data) => {
//       console.log("Received topGainersAndLosers:", data);
//       setGetTopGainersAndLosersResponse(data);
//       setLoading(false);
//     };

//     const handlePreviousDaysVolume = (data) => {
//       console.log("Received previousDaysVolume:", data);
//       setPreviousDaysVolumeResponse(data?.combinedData);
//       setLoading(false);
//     };

//     // Attach event listeners
//     socket.on("turnOver", handleTurnOver);
//     socket.on("dayLowBreak", handleDayLowBreak);
//     socket.on("dayHighBreak", handleDayHighBreak);
//     socket.on("getTopGainersAndLosers", handleTopGainersAndLosers);
//     socket.on("previousDaysVolume", handlePreviousDaysVolume);

//     socket.on("error", (error) => {
//       console.error("Socket error:", error);
//       setError(error.message);
//       setLoading(false);
//     });

//     socket.on("connect_error", (err) => {
//       console.warn("Socket Connection Error:", err.message);
//       if (err.message.includes("Subscription required")) {
//         alert(
//           "⚠️ Subscription Required: Please subscribe to access this feature."
//         );
//       }
//       // Retry after 5 seconds
//       setTimeout(() => {
//         socket.emit("getMarketDepthData", { token });
//       }, 5000);
//     });

//     // Emit getMarketDepthData only after connection is established
//     socket.on("connect", () => {
//       console.log("✅ Connected to WebSocket Server:", socket.id);
//       if (!isFetching) {
//         console.log("Emitting getMarketDepthData");
//         socket.emit("getMarketDepthData", { token });
//         setIsFetching(true);
//       }
//     });

//     // Set up interval for periodic data fetching
//     if (isFetching) {
//       interval = setInterval(() => {
//         console.log("Emitting getMarketDepthData (interval)");
//         socket.emit("getMarketDepthData", { token });
//       }, 45000);
//     }

//     // Cleanup
//     return () => {
//       socket.off("connect");
//       socket.off("turnOver", handleTurnOver);
//       socket.off("dayLowBreak", handleDayLowBreak);
//       socket.off("dayHighBreak", handleDayHighBreak);
//       socket.off("getTopGainersAndLosers", handleTopGainersAndLosers);
//       socket.off("previousDaysVolume", handlePreviousDaysVolume);
//       socket.off("error");
//       socket.off("connect_error");
//       clearInterval(interval);
//     };
//   }, [isFetching, token]);

//   return (
//     <section>
//       <h1 className="text-3xl font-medium mt-5">Market Depth</h1>

//       <div className="grid md:grid-cols-2 grid-cols-1 gap-6 w-full mt-10">
//         <Suspense fallback={<div>Loading...</div>}>
//           <HighPowerStock
//             data={turnOverData}
//             loading={loading}
//             isSubscribed={isSubscribed}
//           />

//           <PreviousVolume
//             data={previousDaysVolumeResponse}
//             loading={loading}
//             error={error}
//             isSubscribed={isSubscribed}
//           />

//           <DayHigh
//             data={dayHighBreakResponse}
//             loading={loading}
//             error={error}
//             isSubscribed={isSubscribed}
//           />
//           <DayLow
//             data={dayLowBreakResponse}
//             loading={loading}
//             error={error}
//             isSubscribed={isSubscribed}
//           />

//           <TopGainers
//             data={getTopGainersAndLosersResponse?.topGainers}
//             loading={loading}
//             error={error}
//             isSubscribed={isSubscribed}
//           />
//           <TopLoosers
//             data={getTopGainersAndLosersResponse?.topLosers}
//             loading={loading}
//             error={error}
//             isSubscribed={isSubscribed}
//           />
//         </Suspense>
//       </div>
//     </section>
//   );
// };

// export default MarketDepthPage;

const MarketDepthPage = () => {
  const [turnOverData, setTurnOverData] = useState([]);
  const [dayHighBreakResponse, setDayHighBreakResponse] = useState([]);
  const [dayLowBreakResponse, setDayLowBreakResponse] = useState([]);
  const [getTopGainersAndLosersResponse, setGetTopGainersAndLosersResponse] =
    useState([]);
  const [previousDaysVolumeResponse, setPreviousDaysVolumeResponse] = useState(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(null);
  const [isMarketHours, setIsMarketHours] = useState(checkMarketHours());
  const [socket, setSocket] = useState(null);

  const SOCKET_URI = import.meta.env.VITE_SOCKET_URI;
  const VITE_SERVER_URI = import.meta.env.VITE_SERVER_URI;
  const token = localStorage.getItem("token");

  function checkMarketHours() {
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
  }

  const fetchMarketDepthData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${VITE_SERVER_URI}/market-depth`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) {
        throw new Error("Failed to fetch market depth data");
      }

      const data = response.data;
      setTurnOverData(data?.turnOver.turnOverData || []);
      setDayHighBreakResponse(data?.dayHighBreak || []);
      setDayLowBreakResponse(data?.dayLowBreak || []);
      setGetTopGainersAndLosersResponse(data?.topGainersAndLosers || []);
      setPreviousDaysVolumeResponse(data?.previousDaysVolume || []);
    } catch (error) {
      console.error("Error fetching market depth data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const initSocket = () => {
    const newSocket = io(`${SOCKET_URI}`, {
      auth: { token },
      transports: ["websocket"],
    });

    const handleTurnOver = (data) => {
      setTurnOverData(data?.data);
      setLoading(false);
    };

    const handleDayLowBreak = (data) => {
      setDayLowBreakResponse(data?.dayLowBreak);
      setLoading(false);
    };

    const handleDayHighBreak = (data) => {
      setDayHighBreakResponse(data?.dayHighBreak);
      setLoading(false);
    };

    const handleTopGainersAndLosers = (data) => {
      setGetTopGainersAndLosersResponse(data);
      setLoading(false);
    };

    const handlePreviousDaysVolume = (data) => {
      setPreviousDaysVolumeResponse(data?.combinedData);
      setLoading(false);
    };

    newSocket.on("turnOver", handleTurnOver);
    newSocket.on("dayLowBreak", handleDayLowBreak);
    newSocket.on("dayHighBreak", handleDayHighBreak);
    newSocket.on("getTopGainersAndLosers", handleTopGainersAndLosers);
    newSocket.on("previousDaysVolume", handlePreviousDaysVolume);

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
      setError(error.message);
      setLoading(false);
    });

    newSocket.on("connect_error", (err) => {
      console.warn("Socket Connection Error:", err.message);
      if (err.message.includes("Subscription required")) {
        alert(
          "⚠️ Subscription Required: Please subscribe to access this feature."
        );
      }
      fetchMarketDepthData();
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to WebSocket Server:", newSocket.id);
      newSocket.emit("getMarketDepthData", { token });
    });

    setSocket(newSocket);
    return newSocket;
  };

  useEffect(() => {
    const Subscribed = Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed === "true");

    if (!token) {
      console.error("No token found in localStorage");
      setError("Authentication token missing");
      setLoading(false);
      return;
    }

    const marketHoursCheckInterval = setInterval(() => {
      const currentlyMarketHours = checkMarketHours();
      if (currentlyMarketHours !== isMarketHours) {
        setIsMarketHours(currentlyMarketHours);
      }
    }, 60000);

    return () => {
      clearInterval(marketHoursCheckInterval);
    };
  }, []);

  useEffect(() => {
    if (!isSubscribed) return;

    let socketInstance;
    let dataPollInterval;

    if (isMarketHours) {
      socketInstance = initSocket();

      dataPollInterval = setInterval(() => {
        socketInstance.emit("getMarketDepthData", { token });
      }, 45000);
    } else {
      fetchMarketDepthData();

      dataPollInterval = setInterval(() => {
        fetchMarketDepthData();
      }, 60000);
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
      clearInterval(dataPollInterval);
    };
  }, [isMarketHours, isSubscribed]);

  return (
    <section>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-6 w-full mt-10">
        <Suspense fallback={<div>Loading...</div>}>
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
        </Suspense>
      </div>
    </section>
  );
};

export default MarketDepthPage;
