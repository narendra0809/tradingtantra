import React, { useEffect, useState } from "react";
import FiveDayBO from "../../Components/Dashboard/Cards/SwingTrad/fiveDayBO";
import TenDayBO from "../../Components/Dashboard/Cards/SwingTrad/tenDayBO";
import AICandleReversal from "../../Components/Dashboard/Cards/SwingTrad/AICandleReversal";
import AIChannelBreakers from "../../Components/Dashboard/Cards/SwingTrad/AIChannelBreakers";
import AIContractions from "../../Components/Dashboard/Cards/SwingTrad/AIContraction";
import Cookies from "js-cookie";
import {
  usefetchAiCandleBreakers,
  usefetchAiCandleReversal,
  usefetchAiContraction,
  usefetchFiveDayBreakOut,
  usefetchTenDayBreakOut,
} from "../../hooks/fetchStocksData";
const AiSwingTradesPage = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  // check subscription cookie
  useEffect(() => {
    const Subscribed = Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed === "true");
  }, []);

  // hooks for data fetching
  const {
    fiveDayBOData,
    fiveDayBOLoading,
    fiveDayBOError,
    fetchFiveDayBOData,
  } = usefetchFiveDayBreakOut();

  const { tenDayBOData, tenDayBOLoading, tenDayBOError, fetchTenDayBOData } =
    usefetchTenDayBreakOut();

  const {
    AICandelBreakData,
    AICandelBreakDataLoading,
    AICandelBreakDataError,
    fetchAICandelBreakData,
  } = usefetchAiCandleBreakers();

  const {
    AICandelReversalData,
    AICandelReversalLoading,
    AICandelReversalError,
    fetchAICandelReversalData,
  } = usefetchAiCandleReversal();

  const {
    AiContractionData,
    AiContractionLoading,
    AiContractionError,
    fetchAiContractionData,
  } = usefetchAiContraction();

  // fetch all data only if subscribed
  useEffect(() => {
    if (isSubscribed) {
      fetchFiveDayBOData();
      fetchTenDayBOData();
      fetchAICandelBreakData();
      fetchAICandelReversalData();
      fetchAiContractionData();
    }
  }, [isSubscribed]);

  // console log all fetched data
  useEffect(() => {
    if (isSubscribed) {
      console.log("5 Day Breakout:", fiveDayBOData);
      console.log("10 Day Breakout:", tenDayBOData);
      console.log("AI Candle Break:", AICandelBreakData);
      console.log("AI Reversal:", AICandelReversalData);
      console.log("AI Contraction:", AiContractionData);
    }
  }, [
    fiveDayBOData,
    tenDayBOData,
    AICandelBreakData,
    AICandelReversalData,
    AiContractionData,
    isSubscribed,
  ]);
  return (
    <>
      <section className="mt-10">
        <h2 className="text-3xl font-bold ">AI Swing Trades</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
          {/* Each component handles its own loading and error */}
          <FiveDayBO
            data={fiveDayBOData?.data?.data}
            loading={fiveDayBOLoading}
            error={fiveDayBOError}
            isSubscribed={isSubscribed}
          />
          <TenDayBO
            data={tenDayBOData?.data?.data}
            loading={tenDayBOLoading}
            error={tenDayBOError}
            isSubscribed={isSubscribed}
          />
          <AICandleReversal
            data={AICandelReversalData?.data?.data}
            loading={AICandelReversalLoading}
            error={AICandelReversalError}
            isSubscribed={isSubscribed}
          />
          <AIChannelBreakers
            data={AICandelBreakData?.data?.data}
            loading={AICandelBreakDataLoading}
            error={AICandelBreakDataError}
            isSubscribed={isSubscribed}
          />
          <AIContractions
            data={AiContractionData?.data?.data}
            loading={AiContractionLoading}
            error={AiContractionError}
            isSubscribed={isSubscribed}
          />
        </div>
      </section>

      {/* section weekly watch */}
      {/* <section className="dark:bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-2xl mt-10">
        <div className="dark:bg-db-primary bg-db-primary-light p-4 rounded-2xl">
          <div className="flex items-center gap-2">
            <img src={candles} alt="candle" className="w-15 object-contain" />
            <div>
              <h2 className=" text-xl font-semibold flex items-center gap-2">
                Weekly Watch <FcCandleSticks />
              </h2>
              <p className="dark:text-gray-400 text-gray-800 text-sm flex items-center gap-2">
                How to use <FaPlayCircle className="text-[#0256F5]" />{" "}
                <span className="bg-[#0256F5] text-white px-2 py-1 rounded-full text-xs">
                  Live
                </span>
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* delivery scanner section */}
      {/* <section className="mt-10 dark:bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-xl">
        <div className="p-3 dark:bg-db-primary bg-db-primary-light rounded-xl">
          <div className="flex flex-wrap justify-between items-center mb-8">
            <div className="flex gap-2 items-center">
              <img src={topGainers} alt="icon" />
              <h2 className=" text-4xl font-bold mb-4">Delivery Scanner</h2>
            </div>

            <div className="flex gap-4 flex-wrap">
              <div className="flex flex-col">
                <label className="text-xl font-semibold mb-2">Scan Type</label>
                <select className="text-xs px-2 w-fit py-1 border dark:border-white rounded outline-none dark:bg-[#01071C] dark:text-white">
                  <option value="">Highest Delivery</option>
                  <option value="">Highest Delivery</option>
                  <option value="">Highest Delivery</option>
                  <option value="">Highest Delivery</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xl font-semibold mb-2">Segment</label>
                <select className="text-xs w-fit border px-2 py-1 dark:border-white rounded outline-none dark:bg-[#01071C] dark:text-white">
                  <option value="">F&O</option>
                  <option value="">Highest Delivery</option>
                  <option value="">Highest Delivery</option>
                  <option value="">Highest Delivery</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-px rounded-lg dark:bg-gradient-to-br from-[#0009B2] to-[#02000E]">
            <div className="rounded-lg p-4 dark:bg-db-secondary bg-db-secondary-light  overflow-x-auto">
              <table className="w-full  text-left min-w-[600px]">
                <thead className="relative text-lg">
                  <tr>
                    <th className="whitespace-nowrap">Name</th>
                    <th className="whitespace-nowrap">Volume</th>
                    <th className="whitespace-nowrap">Avg. Del%</th>
                    <th className="whitespace-nowrap">Delivery (%)</th>
                  </tr>
                  <tr className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-[#000A2D] via-[#002ED0] to-[#000A2D]" />
                </thead>
                <tbody>
                  {[
                    {
                      name: "KPITTECH",
                      volume: 3319808,
                      avgDel: 55.55,
                      del: 55.55,
                    },
                    {
                      name: "ZOMATO",
                      volume: 10138270,
                      avgDel: 63.04,
                      del: 63.04,
                    },
                    {
                      name: "TVS MOTOR",
                      volume: 1075095,
                      avgDel: 54.53,
                      del: 54.53,
                    },
                    {
                      name: "SUPER MEIND",
                      volume: 6077580,
                      avgDel: 51.19,
                      del: 51.19,
                    },
                  ].map((stock, index) => (
                    <tr key={index} className="text-lg">
                      <td className="pt-3">{stock.name}</td>
                      <td className="pt-3">{stock.volume.toLocaleString()}</td>
                      <td className="pt-3">{stock.avgDel.toFixed(2)}</td>
                      <td className="flex items-center gap-2 pt-3 whitespace-nowrap">
                        {stock.del.toFixed(2)}
                        <div className="w-24 h-2 bg-gray-50 rounded">
                          <div
                            className="h-2 bg-blue-500 rounded"
                            style={{ width: `${stock.del}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section> */}

      {/* <section className="mt-12">
        <div>
          <h4 className="text-2xl font-semibold">Highest Delivery:</h4>
          <p className="text-lg dark:text-[#D6D6D6] text-gray-800">
            Stocks which has the highest delivery in last 15 days comes here.
          </p>

          <h4 className="text-2xl font-semibold mt-7.5">Delivery Spike:</h4>
          <p className="text-lg dark:text-[#D6D6D6] text-gray-800">
            Stocks which has seen a significant increase in delivery % compared
            to yesterday comes under this section.
          </p>

          <p className="font-medium mt-10">
            Don't worry we will make a video on this soon on how to use this in
            practical trading.
          </p>
        </div>
      </section> */}
    </>
  );
};

export default AiSwingTradesPage;
