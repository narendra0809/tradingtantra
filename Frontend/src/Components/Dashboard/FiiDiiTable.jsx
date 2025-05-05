import React from "react";
import { FcCandleSticks } from "react-icons/fc";
import Loader from "../Loader";

// const data = Array(10).fill({
//   date: "07-02-2025",
//   fiiBuy: "1248.21",
//   fiiSell: "12952.6",
//   fiiNet: "-470.39",
//   inMarket: "-16.19",
//   diiNet: "454.3",
//   diiBuy: "12185.62",
//   diiSell: "11731.62",
// });

const FiiDiiTable = ({ data, loading }) => {
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="dark:bg-db-primary  bg-db-primary-light rounded-lg p-2 ">
          <h2 className=" text-2xl font-semibold p-2 flex items-center gap-2">
            FII / DII <FcCandleSticks />
          </h2>

          <div className="dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
            <div className="dark:bg-db-secondary bg-light-b2 rounded-lg p-4 w-full overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    {[
                      "Date",
                      "FII BUY",
                      "FII Sell",
                      "FII Net",
                      "In Market",
                      "DII Net",
                      "DII Buy",
                      "DII Sell",
                    ].map((header) => (
                      <th
                        key={header}
                        className="p-3 text-left whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.map((row, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="p-3 whitespace-nowrap">{row?.date}</td>
                      <td className="p-3 whitespace-nowrap">{row?.fii_buy}</td>
                      <td className="p-3 whitespace-nowrap">{row?.fii_sell}</td>
                      <td
                        className={`p-3 whitespace-nowrap ${
                          row?.fii_net < 0 ? "text-[#C0313F]" : "text-green-300"
                        }`}
                      >
                        {row.fii_net}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`${
                            (row?.fii_net + row?.dii_net).toFixed(2) < 0
                              ? "bg-[#fba8a8]"
                              : "bg-[#b9e3a8]"
                          }  text-gray-800 font-semibold px-3 py-1 rounded-full`}
                        >
                          {(row?.fii_net + row?.dii_net).toFixed(2)}
                        </span>
                      </td>
                      <td
                        className={`p-3 whitespace-nowrap ${
                          row?.dii_net < 0 ? "text-[#C0313F]" : "text-green-300"
                        }`}
                      >
                        {row?.dii_net}
                      </td>
                      <td className="p-3 whitespace-nowrap">{row?.dii_buy}</td>
                      <td className="p-3 whitespace-nowrap">{row?.dii_sell}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FiiDiiTable;
