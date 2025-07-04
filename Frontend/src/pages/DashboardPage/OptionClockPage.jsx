// /* eslint-disable react-hooks/exhaustive-deps */
// import { GoDotFill } from "react-icons/go";
// import TimeRangeSlider from "../../Components/Dashboard/TimeRangeSlider";
// import OiClockChart from "../../Components/Dashboard/OiClockChart";
// import { FcCandleSticks } from "react-icons/fc";
// import OiClockChartTwo from "../../Components/Dashboard/OiClockChartTwo";
// import OiClockChartThree from "../../Components/Dashboard/OiClockChartThree";
// import useFetchData from "../../utils/useFetchData";
// import { useEffect, useState } from "react";
// import { convertTo12HourFormat, parseTime } from "../../utils/utils";
// import { lotSize } from "../../constants/constants";
// import Cookies from "js-cookie";
// // import { useAuth } from "../../contexts/AuthContext";
// import Lock from "../../Components/Dashboard/Lock";
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
//   // const { user } = useAuth();

//   const fetchIndexData = async (index) => {
//     try {
//       const response = await fetchData(
//         `option-data/underlying?underlyingName=${index}`,
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

//   const fetchAllIndexData = async () => {
//     try {
//       setLoading(true);
//       const indexes = [
//         "NIFTY",
//         "BANKNIFTY",
//         "FINNIFTY",
//         "MIDCPNIFTY",
//         "SENSEX",
//       ];
//       const results = await Promise.all(indexes.map(fetchIndexData));

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

//       if (newData.Nifty50?.expiries?.length > 0) {
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
//       const Subscribed = Cookies.get("isSubscribed") === "true";
//       setIsSubscribed(Subscribed);
//     };

//     checkSubscription();
//   }, []);

//   useEffect(() => {
//     const initializeData = async () => {
//       await fetchAllIndexData();
//     };
//     initializeData();
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

//       const processedData = processData(filteredData[0], filteredData[1]);

//       setTotalOiChanges(getTotalOIChange(processedData));
//       setTotalOi({
//         totalOiCE: totalOiCE / lotSize[selectedIndex],
//         totalOiPE: totalOiPE / lotSize[selectedIndex],
//       });
//       setCurrData(processedData.length > 0 ? processedData : []);
//     } catch (error) {
//       console.log("Error in filtering data:", error);
//       setCurrData([]);
//     } finally {
//       setChartLoading(false);
//     }
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
//           <h1 className="text-3xl font-bold">Sector Depth</h1>
//           <span className="flex items-center px-2 py-px rounded-full w-fit bg-[#0256F5] text-xs">
//             <GoDotFill />
//             Live
//           </span>
//         </div>

//         <div className="flex gap-4">
//           <div className="relative border border-[#0E5FF6] w-fit rounded-lg px-4 py-2 ">
//             <label className="text-sm">Index:</label>
//             <select
//               onChange={handleIndexChange}
//               id="index"
//               className="bg-transparent focus:outline-none"
//               value={selectedIndex}
//             >
//               <option className="bg-[#000A2D]" value="Nifty50">
//                 Nifty50
//               </option>
//               <option className="bg-[#000A2D]" value="BankNifty">
//                 BankNifty
//               </option>
//               <option className="bg-[#000A2D]" value="FinNifty">
//                 FinNifty
//               </option>
//               <option className="bg-[#000A2D]" value="Midcap">
//                 Midcap
//               </option>
//               <option className="bg-[#000A2D]" value="Sensex">
//                 Sensex
//               </option>
//             </select>
//           </div>

//           <div className="relative border border-[#0E5FF6] w-fit rounded-lg px-4 py-2">
//             <label className="text-sm">Expiry:</label>
//             <select
//               id="expiry"
//               className="bg-transparent focus:outline-none"
//               value={selectedExpiry}
//               onChange={handleExpiryChange}
//             >
//               {currentExpiries.map((expiry) => (
//                 <option key={expiry} className="bg-[#000A2D]" value={expiry}>
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
//         <div className="dark:bg-db-primary bg-db-primary rounded-lg lg:p-3 md:p-3">
//           {chartLoading ? (
//             <div className="flex justify-center items-center h-64">
//               {/* <LoadingSpinner /> */}
//               <p className="ml-4">Loading chart data...</p>
//             </div>
//           ) : (
//             <>
//               <div className="dark:bg-db-primary bg-db-primaryrounded-lg ">
//                 <div className="flex items-center gap-2">
//                   <h2 className="text-3xl font-bold ">OI Clock </h2>{" "}
//                   <span>
//                     <FcCandleSticks className="text-xl" />
//                   </span>
//                 </div>

//                 <div className="mt-5 dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg ">
//                   {isSubscribed ? (
//                     <OiClockChart data={currData} />
//                   ) : (
//                     <div className="w-full h-[500px]">
//                       <Lock />
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="w-full mt-5 h-auto grid grid-cols-1 lg:grid-cols-2 gap-5">
//                 <div className="h-full dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
//                   <div className="dark:bg-db-secondary bg-db-primary rounded-lg p-3">
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
//                   <div className="dark:bg-db-secondary bg-db-primary px-3 rounded-lg h-full">
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
//           )}
//         </div>
//       </section>
//     </>
//   );
// };

// export default OptionClockPage;
/* eslint-disable react-hooks/exhaustive-deps */
import { GoDotFill } from "react-icons/go";
import TimeRangeSlider from "../../Components/Dashboard/TimeRangeSlider";
import OiClockChart from "../../Components/Dashboard/OiClockChart";
import { FcCandleSticks } from "react-icons/fc";
import OiClockChartTwo from "../../Components/Dashboard/OiClockChartTwo";
import OiClockChartThree from "../../Components/Dashboard/OiClockChartThree";
import useFetchData from "../../utils/useFetchData";
import { useEffect, useState } from "react";
import {
  convertTo12HourFormat,
  getLatestTradingDay,
  parseTime,
} from "../../utils/utils";
import { lotSize } from "../../constants/constants";
import Cookies from "js-cookie";
// import { useAuth } from "../../contexts/AuthContext";
import Lock from "../../Components/Dashboard/Lock";
const OptionClockPage = () => {
  const { fetchData } = useFetchData();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [allIndexData, setAllIndexData] = useState({
    Nifty50: { data: [], expiries: [] },
    BankNifty: { data: [], expiries: [] },
    FinNifty: { data: [], expiries: [] },
    Midcap: { data: [], expiries: [] },
    Sensex: { data: [], expiries: [] },
  });
  const [selectedIndex, setSelectedIndex] = useState("Nifty50");
  const [selectedExpiry, setSelectedExpiry] = useState("");
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [totalOiChanges, setTotalOiChanges] = useState({});
  const [totalOi, setTotalOi] = useState({});
  const [currData, setCurrData] = useState([]);
  // const { user } = useAuth();

  const fetchIndexData = async (index) => {
    try {
      const response = await fetchData(
        `option-data/underlying?underlyingName=${index}`,
        "GET"
      );
      return {
        data: response.data || [],
        expiries: response.data?.expiries || [],
      };
    } catch (error) {
      console.error(`Error fetching ${index} data:`, error);
      return { data: [], expiries: [] };
    }
  };

  const handleExpiryChange = (e) => {
    setSelectedExpiry(e.target.value);
  };

  const fetchAllIndexData = async () => {
    try {
      setLoading(true);
      const indexes = [
        "NIFTY",
        "BANKNIFTY",
        "FINNIFTY",
        "MIDCPNIFTY",
        "SENSEX",
      ];
      const results = await Promise.all(indexes.map(fetchIndexData));

      const newIndexes = [
        "Nifty50",
        "BankNifty",
        "FinNifty",
        "Midcap",
        "Sensex",
      ];
      const newData = {};

      newIndexes.forEach((index, i) => {
        newData[index] = results[i].data;
      });

      setAllIndexData(newData);

      if (newData.Nifty50?.expiries?.length > 0) {
        setSelectedExpiry(() => newData.Nifty50.expiries[0]);
      }
    } catch (error) {
      console.error("Error fetching index data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSubscription = () => {
      const Subscribed = Cookies.get("isSubscribed") === "true";
      setIsSubscribed(Subscribed);
    };

    checkSubscription();
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      await fetchAllIndexData();
    };
    initializeData();
  }, []);

  const handleIndexChange = (e) => {
    const index = e.target.value;
    setSelectedIndex(index);
    if (allIndexData[index]?.expiries?.length > 0) {
      setSelectedExpiry(allIndexData[index].expiries[0]);
    }
  };

  const currentExpiries = allIndexData[selectedIndex]?.expiries || [];

  const getDataByIndexAndExpiry = (range) => {
    if (!range || !allIndexData[selectedIndex]?.data) {
      console.log("Missing parameters - waiting for data to load");
      return;
    }

    setChartLoading(true);

    let totalOiCE = 0;
    let totalOiPE = 0;

    try {
      const startTime = convertTo12HourFormat(range.split("-")[0]);
      const endTime = convertTo12HourFormat(range.split("-")[1]);
      let filteredData = allIndexData[selectedIndex].data.filter((data) => {
        const expectedExpiry = data.expiry;
        const timeStamp = data.timestamp.trim();
        if (expectedExpiry !== selectedExpiry) return false;

        const { totalOiCE: totalCE, totalOiPE: totalPE } = getTotalOi(data);
        totalOiCE = totalOiCE + totalCE;
        totalOiPE = totalOiPE + totalPE;

        return timeStamp === startTime || timeStamp === endTime;
      });

      filteredData = filteredData.sort(
        (a, b) => parseTime(a.timestamp.trim()) - parseTime(b.timestamp.trim())
      );
      if (
        !checkIfDataIsLatest(filteredData[0].updatedAt) ||
        !checkIfDataIsLatest(filteredData[1].updatedAt)
      ) {
        throw new Error("Data is not available");
      }
      const processedData = processData(filteredData[0], filteredData[1]);

      setTotalOiChanges(getTotalOIChange(processedData));
      setTotalOi({
        totalOiCE: totalOiCE / lotSize[selectedIndex],
        totalOiPE: totalOiPE / lotSize[selectedIndex],
      });
      setCurrData(processedData.length > 0 ? processedData : []);
    } catch (error) {
      console.log(error);
      setCurrData([]);
    } finally {
      setChartLoading(false);
    }
  };

  const checkIfDataIsLatest = (updatedAt) => {
    const convertedDate = new Date(updatedAt).toLocaleDateString();
    const latestTradingDate = getLatestTradingDay().toLocaleDateString();
    return convertedDate === latestTradingDate;
  };

  const getTotalOi = (data) => {
    let totalOiCE = 0;
    let totalOiPE = 0;
    data.strikeData.forEach((strike) => {
      if (strike.optionType === "CE") {
        totalOiCE = totalOiCE + strike.oi;
      } else {
        totalOiPE = totalOiPE + strike.oi;
      }
    });
    return { totalOiCE, totalOiPE };
  };

  const getTotalOIChange = (processedData) => {
    let TotalOiChangeCE = 0;
    let TotalOiChangePE = 0;
    processedData.forEach((data) => {
      TotalOiChangeCE += data.oiChangeCE;
      TotalOiChangePE += data.oiChangePE;
    });

    return {
      TotalOiChangeCE: TotalOiChangeCE.toFixed(2),
      TotalOiChangePE: TotalOiChangePE.toFixed(2),
    };
  };

  const processData = (startTime, endTime) => {
    if (!startTime || !endTime) return [];

    const createStrikeMap = (data) => {
      const map = {};
      data.strikeData.forEach((strike) => {
        const key = `${strike.strikePrice}-${strike.optionType}`;
        map[key] = strike;
      });
      return map;
    };

    const startTimeMap = createStrikeMap(startTime);
    const endTimeMap = createStrikeMap(endTime);

    const mergedMap = new Map();

    const allKeys = new Set([
      ...Object.keys(startTimeMap),
      ...Object.keys(endTimeMap),
    ]);
    allKeys.forEach((key) => {
      const [strikePrice, optionType] = key.split("-");
      const price = parseFloat(strikePrice);

      const morning = startTimeMap[key];
      const evening = endTimeMap[key];

      if (!morning || !evening) return;

      const oiChange = (evening.oi - morning.oi) / lotSize[selectedIndex];
      const priceChange = evening.lastPrice - morning.lastPrice;

      const mapKey = price;
      if (!mergedMap.has(mapKey)) {
        mergedMap.set(mapKey, {
          strikePrice: price,
          oiChangeCE: 0,
          oiChangePE: 0,
          priceChangeCE: 0,
          priceChangePE: 0,
        });
      }

      const existing = mergedMap.get(mapKey);

      if (optionType === "CE") {
        existing.oiChangeCE = oiChange;
        existing.priceChangeCE = priceChange;
      } else {
        existing.oiChangePE = oiChange;
        existing.priceChangePE = priceChange;
      }

      mergedMap.set(mapKey, existing);
    });

    return Array.from(mergedMap.values()).sort(
      (a, b) => a.strikePrice - b.strikePrice
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="ml-4 text-xl">Loading market data...</p>
      </div>
    );
  }

  return (
    <>
      {/* sector depth section */}
      <section className="mt-5 flex md:justify-between md:items-center md:flex-row flex-col md:gap-0 gap-4">
        <div className="flex gap-4 items-center">
          <h1 className="text-3xl font-bold">AI Option Data</h1>
          <span className="flex items-center px-2 py-px rounded-full w-fit bg-[#0256F5] text-xs">
            <GoDotFill />
            Live
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <div className="flex items-center relative border border-[#0E5FF6] w-fit rounded-lg px-3 py-1">
            <label className="text-sm">Index:</label>
            <select
              onChange={handleIndexChange}
              id="index"
              className="bg-transparent focus:outline-none"
              value={selectedIndex}
            >
              <option className="bg-[#000A2D]" value="Nifty50">
                Nifty50
              </option>
              <option className="bg-[#000A2D]" value="BankNifty">
                BankNifty
              </option>
              <option className="bg-[#000A2D]" value="FinNifty">
                FinNifty
              </option>
              <option className="bg-[#000A2D]" value="Midcap">
                Midcap
              </option>
              <option className="bg-[#000A2D]" value="Sensex">
                Sensex
              </option>
            </select>
          </div>

          <div className="flex items-center relative border border-[#0E5FF6] w-fit rounded-lg px-3 py-1">
            <label className="text-sm">Expiry:</label>
            <select
              id="expiry"
              className="bg-transparent focus:outline-none"
              value={selectedExpiry}
              onChange={handleExpiryChange}
            >
              {currentExpiries.map((expiry) => (
                <option key={expiry} className="bg-[#000A2D]" value={expiry}>
                  {expiry}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* time range slider section */}
      <section>
        <TimeRangeSlider
          getDataByIndexAndExpiry={getDataByIndexAndExpiry}
          isSubscribed={isSubscribed}
        />
      </section>

      {/* oi clock charts section*/}
      <section className="dark:bg-gradient-to-br from-[#00078F] to-[#01071C] rounded-lg p-px mt-8">
        <div className="dark:bg-db-primary bg-db-primary rounded-lg lg:p-3 md:p-3">
          {chartLoading ? (
            <div className="flex justify-center items-center h-64">
              {/* <LoadingSpinner /> */}
              <p className="ml-4">Loading chart data...</p>
            </div>
          ) : (
            <>
              <div className="dark:bg-db-primary bg-db-primaryrounded-lg ">
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-bold ">OI Clock </h2>{" "}
                  <span>
                    <FcCandleSticks className="text-xl" />
                  </span>
                </div>

                <div className="mt-5 dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg ">
                  {isSubscribed ? (
                    <OiClockChart data={currData} />
                  ) : (
                    <div className="w-full h-[500px]">
                      <Lock />
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full mt-5 h-auto grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="h-full dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
                  <div className="dark:bg-db-secondary bg-db-primary rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-3xl font-medium">OI Net Position</h2>{" "}
                      <span className="text-xl">
                        <FcCandleSticks />
                      </span>
                    </div>
                    {isSubscribed ? (
                      <OiClockChartTwo data={totalOiChanges} />
                    ) : (
                      <div className="w-full h-[500px]">
                        <Lock />
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-full dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
                  <div className="dark:bg-db-secondary bg-db-primary px-3 rounded-lg h-full">
                    <div className="flex md:gap-2 gap-y-4 md:flex-row flex-col md:items-center md:justify-between p-2">
                      <div className="flex gap-2 items-center text-xl">
                        <h2 className="text-3xl font-medium">OI Clock</h2>{" "}
                        <span className="text-xl">
                          <FcCandleSticks />
                        </span>
                      </div>

                      <div className="flex items-center gap-2 ">
                        <div className="h-5 w-5 rounded bg-[#0256F5]"></div>{" "}
                        <p>Bulls Total OI</p>
                        <div className="h-5 w-5 rounded bg-[#95025A] ml-3"></div>{" "}
                        <p>Bears Total OI</p>
                      </div>
                    </div>
                    {isSubscribed ? (
                      <OiClockChartThree
                        data={totalOi}
                        selectedIndex={selectedIndex}
                      />
                    ) : (
                      <div className="w-full h-[500px]">
                        <Lock />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default OptionClockPage;
