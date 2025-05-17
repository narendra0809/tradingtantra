import React, { useEffect, useState, Suspense } from "react";
import { FaPlayCircle } from "react-icons/fa";
import { FcCandleSticks } from "react-icons/fc";
import { GoDotFill } from "react-icons/go";
import { io } from "socket.io-client";
import Cookies from "js-cookie";

// Lazy load components
const TreemapChart = React.lazy(() => import("../../Components/Dashboard/TreemapChart"));
const AISectorChart = React.lazy(() => import("../../Components/Dashboard/AISectorChart"));
const StockCard = React.lazy(() => import("../../Components/Dashboard/StockCard"));
const TreeGrpahsGrid = React.lazy(() => import("../../Components/Dashboard/TreeGraphsGrid"));
const Loader = React.lazy(() => import("../../Components/Loader"));
const Lock = React.lazy(() => import("../../Components/Dashboard/Lock"));

const AiSectorDepthPage = () => {
  const SOCKET_URI = import.meta.env.VITE_SOCKET_URI;
  const token = localStorage.getItem("token");
  const socket = io(`${SOCKET_URI}`, {
    auth: { token },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("✅ Connected to WebSocket Server:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ WebSocket Connection Error:", err.message);
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectorWiseData, setSectorWiseData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const Subscribed = Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed);

    let hasDataArrived = false;

    let interval;

    if (!isFetching) {
      socket.emit("getSectorData", { token });

      setIsFetching(true);
    } else {
      interval = setInterval(() => {
        socket.emit("getSectorData", { token });
      }, 45000);
    }

    const handleSectorScope = (data) => {
      setData(data);
      setSectorWiseData(data?.sectorWiseData);
      hasDataArrived = true;
      setLoading(false);
    };

    socket.on("connect_error", (err) => {
      console.warn("Socket Connection Error:", err.message);
      
      if (err.message.includes("Subscription required")) {
          alert("⚠️ Subscription Required: Please subscribe to access this feature.");
      }
    })  
    socket.on("sectorScope", handleSectorScope);

    return () => {
      socket.off("sectorScope", handleSectorScope);
      socket.off('connect_error')
      clearInterval(interval);
    };
  }, [isFetching]);

  return (
    <>
      <section className="mt-8 dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg h-auto ">
        <div className="dark:bg-db-primary bg-db-primary-light rounded-lg p-2 h-auto pb-12">
          <div className="flex gap-4 items-center">
            <h1 className="text-3xl font-bold">AI Sector Depth</h1>
            <span className="text-xl">
              <FcCandleSticks />
            </span>
            <span className="flex items-center gap-1">
              How to use <FaPlayCircle className="text-[#0256F5]" />
            </span>
            <span className="flex items-center px-2 py-px rounded-full w-fit text-white bg-[#0256F5] text-xs">
              <GoDotFill />
              Live
            </span>
          </div>

          <Suspense fallback={<div>Loading...</div>}>
            {isSubscribed === "false" ? (
              <div className="w-full h-[300px]">
                <Lock />
              </div>
            ) : (
              <>{loading ? <Loader /> : <TreeGrpahsGrid data={data} />}</>
            )}
          </Suspense>
        </div>
      </section>

      <section className="mt-8 dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
        <div className="dark:bg-[#000517] bg-db-primary-light rounded-lg p-2">
          <div className="flex gap-4 items-center mb-4">
            <h2 className="text-2xl font-semibold mb-2">AI Sector Depth</h2>
            <span className="flex items-center gap-1">
              <GoDotFill className="text-[#0256F5]" /> Active
            </span>
            <span className="flex items-center gap-1">
              How to use <FaPlayCircle className="text-[#0256F5]" />
            </span>
          </div>
          <div className="w-full bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
            <Suspense fallback={<div>Loading...</div>}>
              {isSubscribed === "false" ? (
                <div className="w-full h-[300px]">
                  <Lock />
                </div>
              ) : (
                <>
                  {loading ? <Loader /> : <AISectorChart data={sectorWiseData} />}
                </>
              )}
            </Suspense>
          </div>
        </div>
      </section>

      <section className="mt-8">
        {isSubscribed === "false" ? (
          ""
        ) : (
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <Suspense fallback={<div>Loading...</div>}>
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
                    />
                  ))}
              </>
            </Suspense>
          </div>
        )}
      </section>
    </>
  );
};

export default AiSectorDepthPage;