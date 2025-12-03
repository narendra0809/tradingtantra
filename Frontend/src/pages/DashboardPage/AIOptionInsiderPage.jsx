import axios from "axios";
import Cookies from "js-cookie";
import { Suspense, useEffect, useState } from "react";
import { FcCandleSticks } from "react-icons/fc";
import { io } from "socket.io-client";
import OptionInsiderTable from "../../Components/Dashboard/OptionInsiderTable";
import Loader from "../../Components/Loader";
import VideoModal from "../../Components/VideoModal";
import { marketHours } from "../../utils/utils";
import { ADMIN_SERVER_URI } from "../AdminPages/Home";

const SERVER_URI = import.meta.env.VITE_SERVER_URI || "";
const SOCKET_URI = import.meta.env.VITE_CHAIN_SOCKET_URI || "";

const AIOptionInsiderPage = () => {
  const [strategyVideo, setStrategyVideo] = useState(null);
  const [optionChainData, setOptionChainData] = useState();
  const [selectedIndex, setSelectedIndex] = useState("NIFTY");
  const [selectedExpiry, setSelectedExpiry] = useState("");
  const [selectedInterval, setSelectedInterval] = useState("3");
  const [expiries, setExpiries] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [openVideoModal, setOpenVideoModal] = useState(false);

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

  useEffect(() => {
    const fetchStrategyVideos = async () => {
      try {
        const res = await axios.get(`${ADMIN_SERVER_URI}/get-strategy`, {
          withCredentials: true,
        });
        if (res.status !== 200) {
          throw new Error("Error while fetching videos");
        }
        if (res.data.videos && res.data.videos.length > 0) {
          setStrategyVideo(
            res.data.videos.find(({ name }) => name === "option-insider")
          );
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchStrategyVideos();
  }, []);

  return (
    <section className="mt-8 p-[3px] rounded-lg bg-white dark:bg-gradient-to-br from-[#00078F] to-[#01071C]">
      <div className="flex flex-col-reverse md:flex-row justify-between gap-4 p-[20px] bg-white dark:bg-db-primary mb-px">
        <div className="flex gap-4 items-center">
          <h1 className="text-3xl font-extrabold">Option Insider</h1>
          <span className="text-2xl">
            <FcCandleSticks />
          </span>
          <span
            onClick={() => setOpenVideoModal(true)}
            className="flex items-center gap-1 px-2 py-px rounded-full w-fit text-white text-xs font-semibold cursor-pointer"
          >
            How to use
            <span className="bg-blue-600 px-2 py-1 rounded-full text-xs text-white">
              Live
            </span>
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
              <option value="SENSEX">Sensex</option>
              <option value="BANKNIFTY">BankNifty</option>
              <option value="FINNIFTY">FinNifty</option>
              <option value="MIDCPNIFTY">Midcap</option>
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
      {strategyVideo && (
        <VideoModal
          isOpen={openVideoModal}
          onClose={() => setOpenVideoModal(false)}
          videoUrl={strategyVideo.videoUrl}
          key={strategyVideo.name}
        />
      )}
    </section>
  );
};

export default AIOptionInsiderPage;
