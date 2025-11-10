// import axios from "axios";
// import { Suspense, useEffect, useState } from "react";
// import { FcCandleSticks } from "react-icons/fc";
// import { GoDotFill } from "react-icons/go";
// import Cookies from "js-cookie";
// import Loader from "../../Components/Loader";
// import Lock from "../../Components/Dashboard/Lock";
// import FiiDiiTable from "../../Components/Dashboard/FiiDiiTable";
// import OptionInsiderTable from "../../Components/Dashboard/OptionInsiderTable";

// const SERVER_URI = import.meta.env.VITE_SERVER_URI;

// const upBadge = (
//   <span className="ml-2 bg-green-600 text-white px-2 py-0.5 rounded-full text-xs flex items-center w-fit">
//     <span className="mr-1">↑</span> Up
//   </span>
// );
// const downBadge = (
//   <span className="ml-2 bg-red-600 text-white px-2 py-0.5 rounded-full text-xs flex items-center w-fit">
//     <span className="mr-1">↓</span> Down
//   </span>
// );

// const AIOptionInsiderPage = () => {
//   const [optionChainData, setOptionChainData] = useState();
//   const [selectedIndex, setSelectedIndex] = useState("NIFTY");
//   const [selectedExpiry, setSelectedExpiry] = useState("");
//   const [selectedInterval, setSelectedInterval] = useState("3");
//   const [expiries, setExpiries] = useState();
//   const [loading, setLoading] = useState(false);
//   const [isSubscribed, setIsSubscribed] = useState(false);

//   useEffect(() => {
//     const checkSubscription = () => {
//       const Subscribed = Cookies.get("isSubscribed");
//       setIsSubscribed(Subscribed === "true");
//     };

//     checkSubscription();
//   }, []);
//   useEffect(() => {
//     const fetchExpiresByIndex = async () => {
//       try {
//         const res = await axios.get(`${SERVER_URI}/insider-data/expiries`, {
//           withCredentials: true,
//         });
//         setExpiries(res.data.expiriesByIndex);
//         setSelectedExpiry(res.data?.expiriesByIndex[selectedIndex][0] || "");
//         if (!selectedExpiry) {
//           fetchOptionChainData(res.data?.expiriesByIndex[selectedIndex][0]);
//         }
//       } catch (error) {
//         console.error(error);
//       }
//     };
//     fetchExpiresByIndex();
//   }, [selectedIndex]);

//   const handleGoClick = async () => {
//     fetchOptionChainData();
//   };
//   const fetchOptionChainData = async (expiry) => {
//     if (!selectedIndex || !selectedInterval) return;
//     setLoading(true);
//     try {
//       const res = await axios.get(
//         `${SERVER_URI}/insider-data?index=${selectedIndex}&expiry=${
//           selectedExpiry || expiry
//         }&interval=${selectedInterval}`,
//         { withCredentials: true }
//       );
//       setOptionChainData(res.data);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="mt-8  dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-[3px] rounded-lg bg-white ">
//       <div className="flex flex-col-reverse md:flex-row justify-between gap-4 md:gap-0 p-[20px]  bg-white dark:bg-db-primary">
//         <div className="flex gap-4 items-center">
//           <h1 className="text-3xl font-extrabold">Option Insider</h1>
//           <span className="text-2xl">
//             <FcCandleSticks />
//           </span>
//           <span className="flex items-center gap-1 px-2 py-px rounded-full w-fit text-white  text-xs font-semibold">
//             <GoDotFill className="text-white" />
//             Live
//           </span>
//         </div>

//         <div className="flex flex-col items-center md:flex-row gap-2 md:gap-4">
//           <div className="flex items-center relative border border-[#0E5FF6] rounded-lg px-3 py-1 sm:w-44 h-12 w-full">
//             <label className="text-xs">Index:</label>
//             <select
//               value={selectedIndex}
//               onChange={(e) => setSelectedIndex(e.target.value)}
//               className=" flex-1 ml-2 focus:outline-none dark:bg-db-primary bg-primary-light"
//             >
//               <option value="NIFTY">Nifty50</option>
//               <option value="BANKNIFTY">BankNifty</option>
//               <option value="FINNIFTY">FinNifty</option>
//               <option value="MIDCPNIFTY">Midcap</option>
//               <option value="SENSEX">Sensex</option>
//             </select>
//           </div>
//           <div className="flex items-center relative border border-[#0E5FF6] rounded-lg px-3 py-1 sm:w-32 h-12 w-full">
//             <label className="text-xs">Time:</label>
//             <select
//               value={selectedInterval}
//               onChange={(e) => setSelectedInterval(e.target.value)}
//               className="flex-1 ml-2 focus:outline-none dark:bg-db-primary bg-primary-light"
//             >
//               <option value="3">3m</option>
//               <option value="15">15m</option>
//             </select>
//           </div>
//           <div className="flex items-center relative border border-[#0E5FF6] rounded-lg px-3 py-1 sm:w-44 h-12 w-full">
//             <label className="text-xs">Expiry:</label>
//             <select
//               value={selectedExpiry}
//               onChange={(e) => setSelectedExpiry(e.target.value)}
//               className=" flex-1 ml-2 focus:outline-none dark:bg-db-primary bg-primary-light"
//             >
//               {expiries?.[selectedIndex]?.length > 0 &&
//                 expiries?.[selectedIndex]?.map((expiry) => (
//                   <option key={expiry} value={expiry}>
//                     {expiry}
//                   </option>
//                 ))}
//             </select>
//           </div>
//           <button
//             onClick={handleGoClick}
//             disabled={!isSubscribed}
//             className={`${
//               isSubscribed
//                 ? "bg-[#0E5FF6] hover:bg-[#0b4cd1]"
//                 : "bg-gray-500 cursor-not-allowed"
//             } text-white p-4 rounded-lg transition-colors h-12 text-center`}
//           >
//             Go
//           </button>
//         </div>
//       </div>

//       <Suspense fallback={<div>Loading table...</div>}>
//         <OptionInsiderTable
//           data={optionChainData?.rows}
//           loading={loading}
//           isSubscribed={isSubscribed}
//           upBadge={upBadge}
//           downBadge={downBadge}
//         />
//       </Suspense>
//     </section>
//   );
// };

// export default AIOptionInsiderPage;
// src/pages/AIOptionInsiderPage.jsx
import axios from "axios";
import { Suspense, useEffect, useState } from "react";
import { FcCandleSticks } from "react-icons/fc";
import { GoDotFill } from "react-icons/go";
import Cookies from "js-cookie";
import Loader from "../../Components/Loader";
import OptionInsiderTable from "../../Components/Dashboard/OptionInsiderTable";

const SERVER_URI = import.meta.env.VITE_SERVER_URI || "";

const AIOptionInsiderPage = () => {
  const [optionChainData, setOptionChainData] = useState();
  const [selectedIndex, setSelectedIndex] = useState("NIFTY");
  const [selectedExpiry, setSelectedExpiry] = useState("");
  const [selectedInterval, setSelectedInterval] = useState("3");
  const [expiries, setExpiries] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const Subscribed = Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed === "true");
  }, []);

  useEffect(() => {
    const fetchExpiresByIndex = async () => {
      try {
        const res = await axios.get(`${SERVER_URI}/insider-data/expiries`, {
          withCredentials: true,
        });
        const byIndex = res.data.expiriesByIndex || {};
        setExpiries(byIndex);
        const first = byIndex[selectedIndex]?.[0] || "";
        setSelectedExpiry((prev) => (prev ? prev : first));
        if (first) fetchOptionChainData(first, selectedInterval);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch expiries");
      }
    };
    fetchExpiresByIndex();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex]);

  const fetchOptionChainData = async (expiryOverride, intervalOverride) => {
    if (!selectedIndex) return;
    const expiryToUse = expiryOverride || selectedExpiry;
    const intervalToUse = intervalOverride || selectedInterval;
    if (!expiryToUse) {
      setError("Select expiry");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${SERVER_URI}/insider-data?index=${selectedIndex}&expiry=${expiryToUse}&interval=${intervalToUse}`,
        { withCredentials: true }
      );
      if (res.data && res.data.success) {
        setOptionChainData(res.data);
      } else {
        setOptionChainData(undefined);
        setError("No data returned");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleGoClick = async () => {
    await fetchOptionChainData();
  };

  return (
    <section className="mt-8 p-[3px] rounded-lg bg-white dark:bg-gradient-to-br from-[#00078F] to-[#01071C]">
      <div className="flex flex-col-reverse md:flex-row justify-between gap-4 p-[20px] bg-white dark:bg-db-primary mb-2">
        <div className="flex gap-4 items-center">
          <h1 className="text-3xl font-extrabold">Option Insider</h1>
          <span className="text-2xl">
            <FcCandleSticks />
          </span>
          <span className="flex items-center gap-1 px-2 py-px rounded-full w-fit text-white text-xs font-semibold">
            <GoDotFill className="text-white" /> Live
          </span>
        </div>

        <div className="flex flex-col items-center md:flex-row gap-2 md:gap-4">
          <div className="flex items-center relative border border-[#0E5FF6] rounded-lg px-3 py-1 sm:w-44 h-12 w-full">
            <label className="text-xs">Index:</label>
            <select
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(e.target.value)}
              className=" flex-1 ml-2 focus:outline-none dark:bg-db-primary bg-primary-light"
            >
              <option value="NIFTY">Nifty50</option>
              <option value="BANKNIFTY">BankNifty</option>
              <option value="FINNIFTY">FinNifty</option>
              <option value="MIDCPNIFTY">Midcap</option>
              <option value="SENSEX">Sensex</option>
            </select>
          </div>
          <div className="flex items-center relative border border-[#0E5FF6] rounded-lg px-3 py-1 sm:w-32 h-12 w-full">
            <label className="text-xs">Time:</label>
            <select
              value={selectedInterval}
              onChange={(e) => setSelectedInterval(e.target.value)}
              className="flex-1 ml-2 focus:outline-none dark:bg-db-primary bg-primary-light"
            >
              <option value="3">3m</option>
              <option value="15">15m</option>
            </select>
          </div>
          <div className="flex items-center relative border border-[#0E5FF6] rounded-lg px-3 py-1 sm:w-44 h-12 w-full">
            <label className="text-xs">Expiry:</label>
            <select
              value={selectedExpiry}
              onChange={(e) => setSelectedExpiry(e.target.value)}
              className=" flex-1 ml-2 focus:outline-none dark:bg-db-primary bg-primary-light"
            >
              {expiries?.[selectedIndex]?.length > 0 &&
                expiries?.[selectedIndex]?.map((expiry) => (
                  <option key={expiry} value={expiry}>
                    {expiry}
                  </option>
                ))}
            </select>
          </div>
          <button
            onClick={handleGoClick}
            disabled={!isSubscribed}
            className={`${
              isSubscribed
                ? "bg-[#0E5FF6] hover:bg-[#0b4cd1]"
                : "bg-gray-500 cursor-not-allowed"
            } text-white p-4 rounded-lg transition-colors h-12 text-center`}
          >
            Go
          </button>
        </div>
      </div>

      {error && <div className="text-red-600 mb-2">{error}</div>}
      <Suspense fallback={<div>Loading table...</div>}>
        {loading ? (
          <Loader />
        ) : (
          <OptionInsiderTable
            data={optionChainData?.rows || []}
            isSubscribed={isSubscribed}
          />
        )}
      </Suspense>
    </section>
  );
};

export default AIOptionInsiderPage;
