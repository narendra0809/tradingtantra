import React, { useEffect, useState } from "react";
import { FaPlayCircle } from "react-icons/fa";
import { FcCandleSticks } from "react-icons/fc";
import { GoDotFill } from "react-icons/go";
import CustomBarChart from "../../Components/Dashboard/FIIDIIchart";
import FiiDiiTable from "../../Components/Dashboard/FiiDiiTable";
import axios from "axios";

const FIIDIIPage = () => {
  const SERVER_URI = import.meta.env.VITE_SERVER_URI;
  const [loading, setLoading] = useState(false);
  const [FiiDiiData, setFiiDiiData] = useState([]);
  useEffect(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${SERVER_URI}/fii-dii`);
      const data = res.data.resdata;
      setFiiDiiData(data);
      // console.log(FiiDiiData, "FiiDiiData");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <h1 className="text-3xl font-bold mt-8">FII/DII</h1>
      <section className="mt-8 dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
        <div className="dark:bg-db-primary bg-db-primary-light rounded-lg p-2">
          <div>
            <div className="flex gap-4 items-center">
              <h1 className="text-3xl font-bold">FII/DII</h1>
              <span className="text-xl">
                <FcCandleSticks />
              </span>
              <span className="flex items-center px-2 py-px rounded-full w-fit bg-[#0256F5] text-xs text-white">
                <GoDotFill />
                Live
              </span>

              <span className="flex items-center gap-1">
                How to use <FaPlayCircle className="text-[#0256F5]" />
              </span>
            </div>

            <div className="mt-4 dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
              <CustomBarChart
                data={FiiDiiData.slice(0, 10)}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
        <FiiDiiTable data={FiiDiiData} loading={loading} />
      </section>
    </>
  );
};

export default FIIDIIPage;
