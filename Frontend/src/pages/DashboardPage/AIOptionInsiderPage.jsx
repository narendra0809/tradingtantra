import axios from "axios";
import { useEffect, useState } from "react";
import { FcCandleSticks } from "react-icons/fc";
import { GoDotFill } from "react-icons/go";
import Cookies from "js-cookie";
import Loader from "../../Components/Loader";
import Lock from "../../Components/Dashboard/Lock";

const SERVER_URI = import.meta.env.VITE_SERVER_URI;

const upBadge = (
  <span className="ml-2 bg-green-600 text-white px-2 py-0.5 rounded-full text-xs flex items-center w-fit">
    <span className="mr-1">↑</span> Up
  </span>
);
const downBadge = (
  <span className="ml-2 bg-red-600 text-white px-2 py-0.5 rounded-full text-xs flex items-center w-fit">
    <span className="mr-1">↓</span> Down
  </span>
);
// const confusionBadge = (
//   <span className="ml-2 bg-yellow-600 text-white px-2 py-0.5 rounded-full text-xs flex items-center w-fit">
//     <span className="mr-1">confusion</span>
//   </span>
// );

const AIOptionInsiderPage = () => {
  const [optionChainData, setOptionChainData] = useState();
  const [selectedIndex, setSelectedIndex] = useState("NIFTY");
  const [selectedExpiry, setSelectedExpiry] = useState("");
  const [selectedInterval, setSelectedInterval] = useState("3");
  const [expiries, setExpiries] = useState();
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkSubscription = () => {
      const Subscribed = Cookies.get("isSubscribed");
      setIsSubscribed(Subscribed === "true");
    };

    checkSubscription();
  }, []);
  useEffect(() => {
    const fetchExpiresByIndex = async () => {
      try {
        const res = await axios.get(`${SERVER_URI}/insider-data/expiries`, {
          withCredentials: true,
        });
        setExpiries(res.data.expiriesByIndex);
        setSelectedExpiry(res.data?.expiriesByIndex[selectedIndex][0] || "");
        if (!selectedExpiry) {
          fetchOptionChainData(res.data?.expiriesByIndex[selectedIndex][0]);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchExpiresByIndex();
  }, [selectedIndex]);

  const handleGoClick = async () => {
    fetchOptionChainData();
  };
  const fetchOptionChainData = async (expiry) => {
    if (!selectedIndex || !selectedInterval) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${SERVER_URI}/insider-data?index=${selectedIndex}&expiry=${
          selectedExpiry || expiry
        }&interval=${selectedInterval}`,
        { withCredentials: true }
      );
      setOptionChainData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="sm:p-8">
      <div className="max-w-full mx-auto dark:bg-gradient-to-br from-[#0009B2] to-[#02000E] p-[2px] rounded-lg">
        <div className="p-6 dark:bg-db-primary bg-primary-light">
          <div className="flex flex-col-reverse md:flex-row justify-between gap-4 md:gap-0 mb-4">
            <div className="flex gap-4 items-center">
              <h1 className="text-3xl font-extrabold">Option Insider</h1>
              <span className="text-2xl">
                <FcCandleSticks />
              </span>
              <span className="flex items-center gap-1 px-2 py-px rounded-full w-fit text-white  text-xs font-semibold">
                <GoDotFill className="text-white" />
                Live
              </span>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              <div className="flex items-center relative border border-[#0E5FF6] rounded-lg px-3 py-1 sm:w-44 w-full">
                <label className="text-xs">Index:</label>
                <select
                  onChange={(e) => setSelectedIndex(e.target.value)}
                  className="text-white flex-1 ml-2 focus:outline-none dark:bg-db-primary bg-primary-light"
                >
                  <option value="NIFTY">Nifty50</option>
                  <option value="BANKNIFTY">BankNifty</option>
                  <option value="FINNIFTY">FinNifty</option>
                  <option value="MIDCPNIFTY">Midcap</option>
                  <option value="SENSEX">Sensex</option>
                </select>
              </div>
              <div className="flex items-center relative border border-[#0E5FF6] rounded-lg px-3 py-1 sm:w-32 w-full">
                <label className="text-xs">Time:</label>
                <select
                  onChange={(e) => setSelectedInterval(e.target.value)}
                  className="flex-1 ml-2 focus:outline-none dark:bg-db-primary bg-primary-light"
                >
                  <option value="3">3m</option>
                  <option value="15">15m</option>
                </select>
              </div>
              <div className="flex items-center relative border border-[#0E5FF6] rounded-lg px-3 py-1 sm:w-44 w-full">
                <label className="text-xs">Expiry:</label>
                <select
                  onChange={(e) => setSelectedExpiry(e.target.value)}
                  className="text-white flex-1 ml-2 focus:outline-none dark:bg-db-primary bg-primary-light"
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
                } text-white md:px-6 md:py-8 px-5 py-2 rounded-lg transition-colors`}
              >
                Go
              </button>
            </div>
          </div>

          {/* Table */}
          {isSubscribed ? (
            <div className="h-screen overflow-y-auto rounded-xl mt-4 p-[1px] dark:bg-gradient-to-br from-[#0009B2] to-[#02000E]">
              <table className="h-full overflow-scroll w-full text-sm sm:text-xl dark:bg-db-primary bg-primary-light">
                <thead>
                  <tr className="font-bold">
                    <th
                      style={{
                        fontFamily: "'ABC Repro', sans-serif",
                        fontWeight: 500,
                        fontStyle: "normal",
                      }}
                      className=" py-3 px-4 text-left"
                    >
                      Serial No
                    </th>
                    <th
                      style={{
                        fontFamily: "'ABC Repro', sans-serif",
                        fontWeight: 500,
                        fontStyle: "normal",
                      }}
                      className=" py-3 px-4 text-left"
                    >
                      Time Stamp
                    </th>
                    <th
                      style={{
                        fontFamily: "'ABC Repro', sans-serif",
                        fontWeight: 500,
                        fontStyle: "normal",
                      }}
                      className=" py-3 px-4 text-left"
                    >
                      Call Analysis
                    </th>
                    <th
                      style={{
                        fontFamily: "'ABC Repro', sans-serif",
                        fontWeight: 500,
                        fontStyle: "normal",
                      }}
                      className="py-3 px-4 text-left"
                    >
                      Strike Price
                    </th>
                    <th
                      style={{
                        fontFamily: "'ABC Repro', sans-serif",
                        fontWeight: 500,
                        fontStyle: "normal",
                      }}
                      className="py-3 px-4 text-left"
                    >
                      Put Analysis
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-36">
                        <div className="flex justify-center items-center w-full h-full">
                          <Loader />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    optionChainData &&
                    optionChainData.rows?.length > 0 &&
                    optionChainData.rows.map((row, idx) => (
                      <tr key={idx} className="border-b border-[#232D4E]">
                        <td className="py-3 px-4">{idx + 1}</td>
                        <td className="py-3 px-4">{row.timeStamp}</td>
                        <td className="py-3 px-4 font-semibold">
                          <div className="flex">
                            <span
                              className={
                                row.call.green
                                  ? "text-green-500"
                                  : // : row.call?.yellow
                                    // ? "text-yellow-600"
                                    "text-red-500"
                              }
                            >
                              {row.call.text}
                            </span>
                            {row.call.direction === "up" ? upBadge : downBadge}
                          </div>
                        </td>
                        <td className="py-3 px-4">{row.strikePrice}</td>
                        <td className="py-3 px-4 font-semibold">
                          <div className="flex">
                            <span
                              className={
                                row.put.green
                                  ? "text-green-500"
                                  : // : row.put?.yellow
                                    // ? "text-yellow-600"
                                    "text-red-500"
                              }
                            >
                              {row.put.text}
                            </span>
                            {row.put.direction === "up"
                              ? upBadge
                              : // : row.put.direction === null
                                // ? confusionBadge
                                downBadge}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="w-full h-[500px]">
              <Lock />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AIOptionInsiderPage;
