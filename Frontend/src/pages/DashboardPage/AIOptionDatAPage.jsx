/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { FaPlayCircle } from "react-icons/fa";
import { FcCandleSticks } from "react-icons/fc";
import { GoDotFill } from "react-icons/go";
import GaugeMeter from "../../Components/Dashboard/GaugeMeter";
import moment from "moment-timezone";
import CandleChart from "../../Components/Dashboard/CandleChart";
import OptionDataDonutChart from "../../Components/Dashboard/OptionDataDonutChart";
import useFetchData from "../../utils/useFetchData";
import { useEffect, useState } from "react";
import { lotSize, lotSize1 } from "../../constants/constants";
import axios from "axios";
import Cookies from "js-cookie";
import {
  convertTo12HourFormat,
  generateTimeRanges,
  getLatestTradingDay,
  parseTime,
} from "../../utils/utils";
import Lock from "../../Components/Dashboard/Lock";
const URI = import.meta.env.VITE_SERVER_URI;

const contributeIndex = {
  NIFTY: "NIFTY 50",
  BANKNIFTY: "BANKNIFTY",
  FINNIFTY: "FINNIFTY",
  MIDCPNIFTY: "MIDCAP",
  SENSEX: "SENSEX",
};
const newIndexes = [
  { NIFTY: "Nifty50" },
  { BANKNIFTY: "BankNifty" },
  { FINNIFTY: "FinNifty" },
  { MIDCPNIFTY: "Midcap" },
  { SENSEX: "Sensex" },
];

const meterData = [
  { title: "Sentiment Dial", value: 10.3 },
  { title: "PCR Dial", value: 0.5 },
];

const AIOptionDataPage = () => {
  const { fetchData } = useFetchData();
  const [volumes, setVolumes] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [allIndexPts, setAllIndexPts] = useState({
    "NIFTY 50": { pts: 0, per: 0 },
    BANKNIFTY: { pts: 0, per: 0 },
    FINNIFTY: { pts: 0, per: 0 },
    MIDCPNIFTY: { pts: 0, per: 0 },
    SENSEX: { pts: 0, per: 0 },
  });
  const [contribution, setContribution] = useState({
    indexName: "NIFTY 50",
    contributions: [],
  });
  const [indexCandles, setIndexCandles] = useState([]);
  const [allIndexData, setAllIndexData] = useState({
    Nifty50: { data: [], expiries: [] },
    BankNifty: { data: [], expiries: [] },
    FinNifty: { data: [], expiries: [] },
    Midcap: { data: [], expiries: [] },
    Sensex: { data: [], expiries: [] },
  });
  const [selectedIndex, setSelectedIndex] = useState("NIFTY");
  const [selectedExpiry, setSelectedExpiry] = useState("");
  const [selectedInterval, setSelectedInterval] = useState(3);
  const [loading, setLoading] = useState(false);
  const [firstRender, setFirstRender] = useState(true);
  const [currentCandles, setCurrentCandles] = useState([]);
  const [totalOI, setTotalOI] = useState({ totalCE: 0, totalPE: 0 });
  const [noDataMessage, setNoDataMessage] = useState("");

  const fetchAllIndexPts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${URI}/get-all-index-points`);
      if (res.status !== 200) {
        throw new Error("Error while fetching all index pts.");
      }
      const indexData = {
        "NIFTY 50": res.data.NIFTY,
        BANKNIFTY: res.data.BANKNIFTY,
        MIDCAP: res.data.MIDCAP,
        SENSEX: res.data.SENSEX,
        FINNIFTY: res.data.FINNIFTY,
      };
      setAllIndexPts(indexData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContributionInIndex = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${URI}/index-contribution/${contributeIndex[selectedIndex]}`
      );
      if (res.status !== 200) {
        throw new Error("Error in fetching contribution!");
      }
      setContribution(res.data);
    } catch (error) {
      console.log(`Error in fetching contribution of ${selectedIndex}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchIndexPTS = async () => {
      await fetchAllIndexPts();
    };
    fetchIndexPTS();
  }, []);

  useEffect(() => {
    const fetchContribution = async () => {
      await fetchContributionInIndex();
    };
    fetchContribution();
  }, [selectedIndex]);

  const fetchIndexCandlesData = async () => {
    try {
      setLoading(true);
      const response = await fetchData("index-candles", "GET");
      if (response.status !== 200) {
        throw new Error("Error fetching index candles data");
      }
      setIndexCandles(response.data);
    } catch (error) {
      console.error(`Error fetching index candles data:`, error);
      setIndexCandles([]);
    } finally {
      setLoading(false);
    }
  };

  const calculatePCRByIndexAndExpiry = (allIndexDataArgs, currentExpiry) => {
    const currentIndexName = newIndexes.find((idx) => idx[selectedIndex])[
      selectedIndex
    ];
    const dataByIndex = allIndexDataArgs[currentIndexName].data.data;
    const filteredData = dataByIndex.filter(
      (data) => data.expiry === selectedExpiry || currentExpiry
    );

    let totalCE = 0;
    let totalPE = 0;
    filteredData.forEach((data) => {
      const obj = getTotalOi(data);
      totalCE += obj.totalOiCE;
      totalPE += obj.totalOiPE;
    });

    setTotalOI({
      totalCE: totalCE / lotSize[currentIndexName],
      totalPE: totalPE / lotSize[currentIndexName],
    });
  };

  const fetehAllIndexData = async (index) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleExpiryChange = (e) => {
    setSelectedExpiry(e.target.value);
  };

  const runFetchForOptionData = async () => {
    try {
      setLoading(true);
      const indexes = [
        "NIFTY",
        "BANKNIFTY",
        "FINNIFTY",
        "MIDCPNIFTY",
        "SENSEX",
      ];
      const results = await Promise.all(indexes.map(fetehAllIndexData));

      const newData = {
        Nifty50: results[0],
        BankNifty: results[1],
        FinNifty: results[2],
        Midcap: results[3],
        Sensex: results[4],
      };

      setAllIndexData(newData);
      const currentIndexName = newIndexes.find((idx) => idx[selectedIndex])[
        selectedIndex
      ];

      if (newData[currentIndexName]?.expiries?.length > 0) {
        const firstExpiry = newData[currentIndexName].expiries[0];
        setSelectedExpiry(firstExpiry);

        setTimeout(() => {
          calculatePCRByIndexAndExpiry(newData, firstExpiry);
        }, 0);
      }
    } catch (error) {
      console.error("Error fetching index data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await runFetchForOptionData();
    };
    initializeData();
  }, []);

  useEffect(() => {
    fetchIndexCandlesData();
  }, []);

  useEffect(() => {
    filterDataByIndex();
  }, [indexCandles, selectedIndex, selectedInterval]);

  useEffect(() => {
    if (!firstRender) {
      calculatePCRByIndexAndExpiry(allIndexData);
    } else {
      setFirstRender(false);
    }
  }, [selectedIndex, selectedExpiry]);

  useEffect(() => {
    const Subscribed = Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed === "true");
  }, []);
  const filterDataByIndex = () => {
    const uniqueDates = [
      ...new Set(
        indexCandles.map((candle) =>
          moment(candle.createdAt).tz("Asia/Kolkata").format("DD/MM/YYYY")
        )
      ),
    ];

    const latestDate = uniqueDates.sort((a, b) => {
      const dateA = moment(a, "DD/MM/YYYY").valueOf();
      const dateB = moment(b, "DD/MM/YYYY").valueOf();
      return dateB - dateA;
    })[0];

    if (!latestDate) {
      console.warn("No valid dates found in indexCandles");
      setCurrentCandles([]);
      setNoDataMessage("No candle data available");
      return;
    }

    const selectedIntervalString = `${selectedInterval}m`;
    const filteredData = indexCandles.filter((candle) => {
      const indexName = candle.indexName;
      const interval = candle.interval;
      const candleDate = moment(candle.createdAt)
        .tz("Asia/Kolkata")
        .format("DD/MM/YYYY");
      return (
        candleDate === latestDate &&
        indexName === selectedIndex &&
        (interval === selectedIntervalString ||
          interval === String(selectedInterval))
      );
    });

    if (filteredData.length === 0) {
      console.warn(
        `No candles found for ${selectedIndex} on ${latestDate} with interval ${selectedIntervalString}`
      );
      setNoDataMessage(
        `No ${selectedInterval}m candles available for ${selectedIndex} on ${latestDate}`
      );
    } else {
      setNoDataMessage("");
    }

    const candles = convertCandlesForDisplaying(filteredData);
    setCurrentCandles(candles);
  };

  const handleIntervalChange = (e) => {
    setSelectedInterval(Number(e.target.value));
  };

  const handleIndexChange = (e) => {
    const index = e.target.value;
    setSelectedIndex(index);

    const currentIndexName = newIndexes.find((idx) => idx[index])[index];
    if (allIndexData[currentIndexName]?.expiries?.length > 0) {
      setSelectedExpiry(allIndexData[currentIndexName].expiries[0]);
    }
  };

  const getTotalOi = (data) => {
    let totalOiCE = 0;
    let totalOiPE = 0;
    data.strikeData.forEach((strike) => {
      if (strike.optionType === "CE") {
        totalOiCE += strike.oi;
      } else {
        totalOiPE += strike.oi;
      }
    });
    return { totalOiCE, totalOiPE };
  };

  const convertCandlesForDisplaying = (candles) => {
    return candles
      .map(({ timestamp, open, high, low, close }) => {
        if (
          !timestamp ||
          isNaN(open) ||
          isNaN(high) ||
          isNaN(low) ||
          isNaN(close)
        ) {
          console.warn("Invalid candle data:", {
            timestamp,
            open,
            high,
            low,
            close,
          });
          return null;
        }
        return {
          x: moment(timestamp, "DD/MM/YYYY, hh:mm:ss A")
            .tz("Asia/Kolkata")
            .valueOf(),
          y: [
            open.toFixed(2),
            high.toFixed(2),
            low.toFixed(2),
            close.toFixed(2),
          ],
        };
      })
      .filter((candle) => candle !== null);
  };

  const generateVolumnes = () => {
    const ranges = generateTimeRanges("9:15", "15:30", selectedInterval);
    const volumes = ranges.map((range) => {
      const { TotalOiChangeCE, TotalOiChangePE } =
        getVolumeByIndexAndExpiry(range);
      if (isNaN(TotalOiChangeCE) || isNaN(TotalOiChangePE)) return 0;
      const change = Math.abs(
        Number(TotalOiChangeCE) - Number(TotalOiChangePE)
      );
      const isGreen = TotalOiChangePE > TotalOiChangeCE;
      return {
        change,
        isGreen,
      };
    });
    setVolumes(volumes);
  };

  useEffect(() => {
    const generate = () => {
      if (selectedExpiry && allIndexData) {
        generateVolumnes();
      }
    };
    generate();
  }, [selectedIndex, selectedExpiry, allIndexData, selectedInterval]);

  const getVolumeByIndexAndExpiry = (range) => {
    const currentIndexName = newIndexes.find((idx) => idx[selectedIndex])?.[
      selectedIndex
    ];

    const indexData = allIndexData[currentIndexName]?.data?.data || [];
    let totalOiCE = 0;
    let totalOiPE = 0;
    const startTime = convertTo12HourFormat(range.split("-")[0]);
    const endTime = convertTo12HourFormat(range.split("-")[1]);
    let filteredData = indexData.filter((data) => {
      const expectedExpiry = data.expiry;
      const timeStamp = data.timestamp.trim();
      if (expectedExpiry !== selectedExpiry) return false;

      const { totalOiCE: totalCE, totalOiPE: totalPE } = getTotalOi(data);
      totalOiCE = totalOiCE + totalCE;
      totalOiPE = totalOiPE + totalPE;

      return timeStamp === startTime || timeStamp === endTime;
    });

    filteredData = filteredData.sort(
      (a, b) => parseTime(a.timestamp.trim()) - parseTime(b.timestamp.trim())
    );
    const processedData = processData(filteredData[0], filteredData[1]);
    const changes = getTotalOIChange(processedData);
    return changes;
  };

  const getTotalOIChange = (processedData) => {
    let TotalOiChangeCE = 0;
    let TotalOiChangePE = 0;
    processedData.forEach((data) => {
      TotalOiChangeCE += data.oiChangeCE;
      TotalOiChangePE += data.oiChangePE;
    });

    return {
      TotalOiChangeCE: TotalOiChangeCE.toFixed(2),
      TotalOiChangePE: TotalOiChangePE.toFixed(2),
    };
  };

  const processData = (startTime, endTime) => {
    if (!startTime || !endTime) return [];
    const createStrikeMap = (data) => {
      const map = {};
      data.strikeData.forEach((strike) => {
        const key = `${strike.strikePrice}-${strike.optionType}`;
        map[key] = strike;
      });
      return map;
    };

    const startTimeMap = createStrikeMap(startTime);
    const endTimeMap = createStrikeMap(endTime);

    const mergedMap = new Map();

    const allKeys = new Set([
      ...Object.keys(startTimeMap),
      ...Object.keys(endTimeMap),
    ]);
    allKeys.forEach((key) => {
      const [strikePrice, optionType] = key.split("-");
      const price = parseFloat(strikePrice);

      const morning = startTimeMap[key];
      const evening = endTimeMap[key];

      if (!morning || !evening) return;
      const oiChange = Math.abs(
        (evening.oi - morning.oi) / lotSize1[selectedIndex]
      );
      const priceChange = evening.lastPrice - morning.lastPrice;

      const mapKey = price;
      if (!mergedMap.has(mapKey)) {
        mergedMap.set(mapKey, {
          strikePrice: price,
          oiChangeCE: 0,
          oiChangePE: 0,
          priceChangeCE: 0,
          priceChangePE: 0,
        });
      }

      const existing = mergedMap.get(mapKey);

      if (optionType === "CE") {
        existing.oiChangeCE = oiChange;
        existing.priceChangeCE = priceChange;
      } else {
        existing.oiChangePE = oiChange;
        existing.priceChangePE = priceChange;
      }

      mergedMap.set(mapKey, existing);
    });
    return Array.from(mergedMap.values()).sort(
      (a, b) => a.strikePrice - b.strikePrice
    );
  };

  const checkIfDataIsLatest = (updatedAt) => {
    const convertedDate = new Date(updatedAt).toLocaleDateString();
    const latestTradingDate = getLatestTradingDay().toLocaleDateString();
    return convertedDate === latestTradingDate;
  };

  const currentIndexName = newIndexes.find((idx) => idx[selectedIndex])[
    selectedIndex
  ];
  const currentExpiries = allIndexData[currentIndexName]?.expiries || [];

  return (
    <>
      <section className="mt-5 flex lg:flex-row flex-col md:justify-between lg:items-center lg:gap-y-0 gap-y-4">
        <div className="flex gap-4 items-center">
          <h1 className="text-3xl font-bold">AI Option Data</h1>
          <span className="text-xl">
            <FcCandleSticks />
          </span>
          <span className="flex items-center px-2 py-px rounded-full w-fit text-white bg-[#0256F5] text-xs">
            <GoDotFill />
            Live
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <div className="flex items-center relative border border-[#0E5FF6] w-full md:w-fit rounded-lg px-2 md:px-3 py-1">
            <label className="text-xs md:text-sm">Index:</label>
            <select
              onChange={handleIndexChange}
              id="index"
              className="bg-transparent focus:outline-none w-full"
            >
              <option
                className="dark:bg-db-secondary bg-primary-light text-white"
                value="NIFTY"
              >
                Nifty50
              </option>
              <option
                className="dark:bg-db-secondary bg-primary-light text-white"
                value="BANKNIFTY"
              >
                BankNifty
              </option>
              <option
                className="dark:bg-db-secondary bg-primary-light text-white"
                value="FINNIFTY"
              >
                FinNifty
              </option>
              <option
                className="dark:bg-db-secondary bg-primary-light text-white"
                value="MIDCPNIFTY"
              >
                Midcap
              </option>
              <option
                className="dark:bg-db-secondary bg-primary-light text-white"
                value="SENSEX"
              >
                Sensex
              </option>
            </select>
          </div>

          <div className="flex items-center relative border border-[#0E5FF6] w-full md:w-fit rounded-lg px-2 md:px-3 py-1">
            <label className="text-xs md:text-sm">Time:</label>
            <select
              onChange={handleIntervalChange}
              id="interval"
              className="bg-transparent focus:outline-none w-full"
            >
              <option
                className="dark:bg-db-secondary bg-primary-light text-white"
                value="3"
              >
                3m
              </option>
              <option
                className="dark:bg-db-secondary bg-primary-light text-white"
                value="15"
              >
                15m
              </option>
              <option
                className="dark:bg-db-secondary bg-primary-light text-white"
                value="30"
              >
                30m
              </option>
            </select>
          </div>

          <div className="flex items-center relative border border-[#0E5FF6] w-full md:w-fit rounded-lg px-2 md:px-3 py-1">
            <label className="text-xs md:text-sm">Expiry:</label>
            <select
              onChange={handleExpiryChange}
              id="expiry"
              className="bg-transparent focus:outline-none w-full"
            >
              {currentExpiries.map((expiry) => (
                <option
                  className="dark:bg-db-secondary bg-primary-light text-white"
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

      <section className="grid lg:grid-cols-2 grid-cols-1 gap-4 mt-8">
        <div className="dark:bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-lg">
          <div className="dark:bg-db-primary bg-primary-light rounded-lg p-4 h-full">
            <div className="flex gap-4 items-center">
              <h1 className="text-2xl font-medium">{selectedIndex}</h1>
              <span className="flex gap-1 items-center text-base font-light ">
                How to Use <FaPlayCircle className="text-[#0256F5]" />
              </span>
              <span className="flex items-center px-2 py-px rounded-full w-fit h-fit bg-[#0256F5] text-xs text-white">
                <GoDotFill />
                Live
              </span>
            </div>
            <div className="mt-8 h-[350px] lg:h-[88%]">
              {!isSubscribed ? (
                <Lock />
              ) : noDataMessage ? (
                <p className="text-center text-white">{noDataMessage}</p>
              ) : (
                <CandleChart candles={currentCandles} volumes={volumes} />
              )}
            </div>
          </div>
        </div>

        <div className="dark:bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-lg">
          <div className="h-full dark:bg-db-primary bg-primary-light rounded-lg">
            <div className="flex flex-col items-center h-[400px] gap-5">
              {!isSubscribed ? (
                <Lock />
              ) : (
                meterData.map((item, index) => (
                  <GaugeMeter
                    key={index}
                    title={item.title}
                    totalOI={totalOI}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-lg">
        <div className="w-full h-full dark:bg-db-primary bg-primary-light rounded-lg p-4">
          <OptionDataDonutChart
            contributor={contribution}
            allIndexPts={allIndexPts}
            isSubscribed={isSubscribed}
          />
        </div>
      </section>
    </>
  );
};

export default AIOptionDataPage;
