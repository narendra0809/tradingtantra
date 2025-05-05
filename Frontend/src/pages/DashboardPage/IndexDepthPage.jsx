import React from "react";
import { FaPlayCircle } from "react-icons/fa";
import { FcCandleSticks } from "react-icons/fc";
import { GoDotFill } from "react-icons/go";
import OptionDataDonutChart from "../../Components/Dashboard/OptionDataDonutChart";

const IndexDepthPage = () => {
  return (
    <>
      <div className="flex  items-center mt-8">
        <h1 className="text-3xl font-medium mr-2">Index Depth</h1>{" "}
        <FcCandleSticks />{" "}
        <span className="text-lg font-light ml-4">How to use</span>{" "}
        <FaPlayCircle className="text-lg text-[#0256F5] ml-2" />
      </div>

      <section className="mt-10  dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg ">
        <div className="dark:bg-db-primary bg-db-primary-light rounded-lg p-2">
          <div className="flex md:flex-row flex-col md:justify-between md:items-center  gap-4">
            <div className="flex justify-between items-center md:w-[40%] dark:bg-db-secondary w-full bg-db-secondary-light rounded-lg py-2 px-4">
              <h4 className="text-4xl font-bold text-[#ED9B2F] drop-shadow-md">
                Nifty <br />
                50
              </h4>

              <span className="text-xl font-medium">
                <p>
                  Down <span className="text-red-500">-42 pts</span> -0.18%
                </p>
              </span>
            </div>

            <div className="md:w-[60%] w-full dark:bg-db-secondary bg-db-secondary-light px-4 py-2 rounded-lg ">
              <p>Gainers/Loosers</p>

              <div className="w-full h-2 bg-[#9B3B44] mt-2 rounded-full ">
                <div className="w-[30%] h-2 bg-[#269F3C] rounded-full" />
              </div>

              <div className="text-xs flex justify-between mt-1">
                <span className="flex items-center"> <GoDotFill className="text-green-500" /> Gainers: 27</span>
                <span className="flex items-center"> <GoDotFill className="text-red-500" /> Loosers: 23</span>
              </div>
            </div>
          </div>

          <div className="mt-8 w-full flex justify-center">
            <OptionDataDonutChart/>
          </div>
        </div>
      </section>
    </>
  );
};

export default IndexDepthPage;
