// src/pages/AIOptionInsiderPage.jsx
import axios from "axios";
import { Suspense, useEffect, useState } from "react";
import { FcCandleSticks } from "react-icons/fc";
import { GoDotFill } from "react-icons/go";
import Cookies from "js-cookie";
import Loader from "../../Components/Loader";
import OptionInsiderTable from "../../Components/Dashboard/OptionInsiderTable";

const SERVER_URI = import.meta.env.VITE_SERVER_URI || "";

const AIOptionInsiderPage = () => {
  const [optionChainData, setOptionChainData] = useState();
  const [selectedIndex, setSelectedIndex] = useState("NIFTY");
  const [selectedExpiry, setSelectedExpiry] = useState("");
  const [selectedInterval, setSelectedInterval] = useState("3");
  const [expiries, setExpiries] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const Subscribed = Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed === "true");
  }, []);

  useEffect(() => {
    const fetchExpiresByIndex = async () => {
      try {
        const res = await axios.get(`${SERVER_URI}/insider-data/expiries`, { withCredentials: true });
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

  return (
    <section className="mt-8 p-[3px] rounded-lg bg-white dark:bg-gradient-to-br from-[#00078F] to-[#01071C]">
      <div className="flex flex-col-reverse md:flex-row justify-between gap-4 p-[20px] bg-white dark:bg-db-primary">
        <div className="flex gap-4 items-center">
          <h1 className="text-3xl font-extrabold">Option Insider</h1>
          <span className="text-2xl"><FcCandleSticks /></span>
          <span className="flex items-center gap-1 px-2 py-px rounded-full w-fit text-white text-xs font-semibold">
            <GoDotFill className="text-white" /> Live
          </span>
        </div>

        <div className="flex gap-3 items-center">
          <div className="border border-[#0E5FF6] rounded-lg px-3 py-1">
            <label className="text-xs">Index:</label>
            <select value={selectedIndex} onChange={(e) => { setSelectedIndex(e.target.value); setSelectedExpiry(""); }} className="ml-2">
              <option value="NIFTY">Nifty50</option>
              <option value="BANKNIFTY">BankNifty</option>
              <option value="FINNIFTY">FinNifty</option>
              <option value="MIDCPNIFTY">Midcap</option>
              <option value="SENSEX">Sensex</option>
            </select>
          </div>

          <div className="border border-[#0E5FF6] rounded-lg px-3 py-1">
            <label className="text-xs">Time:</label>
            <select value={selectedInterval} onChange={(e) => setSelectedInterval(e.target.value)} className="ml-2">
              <option value="3">3m</option>
              <option value="15">15m</option>
            </select>
          </div>

          <div className="border border-[#0E5FF6] rounded-lg px-3 py-1">
            <label className="text-xs">Expiry:</label>
            <select value={selectedExpiry} onChange={(e) => setSelectedExpiry(e.target.value)} className="ml-2">
              {expiries?.[selectedIndex]?.length > 0 ? expiries[selectedIndex].map((e) => <option key={e} value={e}>{e}</option>) : <option value="">No expiries</option>}
            </select>
          </div>

          <button
            onClick={handleGoClick}
            disabled={!isSubscribed || loading}
            className={`${isSubscribed ? "bg-[#0E5FF6]" : "bg-gray-500"} text-white px-4 py-2 rounded`}
            title={isSubscribed ? "Fetch" : "Subscription required"}
          >
            {loading ? "Loading..." : "Go"}
          </button>
        </div>
      </div>

      <div className="p-4">
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <Suspense fallback={<div>Loading table...</div>}>
          {loading ? <Loader /> : <OptionInsiderTable data={optionChainData?.rows || []} />}
        </Suspense>
      </div>
    </section>
  );
};

export default AIOptionInsiderPage;
