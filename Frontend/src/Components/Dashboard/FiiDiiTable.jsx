/* eslint-disable react/prop-types */
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
        <div className="dark:bg-db-primary bg-primary-light rounded-lg p-2 ">
          <h2 className="text-2xl font-semibold p-2 flex items-center gap-2 ">
            FII / DII <FcCandleSticks />
          </h2>
          <div className="dark:bg-gradient-to-br from-[#00078F] to-[#01071C] p-px rounded-lg">
            <div className="dark:bg-db-secondary bg-[#EEEEEE] rounded-lg p-4 w-full overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b-1 border-[#BEBFC3] dark:border-[#002ED0]">
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
                        className="p-3 text-left whitespace-nowrap "
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                  <tr className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r dark:from-[#000] via-[#002ED0] dark:to-[#000] " />
                </thead>
                <tbody>
                  {data?.map((row, index) => (
                    <tr key={index} className="">
                      <td className="p-3 whitespace-nowrap ">{row?.date}</td>
                      <td className="p-3 whitespace-nowrap ">{row?.fii_buy}</td>
                      <td className="p-3 whitespace-nowrap ">
                        {row?.fii_sell}
                      </td>
                      <td
                        className={`p-3 whitespace-nowrap ${
                          row?.fii_net < 0 ? "text-[#C0313F]" : "text-[#269F3C]"
                        }`}
                      >
                        {row.fii_net}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`${
                            (row?.fii_net + row?.dii_net).toFixed(2) < 0
                              ? "bg-[#fba8a8]"
                              : "bg-[#269F3C]"
                          }  text-white font-semibold px-3 py-1 rounded-full`}
                        >
                          {(row?.fii_net + row?.dii_net).toFixed(2)}
                        </span>
                      </td>
                      <td
                        className={`p-3 whitespace-nowrap ${
                          row?.dii_net < 0 ? "text-[#C0313F]" : "text-[#269F3C]"
                        }`}
                      >
                        {row?.dii_net}
                      </td>
                      <td className="p-3 whitespace-nowrap ">{row?.dii_buy}</td>
                      <td className="p-3 whitespace-nowrap ">
                        {row?.dii_sell}
                      </td>
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
