/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { FcCandleSticks } from "react-icons/fc";
import { GoDotFill } from "react-icons/go";
import Lock from "../../Components/Dashboard/Lock";
import OptionDataDonutChart from "../../Components/Dashboard/OptionDataDonutChart";
import StrategyCard from "../../Components/StrategyCard";
import indexImage from "../../assets/Images/index-line.png";
const URI = import.meta.env.VITE_SERVER_URI;

const IndexDepthPage = () => {
  const [selectedIndex, setSelectedIndex] = useState("NIFTY 50");
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
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

  const [gainers, setGainers] = useState(0);
  const [losers, setLosers] = useState(0);

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
        MIDCAP: res.data.MIDCAP,
        SENSEX: res.data.SENSEX,
        FINNIFTY: res.data.FINNIFTY,
        "NIFTY MID": { pts: 0, per: 0 },
      };
      console.log("Index Data : ", indexData);
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
      const res = await axios.get(`${URI}/index-contribution/${selectedIndex}`);
      if (res.status !== 200) {
        throw new Error("Error in fetching contribution !");
      }
      setContribution(res.data);

      const contributions = res.data.contributions || [];
      const gainersCount = contributions.filter(
        (contrib) => contrib.points > 0
      ).length;
      const losersCount = contributions.filter(
        (contrib) => contrib.points < 0
      ).length;
      setGainers(gainersCount);
      setLosers(losersCount);
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
    const Subscribed = Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed === "true");
  }, []);

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

  const handleIndexChange = (e) => {
    setSelectedIndex(e.target.value);
  };

  const totalStocks = gainers + losers;
  const gainersPercentage = totalStocks > 0 ? (gainers / totalStocks) * 100 : 0;

  return (
    <>
      <div className="flex flex-col items-center gap-6 md:flex-row lg:flex-row md:justify-between lg:justify-between mt-8">
        <StrategyCard
          Icon={FcCandleSticks}
          name={"index-depth"}
          title={"Index Depth"}
        />

        <div className="border border-[#0E5FF6] w-fit rounded-lg px-4 py-2 ">
          <label className="text-sm">Index:</label>
          <select
            onChange={handleIndexChange}
            id="index"
            className="bg-transparent focus:outline-none"
          >
            <option
              className="bg-[#000A2D] not-dark:bg-primary-light "
              value="NIFTY 50"
            >
              Nifty50
            </option>
            <option
              className="bg-[#000A2D] not-dark:bg-primary-light "
              value="SENSEX"
            >
              Sensex
            </option>
            <option
              className="bg-[#000A2D] not-dark:bg-primary-light "
              value="BANKNIFTY"
            >
              BankNifty
            </option>
            <option
              className="bg-[#000A2D] not-dark:bg-primary-light "
              value="MIDCAP"
            >
              Midcap
            </option>
            <option
              className="bg-[#000A2D] not-dark:bg-primary-light "
              value="FINNIFTY"
            >
              Finnifty
            </option>
          </select>
        </div>
      </div>
      {!isSubscribed ? (
        <Lock />
      ) : loading ? (
        <div className="flex justify-center items-center h-screen">
          <p className="ml-4 text-xl">Loading chart...</p>
        </div>
      ) : (
        <section className="mt-10 dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
          <div className="bg-db-primary not-dark:bg-primary-light rounded-lg p-2">
            <div className="flex md:flex-row flex-col md:justify-between md:items-center">
              <div
                className={`bg-db-secondary not-dark:bg-[#EEEEEE] flex justify-evenly items-center md:w-[40%] w-full h-28 rounded-lg py-2 px-4 mr-2`}
                style={{
                  backgroundImage: `url(${indexImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <a
                  href={(() => {
                    const indexMap = {
                      "NIFTY 50": "NSE:NIFTY",
                      BANKNIFTY: "NSE:BANKNIFTY",
                      FINNIFTY: "NSE:FINNIFTY",
                      MIDCAP: "NSE:NIFTYMIDCAP",
                      SENSEX: "BSE:SENSEX",
                    };
                    const tradingViewSymbol = indexMap[contribution.indexName] || `NSE:${contribution.indexName}`;
                    return `https://in.tradingview.com/chart/?symbol=${encodeURIComponent(tradingViewSymbol)}&interval=5`;
                  })()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline cursor-pointer"
                >
                  <h4 className="text-4xl font-bold text-[#ED9B2F] drop-shadow-md">
                    {contribution.indexName}
                  </h4>
                </a>
                <span className="ml-3 text-xl font-medium">
                  <p>
                    {allIndexPts[contribution.indexName].pts >= 0 ? (
                      <span className="text-green-500">UP</span>
                    ) : (
                      <span className="text-red-500">DOWN</span>
                    )}
                    <span
                      className={`${
                        allIndexPts[contribution.indexName].pts < 0
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {" "}
                      {allIndexPts[contribution.indexName].pts > 0
                        ? `+${allIndexPts[contribution.indexName].pts}`
                        : allIndexPts[contribution.indexName].pts}
                    </span>{" "}
                    <span className="">
                      pts (
                      {allIndexPts[contribution.indexName].per > 0
                        ? `+${allIndexPts[contribution.indexName].per}`
                        : allIndexPts[contribution.indexName].per}
                      %)
                    </span>
                  </p>
                </span>
              </div>

              <div className="md:w-[60%] w-full bg-db-secondary  not-dark:bg-[#EEEEEE] px-4 py-2 rounded-lg">
                <p className="text-xl  ">Gainers/Losers</p>

                <div className="w-full h-3 bg-[#9B3B44] my-4 rounded-full">
                  <div
                    className="h-3 bg-[#269F3C] rounded-full"
                    style={{ width: `${gainersPercentage}%` }}
                  />
                </div>

                <div className="text-sm flex justify-between mb-2">
                  <span className="flex items-center ">
                    <GoDotFill className="text-green-500" /> Gainers: {gainers}
                  </span>
                  <span className="flex items-center ">
                    <GoDotFill className="text-red-500" /> Losers: {losers}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 w-full flex justify-center">
              <OptionDataDonutChart
                contributor={contribution}
                allIndexPts={allIndexPts}
                isSubscribed={isSubscribed}
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default IndexDepthPage;
