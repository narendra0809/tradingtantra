// /* eslint-disable no-unused-vars */

// /* eslint-disable react-hooks/exhaustive-deps */
// import { GoDotFill } from "react-icons/go";
// import TimeRangeSlider from "../../Components/Dashboard/TimeRangeSlider";
// import OiClockChart from "../../Components/Dashboard/OiClockChart";
// import { FcCandleSticks } from "react-icons/fc";
// import OiClockChartTwo from "../../Components/Dashboard/OiClockChartTwo";
// import OiClockChartThree from "../../Components/Dashboard/OiClockChartThree";
// import useFetchData from "../../utils/useFetchData";
// import { useEffect, useState } from "react";
// import { io } from "socket.io-client";
// import {
//   convertTo12HourFormat,
//   getLatestTradingDay,
//   marketHours,
//   parseTime,
// } from "../../utils/utils";
// import { lotSize } from "../../constants/constants";
// import Cookies from "js-cookie";
// import Lock from "../../Components/Dashboard/Lock";

// const SOCKET_URI = import.meta.env.VITE_CHAIN_SOCKET_URI;

// const OptionClockPage = () => {
//   const { fetchData } = useFetchData();
//   const [isSubscribed, setIsSubscribed] = useState(false);
//   const [allIndexData, setAllIndexData] = useState({
//     Nifty50: { data: [], expiries: [] },
//     BankNifty: { data: [], expiries: [] },
//     FinNifty: { data: [], expiries: [] },
//     Midcap: { data: [], expiries: [] },
//     Sensex: { data: [], expiries: [] },
//   });
//   const [selectedIndex, setSelectedIndex] = useState("Nifty50");
//   const [selectedExpiry, setSelectedExpiry] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [chartLoading, setChartLoading] = useState(true);
//   const [totalOiChanges, setTotalOiChanges] = useState({});
//   const [totalOi, setTotalOi] = useState({});
//   const [currData, setCurrData] = useState([]);
//   const [currentStrike, setCurrentStrike] = useState(null);
//   const [socket, setSocket] = useState(null);

//   const fetchOptionClockData = async (index) => {
//     try {
//       const response = await fetchData(
//         `/clock-data?index=${index}&expiry=${selectedExpiry}`,
//         "GET"
//       );
//       return {
//         data: response.data || [],
//         expiries: response.data?.expiries || [],
//       };
//     } catch (error) {
//       console.error(`Error fetching ${index} data:`, error);
//       return { data: [], expiries: [] };
//     }
//   };

//   const handleExpiryChange = (e) => {
//     setSelectedExpiry(e.target.value);
//   };

//   const fetchAllIndexData = async (isSocket) => {
//     try {
//       setLoading(isSocket ? false : true);
//       const indexes = [
//         "NIFTY",
//         "BANKNIFTY",
//         "FINNIFTY",
//         "MIDCPNIFTY",
//         "SENSEX",
//       ];
//       const results = await Promise.all(indexes.map(fetchOptionClockData));

//       const newIndexes = [
//         "Nifty50",
//         "BankNifty",
//         "FinNifty",
//         "Midcap",
//         "Sensex",
//       ];
//       const newData = {};

//       newIndexes.forEach((index, i) => {
//         newData[index] = results[i].data;
//       });

//       setAllIndexData(newData);

//       if (!isSocket && newData.Nifty50?.expiries?.length > 0) {
//         setSelectedExpiry(() => newData.Nifty50.expiries[0]);
//       }
//     } catch (error) {
//       console.error("Error fetching index data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const checkSubscription = () => {
//       const Subscribed = Cookies.get("isSubscribed");
//       setIsSubscribed(Subscribed === "true");
//     };

//     checkSubscription();
//   }, []);

//   useEffect(() => {
//     const initializeData = async () => {
//       await fetchAllIndexData();
//     };
//     initializeData();
//   }, []);

//   useEffect(() => {
//     if (!isSubscribed || !marketHours()) return;
//     const token = localStorage.getItem("token");
//     const newSocket = io(SOCKET_URI, {
//       auth: { token },
//       transports: ["websocket"],
//     });

//     setSocket(newSocket);
//     newSocket.on("connect", () => {
//       console.log("✅ Connected to WebSocket Server:", newSocket.id);
//       if (selectedIndex && selectedExpiry) {
//         newSocket.emit("subscribeOptionClock", {
//           index: selectedIndex,
//           expiry: selectedExpiry,
//         });
//       }
//     });
//     newSocket.on("optionClockUpdate", (msg) => {
//       console.log("Option data updated event received", msg);
//       fetchAllIndexData(true);
//     });

//     newSocket.on("connect_error", (err) => {
//       console.error("WebSocket connect error", err.message);
//     });

//     return () => {
//       newSocket.disconnect();
//     };
//   }, []);

//   const handleIndexChange = (e) => {
//     const index = e.target.value;
//     setSelectedIndex(index);
//     if (allIndexData[index]?.expiries?.length > 0) {
//       setSelectedExpiry(allIndexData[index].expiries[0]);
//     }
//   };

//   const currentExpiries = allIndexData[selectedIndex]?.expiries || [];

//   const getDataByIndexAndExpiry = (range) => {
//     if (!range || !allIndexData[selectedIndex]?.data) {
//       console.log("Missing parameters - waiting for data to load");
//       return;
//     }
//     setChartLoading(true);

//     let totalOiCE = 0;
//     let totalOiPE = 0;

//     try {
//       const startTime = convertTo12HourFormat(range.split("-")[0]);
//       const endTime = convertTo12HourFormat(range.split("-")[1]);
//       let filteredData = allIndexData[selectedIndex].data.filter((data) => {
//         const expectedExpiry = data.expiry;
//         const timeStamp = data.timestamp.trim();
//         if (expectedExpiry !== selectedExpiry) return false;

//         const { totalOiCE: totalCE, totalOiPE: totalPE } = getTotalOi(data);
//         totalOiCE = totalOiCE + totalCE;
//         totalOiPE = totalOiPE + totalPE;

//         return timeStamp === startTime || timeStamp === endTime;
//       });

//       filteredData = filteredData.sort(
//         (a, b) => parseTime(a.timestamp.trim()) - parseTime(b.timestamp.trim())
//       );
//       if (
//         !checkIfDataIsLatest(filteredData[0].updatedAt) ||
//         !checkIfDataIsLatest(filteredData[1].updatedAt)
//       ) {
//         throw new Error("Data is not available");
//       }
//       const processedData = processData(filteredData[0], filteredData[1]);

//       setTotalOiChanges(getTotalOIChange(processedData));
//       setTotalOi({
//         totalOiCE: totalOiCE / lotSize[selectedIndex],
//         totalOiPE: totalOiPE / lotSize[selectedIndex],
//       });
//       setCurrData(processedData.length > 0 ? processedData : []);
//     } catch (error) {
//       console.log(error);
//       setCurrData([]);
//     } finally {
//       setChartLoading(false);
//     }
//   };

//   const checkIfDataIsLatest = (updatedAt) => {
//     const convertedDate = new Date(updatedAt).toLocaleDateString();
//     const latestTradingDate = getLatestTradingDay().toLocaleDateString();
//     return convertedDate === latestTradingDate;
//   };

//   const getTotalOi = (data) => {
//     let totalOiCE = 0;
//     let totalOiPE = 0;
//     data.strikeData.forEach((strike) => {
//       if (strike.optionType === "CE") {
//         totalOiCE = totalOiCE + strike.oi;
//       } else {
//         totalOiPE = totalOiPE + strike.oi;
//       }
//     });
//     return { totalOiCE, totalOiPE };
//   };

//   const getTotalOIChange = (processedData) => {
//     let TotalOiChangeCE = 0;
//     let TotalOiChangePE = 0;
//     processedData.forEach((data) => {
//       TotalOiChangeCE += data.oiChangeCE;
//       TotalOiChangePE += data.oiChangePE;
//     });

//     return {
//       TotalOiChangeCE: TotalOiChangeCE.toFixed(2),
//       TotalOiChangePE: TotalOiChangePE.toFixed(2),
//     };
//   };

//   const processData = (startTime, endTime) => {
//     if (!startTime || !endTime) return [];

//     const createStrikeMap = (data) => {
//       const map = {};
//       data.strikeData.forEach((strike) => {
//         const key = `${strike.strikePrice}-${strike.optionType}`;
//         map[key] = strike;
//       });
//       return map;
//     };

//     const startTimeMap = createStrikeMap(startTime);
//     const endTimeMap = createStrikeMap(endTime);

//     const mergedMap = new Map();

//     const allKeys = new Set([
//       ...Object.keys(startTimeMap),
//       ...Object.keys(endTimeMap),
//     ]);
//     allKeys.forEach((key) => {
//       const [strikePrice, optionType] = key.split("-");
//       const price = parseFloat(strikePrice);

//       const morning = startTimeMap[key];
//       const evening = endTimeMap[key];

//       if (!morning || !evening) return;

//       const oiChange = (evening.oi - morning.oi) / lotSize[selectedIndex];
//       const priceChange = evening.lastPrice - morning.lastPrice;

//       const mapKey = price;
//       if (!mergedMap.has(mapKey)) {
//         mergedMap.set(mapKey, {
//           strikePrice: price,
//           oiChangeCE: 0,
//           oiChangePE: 0,
//           priceChangeCE: 0,
//           priceChangePE: 0,
//         });
//       }

//       const existing = mergedMap.get(mapKey);

//       if (optionType === "CE") {
//         existing.oiChangeCE = oiChange;
//         existing.priceChangeCE = priceChange;
//       } else {
//         existing.oiChangePE = oiChange;
//         existing.priceChangePE = priceChange;
//       }

//       mergedMap.set(mapKey, existing);
//     });

//     return Array.from(mergedMap.values()).sort(
//       (a, b) => a.strikePrice - b.strikePrice
//     );
//   };

//   function findNearestDoc(optionData, selectedExpiry) {
//     let nearest = null;
//     let minDiff = Infinity;
//     optionData.data?.forEach((doc) => {
//       if (doc.expiry !== selectedExpiry) return;
//       const docTime = new Date(`1970-01-01 ${doc.timestamp}`);
//       const currTime = new Date();
//       const diff = currTime - docTime;
//       if (diff >= 0 && diff < minDiff) {
//         nearest = doc;
//         minDiff = diff;
//       }
//     });
//     return nearest;
//   }

//   function findClosestStrike(strikeData, lastPrice) {
//     let closest = strikeData[0]?.strikePrice ?? null;
//     let minDiff =
//       closest === null ? Number.MAX_VALUE : Math.abs(closest - lastPrice);
//     for (const obj of strikeData) {
//       const diff = Math.abs(obj.strikePrice - lastPrice);
//       if (diff < minDiff) {
//         closest = obj.strikePrice;
//         minDiff = diff;
//       }
//     }
//     return closest;
//   }

//   useEffect(() => {
//     if (selectedIndex && selectedExpiry) {
//       const nearestDoc = findNearestDoc(
//         allIndexData[selectedIndex],
//         selectedExpiry
//       );
//       const currentStrike = nearestDoc
//         ? findClosestStrike(nearestDoc.strikeData, nearestDoc.lastPrice)
//         : null;
//       setCurrentStrike(currentStrike);
//     }
//   }, [selectedIndex, selectedExpiry, allIndexData]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p className="ml-4 text-xl">Loading market data...</p>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* sector depth section */}
//       <section className="mt-5 flex md:justify-between md:items-center md:flex-row flex-col md:gap-0 gap-4">
//         <div className="flex gap-4 items-center">
//           <h1 className="text-3xl font-bold">AI Option Data</h1>
//           <span className="flex items-center px-2 py-px rounded-full w-fit bg-[#0256F5] text-xs text-white">
//             <GoDotFill />
//             Live
//           </span>
//         </div>

//         <div className="flex justify-between gap-4">
//           <div className="flex items-center relative border border-[#0E5FF6] w-fit rounded-lg px-3 py-1">
//             <label className="text-sm">Index:</label>
//             <select
//               onChange={handleIndexChange}
//               id="index"
//               className="bg-transparent focus:outline-none"
//               value={selectedIndex}
//             >
//               <option
//                 className="bg-[#000A2D]  not-dark:bg-primary-light "
//                 value="Nifty50"
//               >
//                 Nifty50
//               </option>
//               <option
//                 className="bg-[#000A2D] not-dark:bg-primary-light "
//                 value="BankNifty"
//               >
//                 BankNifty
//               </option>
//               <option
//                 className="bg-[#000A2D] not-dark:bg-primary-light "
//                 value="FinNifty"
//               >
//                 FinNifty
//               </option>
//               <option
//                 className="bg-[#000A2D] not-dark:bg-primary-light "
//                 value="Midcap"
//               >
//                 Midcap
//               </option>
//               <option
//                 className="bg-[#000A2D] not-dark:bg-primary-light "
//                 value="Sensex"
//               >
//                 Sensex
//               </option>
//             </select>
//           </div>

//           <div className="flex items-center relative border border-[#0E5FF6] w-fit rounded-lg px-3 py-1">
//             <label className="text-sm">Expiry:</label>
//             <select
//               id="expiry"
//               className="bg-transparent focus:outline-none"
//               value={selectedExpiry}
//               onChange={handleExpiryChange}
//             >
//               {currentExpiries.map((expiry) => (
//                 <option
//                   key={expiry}
//                   className="bg-[#000A2D] not-dark:bg-primary-light "
//                   value={expiry}
//                 >
//                   {expiry}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </section>

//       {/* time range slider section */}
//       <section>
//         <TimeRangeSlider
//           getDataByIndexAndExpiry={getDataByIndexAndExpiry}
//           isSubscribed={isSubscribed}
//         />
//       </section>

//       {/* oi clock charts section*/}
//       <section className="dark:bg-gradient-to-br from-[#00078F] to-[#01071C] rounded-lg p-px mt-8">
//         <div className="dark:bg-db-primary bg-primary-light rounded-lg lg:p-3 md:p-3">
//           {
//             <>
//               <div className="dark:bg-db-primary bg-primary-light ">
//                 <div className="flex items-center gap-2">
//                   <h2 className="text-3xl font-bold ">OI Clock </h2>{" "}
//                   <span>
//                     <FcCandleSticks className="text-xl" />
//                   </span>
//                 </div>

//                 <div className="mt-5 dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg ">
//                   {isSubscribed ? (
//                     <OiClockChart
//                       data={currData}
//                       currentStrike={currentStrike}
//                     />
//                   ) : (
//                     <div className="w-full h-[500px]">
//                       <Lock />
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="w-full mt-5 h-auto grid grid-cols-1 lg:grid-cols-2 gap-5">
//                 <div className="h-full dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
//                   <div className="dark:bg-db-secondary bg-primary-light rounded-lg p-3">
//                     <div className="flex items-center gap-2">
//                       <h2 className="text-3xl font-medium">OI Net Position</h2>{" "}
//                       <span className="text-xl">
//                         <FcCandleSticks />
//                       </span>
//                     </div>
//                     {isSubscribed ? (
//                       <OiClockChartTwo data={totalOiChanges} />
//                     ) : (
//                       <div className="w-full h-[500px]">
//                         <Lock />
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="h-full dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
//                   <div className="dark:bg-db-secondary bg-primary-light px-3 rounded-lg h-full">
//                     <div className="flex md:gap-2 gap-y-4 md:flex-row flex-col md:items-center md:justify-between p-2">
//                       <div className="flex gap-2 items-center text-xl">
//                         <h2 className="text-3xl font-medium">OI Clock</h2>{" "}
//                         <span className="text-xl">
//                           <FcCandleSticks />
//                         </span>
//                       </div>

//                       <div className="flex items-center gap-2 ">
//                         <div className="h-5 w-5 rounded bg-[#0256F5]"></div>{" "}
//                         <p>Bulls Total OI</p>
//                         <div className="h-5 w-5 rounded bg-[#95025A] ml-3"></div>{" "}
//                         <p>Bears Total OI</p>
//                       </div>
//                     </div>
//                     {isSubscribed ? (
//                       <OiClockChartThree
//                         data={totalOi}
//                         selectedIndex={selectedIndex}
//                       />
//                     ) : (
//                       <div className="w-full h-[500px]">
//                         <Lock />
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </>
//           }
//         </div>
//       </section>
//     </>
//   );
// };

// export default OptionClockPage;

import axios from "axios";
import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";
import { FcCandleSticks } from "react-icons/fc";
import { io } from "socket.io-client";
import Lock from "../../Components/Dashboard/Lock";
import OiClockChart from "../../Components/Dashboard/OiClockChart";
import OiClockChartThree from "../../Components/Dashboard/OiClockChartThree";
import OiClockChartTwo from "../../Components/Dashboard/OiClockChartTwo";
import TimeRangeSlider from "../../Components/Dashboard/TimeRangeSlider";
import Loader from "../../Components/Loader";
import StrategyCard from "../../Components/StrategyCard";
import { marketHours } from "../../utils/utils";

const SERVER_URI = import.meta.env.VITE_SERVER_URI || "";

const OptionClockPage = () => {
  const [optionClockData, setOptionClockData] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState("Nifty50");
  const [selectedExpiry, setSelectedExpiry] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState("");
  const [expiries, setExpiries] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const formatTime = (decimalTime) => {
    const hours = Math.floor(decimalTime);
    const minutes = Math.round((decimalTime - hours) * 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  const fetchClockData = useCallback(
    async (index, expiry, startTime, endTime) => {
      if (!index || !expiry || !startTime || !endTime) {
        return;
      }

      setLoading(true);

      try {
        const res = await axios.get(
          `${SERVER_URI}/clock-data?index=${index}&expiry=${expiry}&startTime=${startTime}&endTime=${endTime}`,
          { withCredentials: true }
        );

        if (res.data.success) {
          setOptionClockData(res.data.optionClockData);
        } else {
          setOptionClockData(null);
        }
      } catch (err) {
        console.error("Fetch clock data error:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchExpiriesByIndex = useCallback(async () => {
    try {
      const res = await axios.get(`${SERVER_URI}/clock-data/expiries`, {
        withCredentials: true,
      });
      setExpiries(res.data.expiriesByIndex || {});

      const firstExpiry = res.data.expiriesByIndex?.[selectedIndex]?.[0];
      if (firstExpiry) {
        setSelectedExpiry(firstExpiry);
      }
    } catch (err) {
      console.error("Fetch expiries error:", err);
    }
  }, [selectedIndex]);

  const handleGoClick = useCallback(async () => {
    const [startTime, endTime] = selectedTimeRange.split("-");
    await fetchClockData(selectedIndex, selectedExpiry, startTime, endTime);
  }, [selectedIndex, selectedExpiry, selectedTimeRange, fetchClockData]);

  const handleTimeRangeChange = useCallback(
    async (timeRange) => {
      setSelectedTimeRange(timeRange);
      const [startTime, endTime] = timeRange.split("-");

      if (selectedIndex && selectedExpiry && isSubscribed) {
        await fetchClockData(selectedIndex, selectedExpiry, startTime, endTime);
      }
    },
    [selectedIndex, selectedExpiry, isSubscribed, fetchClockData]
  );

  useEffect(() => {
    const getDefaultTimeRange = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = Math.floor(now.getMinutes() / 15) * 15;
      const currentDecimal = parseFloat((hours + minutes / 60).toFixed(2));

      const marketOpen = 9.25;
      const marketClose = 15.5;

      if (currentDecimal >= marketOpen && currentDecimal <= marketClose) {
        const startTime = formatTime(marketOpen);
        const currentTime = formatTime(currentDecimal);
        return `${startTime}-${currentTime}`;
      }

      return "09:15-15:30";
    };

    const subscribed = Cookies.get("isSubscribed") === "true";
    setIsSubscribed(subscribed);

    const defaultRange = getDefaultTimeRange();
    setSelectedTimeRange(defaultRange);

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized && selectedIndex) {
      fetchExpiriesByIndex();
    }
  }, [isInitialized, selectedIndex, fetchExpiriesByIndex]);

  useEffect(() => {
    if (
      isInitialized &&
      selectedIndex &&
      selectedExpiry &&
      isSubscribed &&
      selectedTimeRange &&
      !optionClockData
    ) {
      const [startTime, endTime] = selectedTimeRange.split("-");
      console.log(
        `🚀 Auto-loading: ${selectedIndex} ${selectedExpiry} ${selectedTimeRange}`
      );
      fetchClockData(selectedIndex, selectedExpiry, startTime, endTime);
    }
  }, [
    isInitialized,
    selectedExpiry,
    isSubscribed,
    selectedTimeRange,
    fetchClockData,
    selectedIndex,
    optionClockData,
  ]);

  useEffect(() => {
    if (
      !isSubscribed ||
      !isInitialized ||
      !SERVER_URI ||
      !selectedIndex ||
      !selectedExpiry ||
      !marketHours()
    ) {
      return;
    }

    const newSocket = io(SERVER_URI, {
      transports: ["websocket"],
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      const [startTime, endTime] = selectedTimeRange.split("-");
      newSocket.emit("subscribeOptionClock", {
        index: selectedIndex,
        expiry: selectedExpiry,
        startTime,
        endTime,
      });
    });

    newSocket.on("optionClockUpdate", (payload) => {
      console.log("🔄 Live OptionClock update:", payload);
      setOptionClockData(payload);
      setLoading(false);
    });

    newSocket.on("optionClockError", (err) => {
      console.log("Socket error:", err);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connect error:", err.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [
    isSubscribed,
    isInitialized,
    selectedIndex,
    selectedExpiry,
    selectedTimeRange,
  ]);

  useEffect(() => {
    if (!socket || !marketHours() || !isInitialized) return;
    if (!selectedIndex || !selectedExpiry || !selectedTimeRange) return;

    const [startTime, endTime] = selectedTimeRange.split("-");
    socket.emit("subscribeOptionClock", {
      index: selectedIndex,
      expiry: selectedExpiry,
      startTime,
      endTime,
    });
  }, [selectedIndex, selectedExpiry, selectedTimeRange, socket, isInitialized]);

  if (loading && !optionClockData && !isInitialized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-xl">Initializing Option Clock...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="mt-5 flex md:justify-between md:items-center md:flex-row flex-col md:gap-0 gap-4">
        <StrategyCard
          Icon={FcCandleSticks}
          title={"AI Option Clock"}
          name={"option-clock"}
        />

        <div className="flex justify-between gap-4">
          <div className="flex items-center relative border border-[#0E5FF6] w-fit rounded-lg px-3 py-1">
            <label className="text-sm">Index:</label>
            <select
              onChange={(e) => setSelectedIndex(e.target.value)}
              id="index"
              className="bg-transparent focus:outline-none ml-2"
              value={selectedIndex}
              disabled={loading}
            >
              <option
                className="bg-[#000A2D] not-dark:bg-primary-light"
                value="Nifty50"
              >
                Nifty50
              </option>
              <option
                className="bg-[#000A2D] not-dark:bg-primary-light"
                value="BankNifty"
              >
                BankNifty
              </option>
              <option
                className="bg-[#000A2D] not-dark:bg-primary-light"
                value="FinNifty"
              >
                FinNifty
              </option>
              <option
                className="bg-[#000A2D] not-dark:bg-primary-light"
                value="Midcap"
              >
                Midcap
              </option>
              <option
                className="bg-[#000A2D] not-dark:bg-primary-light"
                value="Sensex"
              >
                Sensex
              </option>
            </select>
          </div>

          <div className="flex items-center relative border border-[#0E5FF6] w-fit rounded-lg px-3 py-1">
            <label className="text-sm">Expiry:</label>
            <select
              id="expiry"
              className="bg-transparent focus:outline-none ml-2"
              value={selectedExpiry}
              onChange={(e) => setSelectedExpiry(e.target.value)}
              disabled={loading}
            >
              {expiries?.[selectedIndex]?.map((expiry) => (
                <option
                  key={expiry}
                  className="bg-[#000A2D] not-dark:bg-primary-light"
                  value={expiry}
                >
                  {expiry}
                </option>
              )) || <option>Loading...</option>}
            </select>
          </div>

          <button
            onClick={handleGoClick}
            disabled={!isSubscribed || !selectedExpiry || loading}
            className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
              isSubscribed && selectedExpiry && !loading
                ? "bg-[#0E5FF6] hover:bg-[#0b4cd1]"
                : "bg-gray-500 cursor-not-allowed"
            }`}
          >
            {loading ? "Loading ..." : "Go"}
          </button>
        </div>
      </section>

      <section className="mt-4">
        <TimeRangeSlider
          onTimeRangeChange={handleTimeRangeChange}
          selectedTimeRange={selectedTimeRange}
          isSubscribed={isSubscribed}
          disabled={!isSubscribed || !selectedExpiry || loading}
        />
      </section>

      <section className="dark:bg-linear-to-br from-[#00078F] to-[#01071C] rounded-lg p-px mt-8">
        <div className="dark:bg-db-primary bg-primary-light rounded-lg lg:p-3 md:p-3 p-3">
          {!isSubscribed ? (
            <div className="flex flex-col items-center justify-center h-[600px] text-center p-8">
              <Lock className="w-24 h-24 mb-6 opacity-50" />
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center h-[600px]">
              <div className="text-center">
                <Loader />
              </div>
            </div>
          ) : (
            optionClockData && (
              <>
                <div className="dark:bg-db-primary bg-primary-light">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-3xl font-bold">OI Clock</h2>
                    <span>
                      <FcCandleSticks className="text-xl" />
                    </span>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {selectedTimeRange}
                    </span>
                  </div>

                  <div className="mt-2 dark:bg-linear-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
                    <OiClockChart
                      data={optionClockData.currData || []}
                      currentStrike={optionClockData.currentStrike}
                    />
                  </div>
                </div>

                <div className="w-full mt-5 h-auto grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="h-full dark:bg-linear-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
                    <div className="dark:bg-db-secondary bg-primary-light rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-3xl font-medium">
                          OI Net Position
                        </h2>
                        <span className="text-xl">
                          <FcCandleSticks />
                        </span>
                      </div>
                      <OiClockChartTwo
                        data={optionClockData.totalOiChanges || {}}
                      />
                    </div>
                  </div>

                  <div className="h-full dark:bg-linear-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
                    <div className="dark:bg-db-secondary bg-primary-light px-3 rounded-lg h-full">
                      <div className="flex md:gap-2 gap-y-4 md:flex-row flex-col md:items-center md:justify-between p-2 mb-4">
                        <div className="flex gap-2 items-center text-xl">
                          <h2 className="text-3xl font-medium">Total OI</h2>
                          <span className="text-xl">
                            <FcCandleSticks />
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded bg-[#0256F5]"></div>
                          <p className="text-sm">Bulls (CE)</p>
                          <div className="h-5 w-5 rounded bg-[#95025A] ml-3"></div>
                          <p className="text-sm">Bears (PE)</p>
                        </div>
                      </div>
                      <OiClockChartThree
                        data={optionClockData.totalOi || {}}
                        selectedIndex={selectedIndex}
                      />
                    </div>
                  </div>
                </div>
              </>
            )
          )}
        </div>
      </section>
    </>
  );
};

export default OptionClockPage;
