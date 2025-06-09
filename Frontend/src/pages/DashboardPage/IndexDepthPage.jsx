/* eslint-disable react-hooks/exhaustive-deps */
import { FaPlayCircle } from "react-icons/fa";
import axios from "axios";
import { FcCandleSticks } from "react-icons/fc";
import { GoDotFill } from "react-icons/go";
import OptionDataDonutChart from "../../Components/Dashboard/OptionDataDonutChart";
import { useEffect, useState } from "react";
const URI = import.meta.env.VITE_SERVER_URI;

const IndexDepthPage = () => {
  const [selectedIndex, setSelectedIndex] = useState("NIFTY 50");
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
    }
  };

  const fetchContributionInIndex = async () => {
    try {
      const res = await axios.get(`${URI}/index-contribution/${selectedIndex}`);
      if (res.status !== 200) {
        throw new Error("Error in fetching contribution !");
      }
      setContribution(res.data);
      console.log(res.data);

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

  const handleIndexChange = (e) => {
    setSelectedIndex(e.target.value);
  };

  const totalStocks = gainers + losers;
  const gainersPercentage = totalStocks > 0 ? (gainers / totalStocks) * 100 : 0;

  return (
    <>
      <div className="flex justify-between items-center mt-8">
        <div className="flex items-center">
          <h1 className="text-3xl font-medium mr-2">Index Depth</h1>{" "}
          <FcCandleSticks />{" "}
          <span className="text-lg font-light ml-4">How to use</span>{" "}
          <FaPlayCircle className="text-lg text-[#0256F5] ml-2" />
        </div>
        <div className="border border-[#0E5FF6] w-fit rounded-lg px-4 py-2 ">
          <label className="text-sm">Index:</label>
          <select
            onChange={handleIndexChange}
            id="index"
            className="bg-transparent focus:outline-none"
          >
            <option className="bg-[#000A2D]" value="NIFTY 50">
              Nifty50
            </option>
            <option className="bg-[#000A2D]" value="SENSEX">
              Sensex
            </option>
          </select>
        </div>
      </div>

      <section className="mt-10 dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
        <div className="dark:bg-db-primary bg-db-primary rounded-lg p-2">
          <div className="flex md:flex-row flex-col md:justify-between md:items-center">
            <div className="flex justify-evenly items-center md:w-[40%] dark:bg-db-secondary w-full bg-db-primary rounded-lg py-2 px-4">
              <h4 className="text-4xl font-bold text-[#ED9B2F] drop-shadow-md">
                {contribution.indexName}
              </h4>
              <span className="text-xl font-medium">
                <p>
                  {allIndexPts[contribution.indexName].pts >= 0 ? "up" : "down"}{" "}
                  by{" "}
                  {Math.abs(allIndexPts[contribution.indexName].pts.toFixed(2))}{" "}
                  pts ({allIndexPts[contribution.indexName].per}%)
                </p>
              </span>
            </div>

            <div className="md:w-[60%] w-full dark:bg-db-secondary bg-db-primary px-4 py-2 rounded-lg">
              <p>Gainers/Losers</p>

              <div className="w-full h-2 bg-[#9B3B44] mt-2 rounded-full">
                <div
                  className="h-2 bg-[#269F3C] rounded-full"
                  style={{ width: `${gainersPercentage}%` }}
                />
              </div>

              <div className="text-xs flex justify-between mt-1">
                <span className="flex items-center">
                  <GoDotFill className="text-green-500" /> Gainers: {gainers}
                </span>
                <span className="flex items-center">
                  <GoDotFill className="text-red-500" /> Losers: {losers}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 w-full flex justify-center">
            <OptionDataDonutChart
              contributor={contribution}
              allIndexPts={allIndexPts}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default IndexDepthPage;
