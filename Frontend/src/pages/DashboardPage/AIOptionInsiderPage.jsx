import axios from "axios";
import { Suspense, useEffect, useState } from "react";
import { FcCandleSticks } from "react-icons/fc";
import { GoDotFill } from "react-icons/go";
import Cookies from "js-cookie";
import Loader from "../../Components/Loader";
import OptionInsiderTable from "../../Components/Dashboard/OptionInsiderTable";
import { io } from "socket.io-client";
import { marketHours } from "../../utils/utils";

const AIOptionInsiderPage = () => {
  const SERVER_URI = import.meta.env.VITE_SERVER_URI || "";
  const SOCKET_URI = import.meta.env.VITE_SOCKET_URI || "";

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
    const newSocket = io(SOCKET_URI, {
      auth: { token },
      transports: ["websocket"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Connected to WebSocket Server:", newSocket.id);
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
      setError(err.message || "Error receiving option insider data");
      setLoading(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("WebSocket connect error", err.message);
      setError("WebSocket connection error");
      setLoading(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [
    isSubscribed,
    SOCKET_URI,
    selectedIndex,
    selectedExpiry,
    selectedInterval,
  ]);

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

  return (
    <section className="mt-8 p-[3px] rounded-lg bg-white dark:bg-gradient-to-br from-[#00078F] to-[#01071C]">
      <div className="flex flex-col-reverse md:flex-row justify-between gap-4 p-[20px] bg-white dark:bg-db-primary mb-px">
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
          <div className="dark:bg-db-primary bg-primary-light flex justify-center items-center h-[550px]">
            <Loader />
          </div>
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
