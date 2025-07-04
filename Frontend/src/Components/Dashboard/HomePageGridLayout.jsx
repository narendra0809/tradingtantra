import marketDepth from "../../assets/Images/Dashboard/homepage/marketDepth.png";
import customStrategy from "../../assets/Images/Dashboard/homepage/customer-strategy.png";
import sectorDepth from "../../assets/Images/Dashboard/homepage/sector-depth.png";
import AiSwing from "../../assets/Images/Dashboard/homepage/AI-swing.png";
import clock from "../../assets/Images/Dashboard/homepage/clock.png";
import profit from "../../assets/Images/Dashboard/homepage/profit.png";
import graph from "../../assets/Images/Dashboard/homepage/graph.png";
import learnBook from "../../assets/Images/Dashboard/homepage/learn-book.png";
import overStrategy from "../../assets/Images/Dashboard/homepage/over-strategy.png";
import { useNavigate } from "react-router-dom";
const HomePageGridLayout = () => {
  const navigate = useNavigate();
  return (
    <div className="py-10">
      <h1 className="text-2xl font-bold mb-6">Indian Markets</h1>

      <div className="homeParent">
        <div className="div1 bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-lg  ">
          <div className=" bg-db-primary   border border-transparent rounded-xl p-4 relative shadow-lg w-full h-full flex flex-col justify-between">
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
                <p className="text-[#FFFFFF] font-light  text-sm mt-5">
                  It identifies stocks where the big players are actively
                  building positions.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/market-depth")}
              className="w-full bg-[#0256F5] text-white mt-4 py-2 rounded-md font-medium"
            >
              AI Market Depth
            </button>
          </div>
        </div>
        <div className="div2 bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-lg">
          <div className="bg-db-primary   border border-transparent rounded-xl p-4 relative shadow-lg w-full h-full flex flex-col justify-between">
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
                <p className="text-[#FFFFFF] font-light  text-sm mt-5">
                  Perfect for traders aiming for high-profit trades with
                  pinpoint accuracy.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/sector-depth")}
              className="w-full bg-[#0256F5] text-white mt-4 py-2 rounded-md font-medium"
            >
              Sector Depth
            </button>
          </div>
        </div>
        <div className="div3 bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-lg">
          <div className=" bg-db-primary   border border-transparent rounded-xl p-4 relative shadow-lg w-full h-full flex flex-col justify-between">
            <div className="flex flex-col items-start space-x-3">
              <div className="flex items-center gap-3">
                <div>
                  <img className="w-12 h-12  " src={clock} alt="Option Clock" />
                </div>

                <h2 className=" font-semibold text-lg">AI Option Clock</h2>
              </div>
              <div>
                <p className="text-[#FFFFFF] font-light  text-sm mt-5">
                  Just select time and get position built up by big players.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/option-clock")}
              className="w-full bg-[#0256F5] text-white mt-4 py-2 rounded-md font-medium"
            >
              AI Option Clock
            </button>
          </div>
        </div>
        <div className="div4 bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-lg">
          <div className=" bg-db-primary   border border-transparent rounded-xl p-4 relative shadow-lg w-full h-full flex flex-col justify-between">
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
                <p className="text-[#FFFFFF] font-light  text-sm mt-5">
                  &quot;Customer Strategy&quot; analyzes stocks based on proven
                  market structures.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/smart-action")}
              className="w-full bg-[#0256F5] text-white mt-4 py-2 rounded-md font-medium"
            >
              Smart Money Action
            </button>
          </div>
        </div>

        <div className="div5 bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-lg">
          <div className=" bg-db-primary   border border-transparent rounded-xl p-4 relative shadow-lg w-full h-full flex flex-col justify-between">
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
                <p className="text-[#FFFFFF] font-light  text-sm mt-5">
                  Find best stocks for swing trading based on different
                  strategies
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/swing-trades")}
              className="w-full bg-[#0256F5] text-white mt-4 py-2 rounded-md font-medium"
            >
              AI Swing Traders
            </button>
          </div>
        </div>

        <div className="div6 bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-lg">
          <div className=" bg-db-primary   border border-transparent rounded-xl p-4 relative shadow-lg w-full h-full flex flex-col justify-between">
            <div className="flex flex-col items-start space-x-3">
              <div className="flex items-center gap-3">
                <div>
                  <img className="w-12 h-12  " src={profit} alt="Profit" />
                </div>

                <h2 className=" font-semibold text-lg">Profit</h2>
              </div>
              <div>
                <p className="text-[#FFFFFF] font-light  text-sm mt-5">
                  Trading profit is earnings from core business activities
                  before deductions.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/profit")}
              className="w-full bg-[#0256F5] text-white mt-4 py-2 rounded-md font-medium"
            >
              Profit
            </button>
          </div>
        </div>
        <div className="div7 bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-lg">
          <div className=" bg-db-primary   border border-transparent rounded-xl p-4 relative shadow-lg w-full flex flex-col justify-between">
            <div className="flex flex-col items-start space-x-3 space-y-6">
              <div>
                <img className="w-35 h-35  " src={graph} alt="Profit" />
              </div>

              <div>
                <p className="text-[#FFFFFF] font-light  text-base tracking-wide leading-8 mt-5">
                  &quot;Index Depth&quot; shows which stocks are the driving
                  forces behind index movements.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/index-depth")}
              className="w-full bg-[#0256F5] text-white mt-4 py-2 rounded-md font-medium"
            >
              Index Depth
            </button>
          </div>
        </div>
        <div className="div8 bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-lg md:h-auto">
          <div className=" bg-db-primary   border border-transparent rounded-xl p-4 relative shadow-lg  h-full">
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
                <p className="text-[#FFFFFF] font-light  text-sm mt-5">
                  Take maximum benefits of Trade Tantra & learn how to use
                  different features.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="div9 bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-lg md:h-auto">
          <div className=" bg-db-primary   border border-transparent rounded-xl p-4 relative shadow-lg h-full">
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
                <p className="text-[#FFFFFF] font-light  text-sm mt-5">
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
