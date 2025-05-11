import React, { useEffect, useState } from "react";
import { FaPlayCircle } from "react-icons/fa";
import { FcCandleSticks } from "react-icons/fc";
import { GoDotFill } from "react-icons/go";
import TreemapChart from "../../Components/Dashboard/TreemapChart";
import AISectorChart from "../../Components/Dashboard/AISectorChart";
import StockCard from "../../Components/Dashboard/StockCard";
import TreeGrpahsGrid from "../../Components/Dashboard/TreeGraphsGrid";
import { io } from "socket.io-client";
import Loader from "../../Components/Loader";
import Lock from "../../Components/Dashboard/Lock";

import Cookies from "js-cookie";
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

    // socket.emit("getData");

    if (!isFetching) {
      socket.emit("getSectorData", { token });

      setIsFetching(true);
    } else {
      interval = setInterval(() => {
        socket.emit("getSectorData", { token });
      }, 30000);
    }

    // Define event handler
    const handleSectorScope = (data) => {
      setData(data);
      // console.log("data", data);
      setSectorWiseData(data?.sectorWiseData);
      // console.log("sectorwise data", data?.sectorWiseData);
      hasDataArrived = true;
      setLoading(false);
    };

    socket.on("connect_error", (err) => {
      console.warn("Socket Connection Error:", err.message);
      
      if (err.message.includes("Subscription required")) {
          alert("⚠️ Subscription Required: Please subscribe to access this feature.");
      }
  })  
    // Attach event listener
    socket.on("sectorScope", handleSectorScope);

    return () => {
      // Cleanup: Remove event listener and clear timeout
      socket.off("sectorScope", handleSectorScope);
      socket.off('connect_error')
      // clearTimeout(timeout);
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

          
          {isSubscribed === "false" ? (
            <div className="w-full h-[300px]">
              <Lock />
            </div>
          ) : (
            <>{loading ? <Loader /> : <TreeGrpahsGrid data={data} />}</>
          )}
        </div>
      </section>

      <section className="mt-8 dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
        <div className="dark:bg-[#000517] bg-db-primary-light rounded-lg p-2">
          <div className="flex gap-4 items-center mb-4">
            <h2 className="text-2xl font-semibold mb-2">AI Sector Depth</h2>
            <span className="flex items-center gap-1">
              {" "}
              <GoDotFill className="text-[#0256F5]" /> Active
            </span>
            <span className="flex items-center gap-1">
              How to use <FaPlayCircle className="text-[#0256F5]" />
            </span>
          </div>
          <div className="w-full bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
            {isSubscribed === "false" ? (
              <div className="w-full h-[300px]">
                <Lock />
              </div>
            ) : (
              <>
                {loading ? <Loader /> : <AISectorChart data={sectorWiseData} />}
              </>
            )}
          </div>
        </div>
      </section>

      {/* shares card */}

      <section className="mt-8">
        {isSubscribed === "false" ? (
          ""
        ) : (
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <>
              {Object.entries(sectorWiseData)
                .filter(([sector]) => sector !== "Uncategorized") // Filter out 'Uncategorized' before mapping
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
          </div>
        )}
      </section>
    </>
  );
};

export default AiSectorDepthPage;
