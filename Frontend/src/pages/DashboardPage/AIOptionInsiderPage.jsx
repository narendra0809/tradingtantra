import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { FcCandleSticks } from "react-icons/fc";
import { io } from "socket.io-client";
import OptionInsiderTable from "../../Components/Dashboard/OptionInsiderTable";
import Loader from "../../Components/Loader";
import StrategyCard from "../../Components/StrategyCard";
import { marketHours } from "../../utils/utils";
import { useSelector } from "react-redux";

const SERVER_URI = import.meta.env.VITE_SERVER_URI || "";
const SOCKET_URI = import.meta.env.VITE_CHAIN_SOCKET_URI || "";

const AIOptionInsiderPage = () => {
  const theme = useSelector((state) => state.theme.theme);
  const [optionChainData, setOptionChainData] = useState();
  const [selectedIndex, setSelectedIndex] = useState("NIFTY");
  const [selectedExpiry, setSelectedExpiry] = useState("");
  const [selectedInterval, setSelectedInterval] = useState("3");
  const [expiries, setExpiries] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

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
        setSelectedExpiry(first);
        if (first) fetchOptionChainData(first, selectedInterval);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch expiries");
      }
    };
    fetchExpiresByIndex();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex]);

  useEffect(() => {
    if (
      !isSubscribed ||
      !SOCKET_URI ||
      !selectedIndex ||
      !selectedExpiry ||
      !selectedInterval ||
      !marketHours()
    )
      return;

    const token = localStorage.getItem("token");
    const newSocket = io(import.meta.env.VITE_CHAIN_SOCKET_URI, {
      path: "/socket-chain",
      auth: { token },
      transports: ["websocket"],
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      if (selectedIndex && selectedExpiry && selectedInterval) {
        newSocket.emit("subscribeOptionInsider", {
          index: selectedIndex,
          expiry: selectedExpiry,
          interval: selectedInterval,
        });
      }
    });

    newSocket.on("optionInsiderUpdate", (payload) => {
      setOptionChainData(payload);
      setLoading(false);
      setError(null);
    });

    newSocket.on("optionInsiderError", (err) => {
      console.log(err);
      setError("Data not found please use Go button");
      setLoading(false);
    });

    newSocket.on("connect_error", (err) => {
      console.log(err);
      setError("Data not found please use Go button");
      setLoading(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isSubscribed, selectedIndex, selectedExpiry, selectedInterval]);

  useEffect(() => {
    if (!socket || !marketHours()) return;
    if (!(selectedIndex && selectedExpiry && selectedInterval)) return;
    setError(null);
    socket.emit("subscribeOptionInsider", {
      index: selectedIndex,
      expiry: selectedExpiry,
      interval: selectedInterval,
    });
  }, [selectedIndex, selectedExpiry, selectedInterval, socket]);
  console.log(error);
  console.log(theme);
  return (
    <section
      className={`mt-8 w-full p-[3px] rounded-2xl  dark:bg-[linear-gradient(113.83deg,#0009B3_0.45%,#02000E_100%)]`}
    >
      <div className="rounded-2xl bg-db-primary-light  dark:bg-db-primary p-5 flex flex-col gap-6">
        {/* top header + controls */}
        <div className="flex flex-col-reverse md:flex-row justify-between gap-4">
          <StrategyCard
            Icon={FcCandleSticks}
            name="option-insider"
            title="Option Insider"
          />

          <div className="flex flex-col items-center md:flex-row gap-2 md:gap-4">
            <div className="flex items-center border border-[#0E5FF6] rounded-lg px-3 py-1 sm:w-44 h-12 w-full">
              <label className="text-xs">Index:</label>
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(e.target.value)}
                className="flex-1 ml-2 focus:outline-none dark:bg-db-primary"
              >
                <option value="NIFTY">Nifty50</option>
                <option value="SENSEX">Sensex</option>
                <option value="BANKNIFTY">BankNifty</option>
                <option value="FINNIFTY">FinNifty</option>
                <option value="MIDCPNIFTY">Midcap</option>
              </select>
            </div>

            <div className="flex items-center border border-[#0E5FF6] rounded-lg px-3 py-1 sm:w-32 h-12 w-full">
              <label className="text-xs">Time:</label>
              <select
                value={selectedInterval}
                onChange={(e) => setSelectedInterval(e.target.value)}
                className="flex-1 ml-2 focus:outline-none dark:bg-db-primary"
              >
                <option value="3">3m</option>
                <option value="15">15m</option>
              </select>
            </div>

            <div className="flex items-center border border-[#0E5FF6] rounded-lg px-3 py-1 sm:w-44 h-12 w-full">
              <label className="text-xs">Expiry:</label>
              <select
                value={selectedExpiry}
                onChange={(e) => setSelectedExpiry(e.target.value)}
                className="flex-1 ml-2 focus:outline-none dark:bg-db-primary"
              >
                {expiries?.[selectedIndex]?.map((expiry) => (
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
              } text-white px-6 rounded-lg transition-colors h-12 text-center`}
            >
              Go
            </button>
          </div>
        </div>

        {/* table area */}
        {loading ? (
          <div className="bg-primary-light dark:bg-db-primary flex justify-center items-center h-[550px] rounded-2xl">
            <Loader />
          </div>
        ) : (
          <OptionInsiderTable
            data={optionChainData?.rows || []}
            isSubscribed={isSubscribed}
          />
        )}
      </div>
    </section>
  );
};

export default AIOptionInsiderPage;
