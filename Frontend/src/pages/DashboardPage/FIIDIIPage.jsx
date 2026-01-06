/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import Cookies from "js-cookie";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { FcCandleSticks } from "react-icons/fc";
import Lock from "../../Components/Dashboard/Lock";
import StrategyCard from "../../Components/StrategyCard";

// Lazy load components with debugging
const CustomBarChart = React.lazy(() => {
  console.log("Attempting to load CustomBarChart");
  return import("../../Components/Dashboard/FIIDIIchart")
    .then((module) => {
      console.log("CustomBarChart module:", module);
      const component = module.default || module.CustomBarChart;
      if (!component) {
        console.error("CustomBarChart export missing");
        throw new Error("CustomBarChart export missing");
      }
      console.log("CustomBarChart loaded successfully");
      return { default: component };
    })
    .catch((err) => {
      console.error("Failed to load CustomBarChart:", err);
      return { default: () => <div>Failed to load chart</div> };
    });
});
const FiiDiiTable = React.lazy(() => {
  console.log("Attempting to load FiiDiiTable");
  return import("../../Components/Dashboard/FiiDiiTable")
    .then((module) => {
      console.log("FiiDiiTable module:", module);
      const component = module.default || module.FiiDiiTable;
      if (!component) {
        console.error("FiiDiiTable export missing");
        throw new Error("FiiDiiTable export missing");
      }
      console.log("FiiDiiTable loaded successfully");
      return { default: component };
    })
    .catch((err) => {
      console.error("Failed to load FiiDiiTable:", err);
      return { default: () => <div>Failed to load table</div> };
    });
});

// Preload CustomBarChart (critical for UI)
import("../../Components/Dashboard/FIIDIIchart").catch((err) =>
  console.error("Preload failed for CustomBarChart:", err)
);

const FIIDIIPage = () => {
  const SERVER_URI = import.meta.env.VITE_SERVER_URI;
  const [loading, setLoading] = useState(false);
  const [fiiDiiData, setFiiDiiData] = useState([]);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(null);
  const renderCountRef = useRef(0);

 const checkSubscription = async () => {
    try {
      const res = await axios.get(
        `${SERVER_URI}/subcription-end-date`,
        {
          withCredentials: true, // 🔥 cookie based auth
        }
      );

      setIsSubscribed(res.data.isSubscribed);
    } catch (err) {
      // 🔥 session takeover / invalid session
      if (err.response?.data?.code === "SESSION_TAKEN_OVER") {
        alert("You have been logged out. Someone logged in from another device.");
        window.location.href = "/login";
        return;
      }

      setIsSubscribed(false);
    }
  };

  // 📊 STEP 2: FETCH FII/DII DATA
  const fetchFiiDiiData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${SERVER_URI}/fii-dii`, {
        withCredentials: true, // 🔥 IMPORTANT
      });

      const data = Array.isArray(res.data.resdata)
        ? res.data.resdata
        : [];

      setFiiDiiData(data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please login again.");
      } else if (err.response?.status === 403) {
        setError("Subscription required.");
      } else {
        setError("Failed to load FII/DII data.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🚀 INIT
  useEffect(() => {
    const init = async () => {
      await checkSubscription();
      await fetchFiiDiiData();
    };

    init();
  }, []);

  return (
    <>
      {error && (
        <div className="mt-4 p-3 sm:p-4 bg-red-100 text-red-700 rounded-lg text-sm sm:text-base">
          {error}
        </div>
      )}
      <StrategyCard Icon={FcCandleSticks} title={"FII/DII"} name={"fii-dii"} />
      {!isSubscribed ? (
        <Lock />
      ) : (
        <>
          <section className="mt-4 sm:mt-6 md:mt-8 dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
            <div className="dark:bg-db-primary bg-primary-light rounded-lg p-2 sm:p-3 md:p-4">
              <div className="mt-2 sm:mt-3 md:mt-4 dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
                <Suspense fallback={<div>Loading chart...</div>}>
                  <CustomBarChart
                    data={fiiDiiData.slice(0, 10)}
                    loading={loading}
                  />
                </Suspense>
              </div>
            </div>
          </section>
          <section className="mt-4 sm:mt-6 md:mt-8 dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
            <Suspense fallback={<div>Loading table...</div>}>
              <FiiDiiTable data={fiiDiiData} loading={loading} />
            </Suspense>
          </section>
        </>
      )}
    </>
  );
};

export default FIIDIIPage;
