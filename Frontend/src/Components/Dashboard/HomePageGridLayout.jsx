import React from "react";
import marketDepth from "../../assets/Images/Dashboard/homepage/marketDepth.png";
import customStrategy from "../../assets/Images/Dashboard/homepage/customer-strategy.png";
import sectorDepth from "../../assets/Images/Dashboard/homepage/sector-depth.png";
import AiSwing from "../../assets/Images/Dashboard/homepage/AI-swing.png";
import clock from "../../assets/Images/Dashboard/homepage/clock.png";
import profit from "../../assets/Images/Dashboard/homepage/profit.png";
import graph from "../../assets/Images/Dashboard/homepage/graph.png";
import learnBook from "../../assets/Images/Dashboard/homepage/learn-book.png";
import overStrategy from "../../assets/Images/Dashboard/homepage/over-strategy.png";
const HomePageGridLayout = () => {
  return (
    <div className="dark:bg-db-primary min-h-screen  py-10">
      <h1 className=" text-2xl font-bold mb-6">Indian Markets</h1>

      <div class="homeParent">
        <div class="div1 dark:bg-gradient-to-br dark:from-[#0009B2] dark:to-[#02000E] p-px rounded-lg  ">
          <div className="dark:bg-db-primary bg-db-primary-light   border border-transparent rounded-xl p-4 relative shadow-lg w-full h-full flex flex-col justify-between">
            <div className="flex flex-col items-start justify-between   space-x-3">
              <div className="flex items-center gap-3">
                <div>
                  <img
                    className="w-12 h-12  "
                    src={marketDepth}
                    alt="Market Depth"
                  />
                </div>

                <h2 className=" font-semibold text-lg">AI Market Depth</h2>
              </div>
              <div>
                <p className="dark:text-gray-400 text-gray-800 text-sm mt-5">
                  It identifies stocks where the big players are actively
                  building positions.
                </p>
              </div>
            </div>
            <button className="w-full bg-[#0256F5] text-white mt-4 py-2 rounded-md font-medium">
              AI Market Depth
            </button>
          </div>
        </div>
        <div class="div2 dark:bg-gradient-to-br dark:from-[#0009B2] dark:to-[#02000E] p-px rounded-lg">
          <div className="dark:bg-db-primary bg-db-primary-light   border border-transparent rounded-xl p-4 relative shadow-lg w-full h-full flex flex-col justify-between">
            <div className="flex flex-col items-start space-x-3">
              <div className="flex items-center gap-3">
                <div>
                  <img
                    className="w-12 h-12  "
                    src={sectorDepth}
                    alt="Sector Depth"
                  />
                </div>

                <h2 className=" font-semibold text-lg">AI Sector Depth</h2>
              </div>
              <div>
                <p className="dark:text-gray-400 text-gray-800 text-sm mt-5">
                  Perfect for traders aiming for high-profit trades with
                  pinpoint accuracy.
                </p>
              </div>
            </div>
            <button className="w-full bg-[#0256F5] text-white mt-4 py-2 rounded-md font-medium">
              Sector Depth
            </button>
          </div>
        </div>
        <div class="div3 dark:bg-gradient-to-br dark:from-[#0009B2] dark:to-[#02000E] p-px rounded-lg">
          <div className="dark:bg-db-primary bg-db-primary-light   border border-transparent rounded-xl p-4 relative shadow-lg w-full h-full flex flex-col justify-between">
            <div className="flex flex-col items-start space-x-3">
              <div className="flex items-center gap-3">
                <div>
                  <img className="w-12 h-12  " src={clock} alt="Option Clock" />
                </div>

                <h2 className=" font-semibold text-lg">AI Option Clock</h2>
              </div>
              <div>
                <p className="dark:text-gray-400 text-gray-800 text-sm mt-5">
                  Just select time and get position built up by big players.
                </p>
              </div>
            </div>
            <button className="w-full bg-[#0256F5] text-white mt-4 py-2 rounded-md font-medium">
             AI Option Clock
            </button>
          </div>
        </div>
        <div class="div4 dark:bg-gradient-to-br dark:from-[#0009B2] dark:to-[#02000E] p-px rounded-lg">
          <div className="dark:bg-db-primary bg-db-primary-light   border border-transparent rounded-xl p-4 relative shadow-lg w-full h-full flex flex-col justify-between">
            <div className="flex flex-col items-start space-x-3">
              <div className="flex items-center gap-3">
                <div>
                  <img
                    className="w-12 h-12  "
                    src={customStrategy}
                    alt="Customer Strategy"
                  />
                </div>

                <h2 className=" font-semibold text-lg">Smart Money Action</h2>
              </div>
              <div>
                <p className="dark:text-gray-400 text-gray-800 text-sm mt-5">
                  "Customer Strategy" analyzes stocks based on proven market
                  structures.
                </p>
              </div>
            </div>
            <button className="w-full bg-[#0256F5] text-white mt-4 py-2 rounded-md font-medium">
            Smart Money Action
            </button>
          </div>
        </div>

        <div class="div5 dark:bg-gradient-to-br dark:from-[#0009B2] dark:to-[#02000E] p-px rounded-lg">
          <div className="dark:bg-db-primary bg-db-primary-light   border border-transparent rounded-xl p-4 relative shadow-lg w-full h-full flex flex-col justify-between">
            <div className="flex flex-col items-start space-x-3">
              <div className="flex items-center gap-3">
                <div>
                  <img
                    className="w-12 h-12  "
                    src={AiSwing}
                    alt="AI Swing Traders"
                  />
                </div>

                <h2 className=" font-semibold text-lg">AI Swing Traders</h2>
              </div>
              <div>
                <p className="dark:text-gray-400 text-gray-800 text-sm mt-5">
                  Find best stocks for swing trading based on different
                  strategies
                </p>
              </div>
            </div>
            <button className="w-full bg-[#0256F5] text-white mt-4 py-2 rounded-md font-medium">
              AI Swing Traders
            </button>
          </div>
        </div>

        <div class="div6 dark:bg-gradient-to-br dark:from-[#0009B2] dark:to-[#02000E] p-px rounded-lg">
          <div className="dark:bg-db-primary bg-db-primary-light   border border-transparent rounded-xl p-4 relative shadow-lg w-full h-full flex flex-col justify-between">
            <div className="flex flex-col items-start space-x-3">
              <div className="flex items-center gap-3">
                <div>
                  <img className="w-12 h-12  " src={profit} alt="Profit" />
                </div>

                <h2 className=" font-semibold text-lg">Profit</h2>
              </div>
              <div>
                <p className="dark:text-gray-400 text-gray-800 text-sm mt-5">
                  Trading profit is earnings from core business activities
                  before deductions.
                </p>
              </div>
            </div>
            <button className="w-full bg-[#0256F5] text-white mt-4 py-2 rounded-md font-medium">
              Profit
            </button>
          </div>
        </div>
        <div class="div7 dark:bg-gradient-to-br dark:from-[#0009B2] dark:to-[#02000E] p-px rounded-lg">
          <div className="dark:bg-db-primary bg-db-primary-light   border border-transparent rounded-xl p-4 relative shadow-lg w-full h-full flex flex-col justify-between">
            <div className="flex flex-col items-start space-x-3 space-y-6">
              <div>
                <img className="w-35 h-35  " src={graph} alt="Profit" />
              </div>

              <div>
                <p className="dark:text-gray-400 text-gray-800 text-base tracking-wide leading-8 mt-5">
                  "Index Depth" shows which stocks are the driving forces behind
                  index movements.
                </p>
              </div>
            </div>
            <button className="w-full bg-[#70A1FE] text-white mt-4 py-2 rounded-md font-medium">
              Index Depth
            </button>
          </div>
        </div>
        <div class="div8 dark:bg-gradient-to-br dark:from-[#0009B2] dark:to-[#02000E] p-px rounded-lg md:h-auto h-full">
          <div className="dark:bg-db-primary bg-db-primary-light   border border-transparent rounded-xl p-4 relative shadow-lg  h-full">
            <div className="flex flex-col items-start space-x-3">
              <div className="flex items-center gap-3">
                <div>
                  <img
                    className="w-12 h-12  "
                    src={learnBook}
                    alt="Learn From Us"
                  />
                </div>

                <h2 className=" font-semibold text-lg">Learn From Us</h2>
              </div>
              <div>
                <p className="dark:text-gray-400 text-gray-800 text-sm mt-5">
                  Take maximum benefits of Trade Tantra & learn how to use
                  different features.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="div9 dark:bg-gradient-to-br dark:from-[#0009B2] dark:to-[#02000E] p-px rounded-lg md:h-auto h-full">
          <div className="dark:bg-db-primary bg-db-primary-light   border border-transparent rounded-xl p-4 relative shadow-lg h-full">
            <div className="flex flex-col items-start space-x-3">
              <div className="flex items-center gap-3">
                <div>
                  <img
                    className="w-12 h-12  "
                    src={overStrategy}
                    alt="Over Strategy"
                  />
                </div>

                <h2 className=" font-semibold text-lg">Over Strategy</h2>
              </div>
              <div>
                <p className="dark:text-gray-400 text-gray-800 text-sm mt-5">
                  Take maximum benefits of Trade Tantra & learn how to use
                  different features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePageGridLayout;
