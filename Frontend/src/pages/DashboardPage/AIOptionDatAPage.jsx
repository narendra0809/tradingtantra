import React from "react";
import { FaPlayCircle } from "react-icons/fa";
import { FcCandleSticks } from "react-icons/fc";
import { GoDotFill } from "react-icons/go";
import GaugeMeter from "../../Components/Dashboard/GaugeMeter";
import TreemapChart from "../../Components/Dashboard/TreemapChart";

import CandleChart from "../../Components/Dashboard/CandleChart";
import OptionDataDonutChart from "../../Components/Dashboard/OptionDataDonutChart";

const AIOptionDataPage = () => {
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
            <select id="index" className="bg-transparent focus:outline-none">
              <option
                className="dark:bg-db-secondary bg-db-secondary-light  text-white"
                value="Nifty50"
              >
                Nifty50
              </option>
              <option
                className="dark:bg-db-secondary bg-db-secondary-light  text-white"
                value="BankNifty"
              >
                BankNifty
              </option>
              <option
                className="dark:bg-db-secondary bg-db-secondary-light  text-white"
                value="BankNifty"
              >
                FinNifty
              </option>
              <option
                className="dark:bg-db-secondary bg-db-secondary-light  text-white"
                value="BankNifty"
              >
                Midcap
              </option>
              <option
                className="dark:bg-db-secondary bg-db-secondary-light  text-white"
                value="Sensex"
              >
                Sensex
              </option>
            </select>
          </div>

          <div className="relative border border-[#0E5FF6] w-fit rounded-lg px-4 py-2 ">
            <label className="text-sm">Time:</label>
            <select id="expiry" className="bg-transparent focus:outline-none">
              <option
                className="dark:bg-db-secondary bg-db-secondary-light text-white "
                value="Feb-06"
              >
                3m
              </option>
              <option
                className="dark:bg-db-secondary bg-db-secondary-light text-white "
                value="Feb-27"
              >
                15m
              </option>
              <option
                className="dark:bg-db-secondary bg-db-secondary-light text-white "
                value="Feb-27"
              >
                30m
              </option>
            </select>
          </div>

          <div className="relative border border-[#0E5FF6] w-fit rounded-lg px-4 py-2  ">
            <label className="text-sm">Expiry:</label>
            <select id="expiry" className="bg-transparent focus:outline-none">
              <option
                className="dark:bg-db-secondary bg-db-secondary-light text-white"
                value="Feb-06"
              >
                Feb-06
              </option>
              <option
                className="dark:bg-db-secondary bg-db-secondary-light text-white"
                value="Feb-27"
              >
                Feb-27
              </option>
            </select>
          </div>
        </div>
      </section>

      {/* second  section */}
      <section className="grid lg:grid-cols-2 grid-cols-1 gap-4 mt-8">
        {/* first card */}
        <div className="dark:bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-lg">
          <div className="dark:bg-db-primary bg-db-secondary-light   rounded-lg p-4 h-full ">
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
          <div className="dark:bg-db-primary bg-db-secondary-light   rounded-lg p-4 ">
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
        <div className="w-full h-full dark:bg-db-primary bg-db-secondary-light   rounded-lg p-4">
          <OptionDataDonutChart />
        </div>
      </section>
    </>
  );
};

export default AIOptionDataPage;
