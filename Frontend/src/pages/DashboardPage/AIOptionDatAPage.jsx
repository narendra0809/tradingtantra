import { FaPlayCircle } from "react-icons/fa";
import { FcCandleSticks } from "react-icons/fc";
import { GoDotFill } from "react-icons/go";
import GaugeMeter from "../../Components/Dashboard/GaugeMeter";

import CandleChart from "../../Components/Dashboard/CandleChart";
import OptionDataDonutChart from "../../Components/Dashboard/OptionDataDonutChart";
import useFetchData from "../../utils/useFetchData";
import { useEffect, useState } from "react";

const meterData = [
  {
    title: "Sector Depth",
    value: 10.3,
  },
  {
    title: "PCR",
    value: 0.9,
  },
];
const AIOptionDataPage = () => {
  const { fetchData } = useFetchData();
  const [allIndexData, setAllIndexData] = useState({
    Nifty50: { data: [], expiries: [] },
    BankNifty: { data: [], expiries: [] },
    FinNifty: { data: [], expiries: [] },
    Midcap: { data: [], expiries: [] },
    Sensex: { data: [], expiries: [] },
  });
  const [selectedIndex, setSelectedIndex] = useState("Nifty50");
  const [selectedExpiry, setSelectedExpiry] = useState("");
  const [selectedInterval, setSelectedInterval] = useState("3m");
  const [loading, setLoading] = useState(false);
  const [currData, setCurrData] = useState([]);

  const fetchIndexData = async (index) => {
    try {
      const response = await fetchData(
        `option-data/underlying?underlyingName=${index}`,
        "GET"
      );
      return {
        data: response.data || [],
        expiries: response.data?.expiries || [],
      };
    } catch (error) {
      console.error(`Error fetching ${index} data:`, error);
      return { data: [], expiries: [] };
    }
  };

  const handleExpiryChange = (e) => {
    setSelectedExpiry(e.target.value);
  };

  const fetchAllIndexData = async () => {
    try {
      setLoading(true);
      const indexes = [
        "NIFTY",
        "BANKNIFTY",
        "FINNIFTY",
        "MIDCPNIFTY",
        "SENSEX",
      ];
      const results = await Promise.all(indexes.map(fetchIndexData));

      const newIndexes = [
        "Nifty50",
        "BankNifty",
        "FinNifty",
        "Midcap",
        "Sensex",
      ];
      const newData = {};

      newIndexes.forEach((index, i) => {
        newData[index] = results[i].data;
      });

      setAllIndexData(newData);

      console.log("Data Fetch : ", newData);

      if (newData.Nifty50?.expiries?.length > 0) {
        setSelectedExpiry(() => newData.Nifty50.expiries[0]);
        // getDataByIndexAndExpiry("15:03-15:09");
      }
    } catch (error) {
      console.error("Error fetching index data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchAllIndexData();
    };
    initializeData();
  }, []);

  useEffect(() => {
    processData();
  }, [allIndexData]);

  useEffect(() => {
    if (selectedExpiry) {
      // getDataByIndexAndExpiry("09:15-15:30");
    }
  }, [selectedExpiry, selectedIndex]);

  const handleIntervalChange = (e) => {
    setSelectedInterval(e.target.value);
  };
  const handleIndexChange = (e) => {
    const index = e.target.value;
    setSelectedIndex(index);
    if (allIndexData[index]?.expiries?.length > 0) {
      setSelectedExpiry(allIndexData[index].expiries[0]);
    }
  };

  const processData = () => {
    const pricePoints = extractPricePoints(allIndexData[selectedIndex].data);
    console.log("Price Points : ", pricePoints);

    const candles = createCandles(pricePoints, 3);
    console.log(candles);
  };

  const extractPricePoints = (data) => {
    return data.map((item) => {
      const today = new Date().toISOString().split("T")[0];
      const dateTime = `${today} ${item.timestamp.trim()}`;
      const timestamp = new Date(dateTime).getTime();
      return {
        timestamp,
        price: item.lastPrice,
      };
    });
  };

  const createCandles = (pricePoints, intervalMinutes = 3) => {
    if (!pricePoints.length) return [];

    const intervalMs = intervalMinutes * 60 * 1000;
    const candles = [];
    let currentCandle = null;

    pricePoints.sort((a, b) => a.timestamp - b.timestamp);

    const firstPoint = pricePoints[0];
    const firstCandleStart =
      Math.floor(firstPoint.timestamp / intervalMs) * intervalMs;

    currentCandle = {
      timestamp: firstCandleStart,
      open: firstPoint.price,
      high: firstPoint.price,
      low: firstPoint.price,
      close: firstPoint.price,
    };

    for (let i = 1; i < pricePoints.length; i++) {
      const point = pricePoints[i];
      if (point.timestamp < currentCandle.timestamp + intervalMs) {
        currentCandle.high = Math.max(currentCandle.high, point.price);
        currentCandle.low = Math.min(currentCandle.low, point.price);
        currentCandle.close = point.price;
      } else {
        candles.push(currentCandle);

        const newCandleStart =
          Math.floor(point.timestamp / intervalMs) * intervalMs;
        currentCandle = {
          timestamp: newCandleStart,
          open: point.price,
          high: point.price,
          low: point.price,
          close: point.price,
        };
      }
    }
    if (currentCandle) {
      candles.push(currentCandle);
    }
    return candles;
  };

  const currentExpiries = allIndexData[selectedIndex]?.expiries || [];

  return (
    <>
      <section className="mt-5 flex lg:flex-row flex-col md:justify-between lg:items-center lg:gap-y-0 gap-y-4">
        <div className="flex gap-4  items-center">
          <h1 className="text-3xl font-bold">AI Option Data</h1>
          <span className="text-xl">
            <FcCandleSticks />
          </span>
          <span className="flex items-center px-2 py-px rounded-full w-fit text-white bg-[#0256F5] text-xs">
            <GoDotFill />
            Live
          </span>
        </div>

        <div className="flex gap-4">
          <div className="relative border border-[#0E5FF6] w-fit rounded-lg px-4 py-2 t">
            <label className="text-sm">Index:</label>
            <select
              onChange={handleIndexChange}
              id="index"
              className="bg-transparent focus:outline-none"
            >
              <option
                className="dark:bg-db-secondary bg-db-primary  text-white"
                value="Nifty50"
              >
                Nifty50
              </option>
              <option
                className="dark:bg-db-secondary bg-db-primary  text-white"
                value="BankNifty"
              >
                BankNifty
              </option>
              <option
                className="dark:bg-db-secondary bg-db-primary  text-white"
                value="BankNifty"
              >
                FinNifty
              </option>
              <option
                className="dark:bg-db-secondary bg-db-primary  text-white"
                value="BankNifty"
              >
                Midcap
              </option>
              <option
                className="dark:bg-db-secondary bg-db-primary  text-white"
                value="Sensex"
              >
                Sensex
              </option>
            </select>
          </div>

          <div className="relative border border-[#0E5FF6] w-fit rounded-lg px-4 py-2 ">
            <label className="text-sm">Time:</label>
            <select
              onChange={handleIntervalChange}
              id="interval"
              className="bg-transparent focus:outline-none"
            >
              <option
                className="dark:bg-db-secondary bg-db-primary text-white "
                value="3m"
              >
                3m
              </option>
              <option
                className="dark:bg-db-secondary bg-db-primary text-white "
                value="15m"
              >
                15m
              </option>
              <option
                className="dark:bg-db-secondary bg-db-primary text-white "
                value="30m"
              >
                30m
              </option>
            </select>
          </div>

          <div className="relative border border-[#0E5FF6] w-fit rounded-lg px-4 py-2  ">
            <label className="text-sm">Expiry:</label>
            <select
              onChange={handleExpiryChange}
              id="expiry"
              className="bg-transparent focus:outline-none"
            >
              {currentExpiries.map((expiry) => (
                <option
                  className="dark:bg-db-secondary bg-db-primary text-white"
                  value={expiry}
                  key={expiry}
                >
                  {expiry}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* second  section */}
      <section className="grid lg:grid-cols-2 grid-cols-1 gap-4 mt-8">
        {/* first card */}
        <div className="dark:bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-lg">
          <div className="dark:bg-db-primary bg-db-primary   rounded-lg p-4 h-full ">
            {/* heading */}
            <div className="flex gap-4 items-center ">
              <h1 className="text-2xl font-medium ">Nifty 50</h1>

              <span className="flex gap-1 items-center text-base font-light text-white">
                How to Use <FaPlayCircle className="text-[#0256F5]" />{" "}
              </span>

              <span className="flex items-center px-2 py-px rounded-full w-fit h-fit bg-[#0256F5] text-xs text-white">
                <GoDotFill />
                Live
              </span>
            </div>

            <div className="mt-8 h-[350px]">
              <CandleChart />
            </div>
          </div>
        </div>

        {/* second card */}
        <div className="dark:bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-lg">
          <div className="dark:bg-db-primary bg-db-primary   rounded-lg p-4 ">
            <div className="grid grid-cols-2 gap-4">
              {meterData.map((item, index) => (
                <GaugeMeter key={index} title={item.title} value={item.value} />
              ))}
            </div>

            <div className="flex gap-4 items-center mt-8">
              <h1 className="text-2xl font-medium ">Money Flux</h1>

              <span className="flex gap-1 items-center text-base font-light ">
                How to Use <FaPlayCircle className="text-[#0256F5]" />{" "}
              </span>

              <span className="flex items-center px-2 py-px rounded-full w-fit h-fit bg-[#0256F5] text-xs text-white">
                <GoDotFill />
                Live
              </span>
            </div>

            <div className="rounded-lg overflow-hidden h-[350px] mt-4">
              {/* <TreemapChart/> */}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-lg">
        <div className="w-full h-full dark:bg-db-primary bg-db-primary   rounded-lg p-4">
          <OptionDataDonutChart />
        </div>
      </section>
    </>
  );
};

export default AIOptionDataPage;
