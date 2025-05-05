import React from "react";
import { GoDotFill } from "react-icons/go";
import TimeRangeSlider from "../../Components/Dashboard/TimeRangeSlider";
import OiClockChart from "../../Components/Dashboard/OiClockChart";
import { FcCandleSticks } from "react-icons/fc";
import OiClockChartTwo from "../../Components/Dashboard/OiClockChartTwo";
import OiClockChartThree from "../../Components/Dashboard/OiClockChartThree";
const OptionClockPage = () => {
  return (
    <>
      {/* sector depth section */}

      <section className="mt-5 flex md:justify-between md:items-center md:flex-row flex-col md:gap-0 gap-4">
        <div className="flex gap-4 items-center">
          <h1 className="text-3xl font-bold">Sector Depth</h1>
          <span className="flex items-center px-2 py-px rounded-full w-fit bg-[#0256F5] text-xs">
            <GoDotFill />
            Live
          </span>
        </div>

        <div className="flex gap-4">
          <div className="relative border border-[#0E5FF6] w-fit rounded-lg px-4 py-2 ">
            <label className="text-sm">Index:</label>
            <select id="index" className="bg-transparent focus:outline-none">
              <option className="dark:bg-[#000A2D]" value="Nifty50">
                Nifty50
              </option>
              <option className="dark:bg-[#000A2D]" value="BankNifty">
                BankNifty
              </option>
              <option className="dark:bg-[#000A2D]" value="BankNifty">
                FinNifty
              </option>
              <option className="dark:bg-[#000A2D]" value="BankNifty">
                Midcap
              </option>
              <option className="dark:bg-[#000A2D]" value="Sensex">
                Sensex
              </option>
            </select>
          </div>

          <div className="relative border border-[#0E5FF6] w-fit rounded-lg px-4 py-2  ">
            <label className="text-sm">Expiry:</label>
            <select id="expiry" className="bg-transparent focus:outline-none">
              <option className="dark:bg-[#000A2D]" value="Feb-06">
                Feb-06
              </option>
              <option className="dark:bg-[#000A2D]" value="Feb-27">
                Feb-27
              </option>
            </select>
          </div>
        </div>
      </section>

      {/* time range slider section */}
      <section>
        <TimeRangeSlider />
      </section>

      {/* oi clock charts section*/}
      <section className="dark:bg-gradient-to-br from-[#00078F] to-[#01071C] rounded-lg p-px mt-8">
        <div className="dark:bg-db-primary bg-db-primary-light rounded-lg p-3">
          <div className="dark:bg-db-primary bg-db-primary-lightrounded-lg ">
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold ">OI Clock </h2>{" "}
              <span>
                <FcCandleSticks className="text-xl" />
              </span>
            </div>

            <div className="mt-5 dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
              <OiClockChart />
            </div>
          </div>

          <div className="w-full mt-5 h-auto grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="  h-full dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
              <div className="dark:bg-db-secondary bg-db-primary-light rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-medium">OI Clock</h2>{" "}
                  <span className="text-xl">
                    <FcCandleSticks />
                  </span>
                </div>
                <OiClockChartTwo />
              </div>
            </div>

            <div className=" h-full dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
              <div className="dark:bg-db-secondary bg-db-primary-light px-3 rounded-lg h-full  ">
                <div className="flex md:gap-2 gap-y-4 md:flex-row flex-col md:items-center md:justify-between p-2">
                  <div className="flex gap-2 items-center text-xl">
                    <h2 className="text-3xl font-medium">OI Clock</h2>{" "}
                    <span className="text-xl">
                      <FcCandleSticks />
                    </span>
                  </div>

                  <div className="flex items-center gap-2 ">
                    <div className="h-5 w-5 rounded bg-[#0256F5]"></div>{" "}
                    <p>Bulls Total OI</p>
                    <div className="h-5 w-5 rounded bg-[#95025A] ml-3"></div>{" "}
                    <p>Bears Total OI</p>
                  </div>
                </div>
                <OiClockChartThree />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default OptionClockPage;
