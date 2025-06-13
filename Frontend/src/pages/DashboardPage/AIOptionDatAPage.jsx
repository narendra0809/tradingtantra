/* eslint-disable react-hooks/exhaustive-deps */
import { FaPlayCircle } from "react-icons/fa";
import { FcCandleSticks } from "react-icons/fc";
import { GoDotFill } from "react-icons/go";
import GaugeMeter from "../../Components/Dashboard/GaugeMeter";
import moment from "moment";
import CandleChart from "../../Components/Dashboard/CandleChart";
import OptionDataDonutChart from "../../Components/Dashboard/OptionDataDonutChart";
import useFetchData from "../../utils/useFetchData";
import { useEffect, useState } from "react";
import { lotSize } from "../../constants/constants";
import { formatDateString } from "../../utils/utils";
import axios from "axios";
const URI = import.meta.env.VITE_SERVER_URI;

const contributeIndex = {
  NIFTY: "NIFTY 50",
  BANKNIFTY: "BANKNIFTY",
  FINNIFTY: "FINNIFTY",
  MIDCPNIFTY: "MIDCAP",
  SENSEX: "SENSEX",
};
const newIndexes = [
  {
    NIFTY: "Nifty50",
  },
  { BANKNIFTY: "BankNifty" },
  { FINNIFTY: "FinNifty" },
  { MIDCPNIFTY: "Midcap" },
  { SENSEX: "Sensex" },
];

const meterData = [
  {
    title: "Sentiment Dial",
    value: 10.3,
  },
  {
    title: "PCR Dial",
    value: 0.5,
  },
];
const AIOptionDataPage = () => {
  const { fetchData } = useFetchData();
  const [allIndexPts, setAllIndexPts] = useState({
    "NIFTY 50": {
      pts: 0,
      per: 0,
    },
    BANKNIFTY: {
      pts: 0,
      per: 0,
    },
    FINNIFTY: {
      pts: 0,
      per: 0,
    },
    MIDCPNIFTY: {
      pts: 0,
      per: 0,
    },
    SENSEX: {
      pts: 0,
      per: 0,
    },
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

  const fetchAllIndexPts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${URI}/get-all-index-points`);
      if (res.status !== 200) {
        throw new Error("error while fetching all index pts.");
      }
      const indexData = {
        "NIFTY 50": res.data.NIFTY,
        BANKNIFTY: res.data.BANKNIFTY,
        MIDCAP: res.data.MIDCPNIFTY,
        SENSEX: res.data.SENSEX,
        FINNIFTY: res.data.FINNIFTY,
        "NIFTY MID": { pts: 0, per: 0 },
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
        throw new Error("Error in fetching contribution !");
      }
      setContribution(res.data);
    } catch (error) {
      console.log(
        `Error in fetching contribution of ${selectedIndex} : `,
        error
      );
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

  const fetchIndexCandlesData = async (index) => {
    try {
      setLoading(true);
      const response = await fetchData("index-candles", "GET");
      if (response.status !== 200) {
        throw new Error("Error fetching index candles data");
      }
      setIndexCandles(response.data);
    } catch (error) {
      console.error(`Error fetching ${index} data:`, error);
      return { data: [], expiries: [] };
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

  const filterDataByIndex = () => {
    const filteredData = indexCandles.filter((candle) => {
      const indexName = candle.indexName;
      const interval = candle.interval;
      const currDate = formatDateString();
      const selectedIntervalString = `${selectedInterval}m`;
      return (
        candle.timestamp.split(",")[0] === currDate &&
        indexName === selectedIndex &&
        selectedIntervalString === interval
      );
    });

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
        totalOiCE = totalOiCE + strike.oi;
      } else {
        totalOiPE = totalOiPE + strike.oi;
      }
    });
    return { totalOiCE, totalOiPE };
  };

  const convertCandlesForDisplaying = (candles) => {
    return candles.map(({ timestamp, open, high, low, close }) => ({
      x: moment(timestamp, "DD/MM/YYYY, hh:mm:ss A").valueOf(),
      y: [open.toFixed(2), high.toFixed(2), low.toFixed(2), close.toFixed(2)],
    }));
  };

  const currentIndexName = newIndexes.find((idx) => idx[selectedIndex])[
    selectedIndex
  ];
  const currentExpiries = allIndexData[currentIndexName]?.expiries || [];

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
                value="NIFTY"
              >
                Nifty50
              </option>
              <option
                className="dark:bg-db-secondary bg-db-primary  text-white"
                value="BANKNIFTY"
              >
                BankNifty
              </option>
              <option
                className="dark:bg-db-secondary bg-db-primary  text-white"
                value="FINNIFTY"
              >
                FinNifty
              </option>
              <option
                className="dark:bg-db-secondary bg-db-primary  text-white"
                value="MIDCPNIFTY"
              >
                Midcap
              </option>
              <option
                className="dark:bg-db-secondary bg-db-primary  text-white"
                value="SENSEX"
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
                value="3"
              >
                3m
              </option>
              <option
                className="dark:bg-db-secondary bg-db-primary text-white "
                value="15"
              >
                15m
              </option>
              <option
                className="dark:bg-db-secondary bg-db-primary text-white "
                value="30"
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

            <div className="mt-8 h-[350px] lg:h-[88%]">
              <CandleChart candles={currentCandles} />
            </div>
          </div>
        </div>

        {/* second card */}
        <div className="dark:bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-lg">
          <div className="h-full dark:bg-db-primary bg-db-primary rounded-lg">
            <div className="flex flex-col items-center gap-5">
              {meterData.map((item, index) => (
                <GaugeMeter key={index} title={item.title} totalOI={totalOI} />
              ))}
            </div>

            <div className="flex justify-center gap-4 items-center mt-8">
              {/* <h1 className="text-2xl font-medium ">Money Flux</h1> */}

              <span className="flex gap-1 items-center text-base font-light ">
                {/* How to Use <FaPlayCircle className="text-[#0256F5]" />{" "} */}
              </span>

              {/* <span className="flex items-center px-2 py-px rounded-full w-fit h-fit bg-[#0256F5] text-xs text-white"> */}
              {/* <GoDotFill /> */}
              {/* Live */}
              {/* </span> */}

              <div className="rounded-lg overflow-hidden h-[200px] mt-4">
                {/* <TreemapChart/> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-lg">
        <div className="w-full h-full dark:bg-db-primary bg-db-primary   rounded-lg p-4">
          <OptionDataDonutChart
            contributor={contribution}
            allIndexPts={allIndexPts}
          />
        </div>
      </section>
    </>
  );
};

export default AIOptionDataPage;
