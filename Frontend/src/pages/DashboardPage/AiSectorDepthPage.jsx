/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { FaPlayCircle } from "react-icons/fa";
import { FcCandleSticks } from "react-icons/fc";
import { io } from "socket.io-client";
import AISectorChart from "../../Components/Dashboard/AISectorChart";
import Lock from "../../Components/Dashboard/Lock";
import StockCard from "../../Components/Dashboard/StockCard";
import TreeGraphsGrid from "../../Components/Dashboard/TreeGraphsGrid";
import Loader from "../../Components/Loader";
import StrategyCard from "../../Components/StrategyCard";

const AiSectorDepthPage = () => {
  const SOCKET_URI = import.meta.env.VITE_SOCKET_URI;
  const VITE_SERVER_URI = import.meta.env.VITE_SERVER_URI;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectorWiseData, setSectorWiseData] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isMarketHours, setIsMarketHours] = useState(checkMarketHours());

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

  const fetchSectorData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${VITE_SERVER_URI}/sector-depth`);
      if (response.status !== 200) {
        throw new Error("Fetch failed for Sector Depth Action!");
      }
      const data = response.data;
      setData(data);
      setSectorWiseData(data.sectorWiseData);
    } catch (error) {
      console.error("Error fetching sector data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectorScope = (data) => {
    setData(data);
    setSectorWiseData(data.sectorWiseData);
    setLoading(false);
  };

  const initSocket = () => {
    const token = localStorage.getItem("token");
    const newSocket = io(`${SOCKET_URI}`, {
      auth: { token },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to WebSocket Server:", newSocket.id);
      newSocket.emit("getSectorData", { token });
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ WebSocket Connection Error:", err.message);
      if (err.message.includes("Subscription required")) {
        alert(
          "⚠️ Subscription Required: Please subscribe to access this feature."
        );
      }

      fetchSectorData();
    });

    newSocket.on("sectorScope", handleSectorScope);

    setSocket(newSocket);
    return newSocket;
  };

  useEffect(() => {
    const Subscribed = Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed === "true");

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
    let apiPollInterval;

    if (isMarketHours) {
      socketInstance = initSocket();

      apiPollInterval = setInterval(() => {
        const token = localStorage.getItem("token");
        socketInstance.emit("getSectorData", { token });
      }, 45000);
    } else {
      fetchSectorData();
    }

    return () => {
      if (socketInstance) {
        socketInstance.off("sectorScope", handleSectorScope);
        socketInstance.disconnect();
      }
      clearInterval(apiPollInterval);
    };
  }, [isMarketHours, isSubscribed]);

  const handleGoToTable = (title) => {
    document
      .getElementById(title)
      .scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <section className="mt-8 dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg h-auto ">
        <div className="dark:bg-db-primary bg-primary-light rounded-lg p-2 h-auto pb-12">
          <StrategyCard
            Icon={FcCandleSticks}
            name={"sector-depth-grid"}
            title={"AI Sector Depth"}
          />

          {!isSubscribed ? (
            <div className="w-full h-[300px]">
              <Lock />
            </div>
          ) : (
            <>
              {loading ? (
                <div className="flex justify-center">
                  <Loader />
                </div>
              ) : (
                <TreeGraphsGrid
                  data={data}
                  loading={loading}
                  handleGoToTable={handleGoToTable}
                />
              )}
            </>
          )}
        </div>
      </section>

      <section className="mt-8 dark:bg-linear-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
        <div className="dark:bg-[#000517] bg-primary-light rounded-lg p-2">
          <div className="p-2">
            <StrategyCard
              Icon={FaPlayCircle}
              name={"sector-depth-chart"}
              title={"AI Sector Depth Chart"}
            />
          </div>
          <div className="w-full dark:bg-linear-to-br from-[#00078F] to-[#01071C] p-px rounded-lg bg-[#EEEEEE] ">
            {!isSubscribed ? (
              <div className="w-full h-[300px]">
                <Lock />
              </div>
            ) : (
              <>
                {loading ? (
                  <div className="flex justify-center">
                    <Loader />
                  </div>
                ) : (
                  <AISectorChart
                    data={sectorWiseData}
                    handleGoToTable={handleGoToTable}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* shares card */}
      <section className="mt-8">
        {!loading && (
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <>
              {Object.entries(sectorWiseData)
                .filter(([sector]) => sector !== "Uncategorized")
                .map(([sector, values], index) => (
                  <StockCard
                    key={index}
                    title={sector}
                    data={values}
                    loading={loading}
                    error={false}
                    isSubscribed={isSubscribed}
                  />
                ))}
            </>
          </div>
        )}
      </section>
    </>
  );
};

export default AiSectorDepthPage;
