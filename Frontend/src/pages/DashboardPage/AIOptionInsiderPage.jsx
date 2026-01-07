import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { FcCandleSticks } from "react-icons/fc";
import { io } from "socket.io-client";
import OptionInsiderTable from "../../Components/Dashboard/OptionInsiderTable";
import Loader from "../../Components/Loader";
import StrategyCard from "../../Components/StrategyCard";
import { isMarketOpen } from "../../utils/marketUtils";

const SERVER_URI = import.meta.env.VITE_SERVER_URI || "";
// Extract base URL for Socket.io (remove any path to avoid namespace issues)
const getBaseUrl = (url) => {
  if (!url) return "";
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch {
    return url;
  }
};
const SOCKET_URI = import.meta.env.VITE_SOCKET_URI || getBaseUrl(SERVER_URI);

const AIOptionInsiderPage = () => {
  const [optionChainData, setOptionChainData] = useState();
  const [selectedIndex, setSelectedIndex] = useState("NIFTY");
  const [selectedExpiry, setSelectedExpiry] = useState("");
  const [selectedInterval, setSelectedInterval] = useState("3");
  const [expiries, setExpiries] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isMarketHours, setIsMarketHours] = useState(isMarketOpen());

  // Fetch data via REST API (used when market is closed)
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

  // Check subscription status
  useEffect(() => {
    const Subscribed = Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed === "true");
  }, []);

  // Fetch expiries when index changes
  useEffect(() => {
    const fetchExpiresByIndex = async () => {
      try {
        const res = await axios.get(`${SERVER_URI}/insider-data/expiries`, {
          withCredentials: true,
        });
        const byIndex = res.data.expiriesByIndex || {};
        setExpiries(byIndex);
        const first = byIndex[selectedIndex]?.[0] || "";
        if (first) {
          setSelectedExpiry(first);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch expiries");
      }
    };
    fetchExpiresByIndex();
  }, [selectedIndex]);

  // Monitor market hours status
  useEffect(() => {
    const checkMarketStatus = () => {
      setIsMarketHours(isMarketOpen());
    };

    // Check immediately
    checkMarketStatus();

    // Check every minute
    const interval = setInterval(checkMarketStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  // Main data fetching logic - Hybrid approach (Socket when open, API when closed)
  useEffect(() => {
    if (!isSubscribed || !selectedIndex || !selectedExpiry || !selectedInterval) {
      return;
    }

    // Scenario A: Market is Open - Use Socket for real-time updates
    if (isMarketHours) {
      // Disconnect any existing socket first
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }

      setLoading(true);
      setError(null);

      const newSocket = io(SOCKET_URI, {
        transports: ["websocket"],
        withCredentials: true,
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("✅ Socket connected for Option Insider");
        newSocket.emit("subscribeOptionInsider", {
          index: selectedIndex,
          expiry: selectedExpiry,
          interval: selectedInterval,
        });
      });

      newSocket.on("optionInsiderUpdate", (payload) => {
        console.log("📡 Live Socket Payload:", payload);
        setOptionChainData(payload);
        setLoading(false);
        setError(null);
      });

      newSocket.on("optionInsiderError", (err) => {
        console.error("❌ Socket error:", err);
        setError("Real-time data not available");
        setLoading(false);
        // Fallback to API if socket fails
        fetchOptionChainData();
      });

      newSocket.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err);
        setError("Connection failed, fetching via API");
        setLoading(false);
        // Fallback to API
        fetchOptionChainData();
      });

      // Cleanup on unmount or dependency change
      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    } else {
      // Scenario B: Market is Closed - Use REST API
      // Disconnect socket if connected
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }

      // Fetch data via API
      fetchOptionChainData();
    }
  }, [isSubscribed, selectedIndex, selectedExpiry, selectedInterval, isMarketHours]);

  return (
    <section
      className={`mt-4 sm:mt-6 md:mt-8 w-full p-[2px] sm:p-[3px] rounded-xl sm:rounded-2xl dark:bg-[linear-gradient(113.83deg,#0009B3_0.45%,#02000E_100%)]`}
    >
      <div className="rounded-xl sm:rounded-2xl bg-db-primary-light dark:bg-db-primary p-3 sm:p-4 md:p-5 flex flex-col gap-3 sm:gap-4 md:gap-6">
        {/* top header + controls */}
        <div className="flex flex-col-reverse md:flex-row justify-between gap-3 sm:gap-4">
          <StrategyCard
            Icon={FcCandleSticks}
            name="option-insider"
            title="AI Option Insider"
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 md:gap-4">
            <div className="flex items-center border border-[#0E5FF6] rounded-lg px-2 sm:px-3 py-1.5 sm:py-1 h-10 sm:h-12 w-full sm:w-auto sm:min-w-[140px] md:min-w-[160px]">
              <label className="text-[10px] sm:text-xs whitespace-nowrap">Index:</label>
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(e.target.value)}
                className="flex-1 ml-1 sm:ml-2 focus:outline-none dark:bg-db-primary text-xs sm:text-sm"
              >
                <option value="NIFTY">Nifty50</option>
                <option value="SENSEX">Sensex</option>
                <option value="BANKNIFTY">BankNifty</option>
                <option value="FINNIFTY">FinNifty</option>
                <option value="MIDCPNIFTY">Midcap</option>
              </select>
            </div>

            <div className="flex items-center border border-[#0E5FF6] rounded-lg px-2 sm:px-3 py-1.5 sm:py-1 h-10 sm:h-12 w-full sm:w-auto sm:min-w-[100px] md:min-w-[120px]">
              <label className="text-[10px] sm:text-xs whitespace-nowrap">Time:</label>
              <select
                value={selectedInterval}
                onChange={(e) => setSelectedInterval(e.target.value)}
                className="flex-1 ml-1 sm:ml-2 focus:outline-none dark:bg-db-primary text-xs sm:text-sm"
              >
                <option value="3">3m</option>
                <option value="15">15m</option>
              </select>
            </div>

            <div className="flex items-center border border-[#0E5FF6] rounded-lg px-2 sm:px-3 py-1.5 sm:py-1 h-10 sm:h-12 w-full sm:w-auto sm:min-w-[140px] md:min-w-[160px]">
              <label className="text-[10px] sm:text-xs whitespace-nowrap">Expiry:</label>
              <select
                value={selectedExpiry}
                onChange={(e) => setSelectedExpiry(e.target.value)}
                className="flex-1 ml-1 sm:ml-2 focus:outline-none dark:bg-db-primary text-xs sm:text-sm"
              >
                {expiries?.[selectedIndex]?.map((expiry) => (
                  <option key={expiry} value={expiry}>
                    {expiry}
                  </option>
                ))}
              </select>
            </div>

            {/* Market Status Indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-1 h-10 sm:h-12 justify-center sm:justify-start">
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isMarketHours ? "bg-green-500" : "bg-gray-500"
                }`}
              ></div>
              <span className="text-[10px] sm:text-xs whitespace-nowrap">
                {isMarketHours ? "Live" : "Closed"}
              </span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* table area */}
        {loading ? (
          <div className="bg-primary-light dark:bg-db-primary flex justify-center items-center h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px] rounded-xl sm:rounded-2xl">
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
