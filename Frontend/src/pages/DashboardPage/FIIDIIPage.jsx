import React, { useEffect, useState, Suspense, useRef } from "react";
import { FaPlayCircle } from "react-icons/fa";
import { FcCandleSticks } from "react-icons/fc";
import { GoDotFill } from "react-icons/go";
import axios from "axios";
import Cookies from "js-cookie";

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

  useEffect(() => {
    renderCountRef.current += 1;
    console.log(`FIIDIIPage re-rendered ${renderCountRef.current} times`);

    const Subscribed = Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed);

    const fetchFiiDiiData = async (attempt = 1, maxAttempts = 3) => {
      try {
        setLoading(true);
        setError(null);
        const source = axios.CancelToken.source();
        const timeout = setTimeout(() => {
          source.cancel("Request timed out");
        }, 10000); // 10s timeout

        const res = await axios.get(`${SERVER_URI}/fii-dii`, {
          cancelToken: source.token,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        clearTimeout(timeout);

        const data = Array.isArray(res.data.resdata) ? res.data.resdata : [];
        setFiiDiiData(data);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.warn("FII/DII request canceled:", err.message);
        } else {
          console.error("FII/DII fetch error:", err);
          if (err.response?.status === 403 || err.response?.status === 401) {
            setError("Subscription required. Please subscribe to access FII/DII data.");
          } else if (attempt < maxAttempts) {
            console.log(`Retrying FII/DII fetch (attempt ${attempt + 1}/${maxAttempts})`);
            setTimeout(() => fetchFiiDiiData(attempt + 1, maxAttempts), 1000);
            return;
          } else {
            setError("Failed to load FII/DII data. Please try again later.");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (!localStorage.getItem("token") && !isSubscribed) {
      setError("Authentication token missing or subscription required.");
      setLoading(false);
      return;
    }

    fetchFiiDiiData();

    return () => {
      // Cleanup not needed for axios cancellation here, but included for completeness
    };
  }, []);

  return (
    <>
      <h1 className="text-3xl font-bold mt-8">FII/DII</h1>
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <section className="mt-8 dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
        <div className="dark:bg-db-primary bg-db-primary-light rounded-lg p-2">
          <div>
            <div className="flex gap-4 items-center">
              <h1 className="text-3xl font-bold">FII/DII</h1>
              <span className="text-xl">
                <FcCandleSticks />
              </span>
              <span className="flex items-center px-2 py-px rounded-full w-fit bg-[#0256F5] text-xs text-white">
                <GoDotFill />
                Live
              </span>
              <span className="flex items-center gap-1">
                How to use <FaPlayCircle className="text-[#0256F5]" />
              </span>
            </div>
            <div className="mt-4 dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
              <Suspense fallback={<div>Loading chart...</div>}>
                <CustomBarChart
                  data={fiiDiiData.slice(0, 10)}
                  loading={loading}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
      <section className="mt-8 dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
        <Suspense fallback={<div>Loading table...</div>}>
          <FiiDiiTable data={fiiDiiData} loading={loading} />
        </Suspense>
      </section>
    </>
  );
};

export default FIIDIIPage;