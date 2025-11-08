/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";

import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { FcCandleSticks } from "react-icons/fc";
import meter from "../../../assets/Images/Dashboard/marketdepthpage/meter.png";
import Loader from "../../Loader";
import Lock from "../Lock";

const HighPowerStock = ({
  data = [],
  loading = false,
  isSubscribed = false,
  error = null,
}) => {
  const [sortedData, setSortedData] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortOrderChange, setSortOrderChange] = useState("desc");
  const [sortOrderSymbol, setSortOrderSymbol] = useState("desc");

  // Update sortedData whenever data changes
  useEffect(() => {
    setSortedData(Array.isArray(data) ? data : []);
  }, [data]);

  // Function to sort data by turnover
  const handleSort = () => {
    if (!sortedData?.length) return;

    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    const sorted = [...sortedData].sort((a, b) =>
      newOrder === "asc" ? a.turnover - b.turnover : b.turnover - a.turnover
    );

    setSortedData(sorted);
    setSortOrder(newOrder);
  };

  // Function to sort data by percentage change
  const handleSortByPercentageChange = () => {
    if (!sortedData?.length) return;

    const newOrder = sortOrderChange === "asc" ? "desc" : "asc";
    const sorted = [...sortedData].sort((a, b) => {
      const numA = a.changePercentage || 0;
      const numB = b.changePercentage || 0;
      return newOrder === "asc" ? numA - numB : numB - numA;
    });

    setSortedData(sorted);
    setSortOrderChange(newOrder);
  };

  // Function to sort data by symbol
  const handleSortBySymbol = () => {
    if (!sortedData?.length) return;

    const newOrder = sortOrderSymbol === "asc" ? "desc" : "asc";
    const sorted = [...sortedData].sort((a, b) =>
      newOrder === "asc"
        ? a.UNDERLYING_SYMBOL.localeCompare(b.UNDERLYING_SYMBOL)
        : b.UNDERLYING_SYMBOL.localeCompare(a.UNDERLYING_SYMBOL)
    );

    setSortedData(sorted);
    setSortOrderSymbol(newOrder);
  };

  return (
    <div className="relative w-full h-[360px] dark:bg-gradient-to-tr from-[#0009B2] to-[#02000E] rounded-lg p-px overflow-hidden">
      <div className="w-full h-full dark:bg-db-primary bg-[#FFFFFF] dark:text-white text-[#01071C] rounded-lg p-2">
        {/* Header Section */}
        <div className="flex justify-between items-center ">
          <div className="flex items-center gap-2">
            <img src={meter} alt="Logo" className="w-12 h-12 object-contain" />
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2 dark:text-white text-[#01071C] ">
                AI Large Cap Power Stocks <FcCandleSticks />
              </h2>
              <p className="dark:text-gray-400   text-sm flex items-center gap-2">
                How to use{" "}
                <span className="bg-blue-600 px-2 py-1 rounded-full text-xs text-white">
                  Live
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="dark:bg-gradient-to-bl from-[#00078F] to-[#01071C] p-px h-fit mt-4 rounded-lg bg-[#EEEEEE]">
          <div className="w-full rounded-lg dark:bg-db-secondary bg-[#EEEEEE] p-2 relative">
            {/* Scrollable wrapper */}
            <div className="h-[260px] overflow-y-auto rounded-lg scrollbar-hidden">
              {!isSubscribed ? (
                <Lock />
              ) : (
                <table className="w-full">
                  {/* Table Header */}
                  <thead className="sticky top-0 dark:bg-db-secondary bg-[#EEEEEE] z-10">
                    <tr className="dark:text-gray-300 ">
                      <th
                        className="flex justify-start items-center py-2"
                        onClick={handleSortBySymbol}
                      >
                        Symbol{" "}
                        <MdOutlineKeyboardArrowDown
                          className={
                            sortOrderSymbol === "desc" ? "rotate-180" : ""
                          }
                        />
                      </th>
                      <th className="py-2">
                        <MdOutlineKeyboardArrowDown />
                      </th>
                      <th
                        className="py-2 flex items-center justify-center"
                        onClick={handleSortByPercentageChange}
                      >
                        %{" "}
                        <MdOutlineKeyboardArrowDown
                          className={
                            sortOrderChange === "desc" ? "rotate-180" : ""
                          }
                        />
                      </th>
                      <th
                        className="text-right py-2 cursor-pointer"
                        onClick={handleSort}
                      >
                        <span className="flex items-center justify-end">
                          T.O.{" "}
                          <MdOutlineKeyboardArrowDown
                            className={sortOrder === "desc" ? "rotate-180" : ""}
                          />
                        </span>
                      </th>
                    </tr>
                    <tr className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r dark:from-[#000] via-[#002ED0] dark:to-[#000]" />
                  </thead>

                  {/* Scrollable Table Body */}
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="relative h-[200px] w-full">
                          <div className="absolute inset-0 flex justify-center items-center">
                            <Loader />
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          <p>{error}</p>
                        </td>
                      </tr>
                    ) : sortedData?.length > 0 ? (
                      sortedData.map((stock) => (
                        <tr key={stock?.UNDERLYING_SYMBOL}>
                          <td className="flex items-center font-medium text-xs gap-2 py-3">
                            <a
                              target="_blank"
                              href={`https://in.tradingview.com/chart/?symbol=NSE%3A${stock?.UNDERLYING_SYMBOL}&interval=5`}
                              className=""
                            >
                              {stock?.UNDERLYING_SYMBOL}
                            </a>
                          </td>
                          <td className="text-lg">
                            <a
                              target="_blank"
                              href={`https://in.tradingview.com/chart/?symbol=NSE%3A${stock?.UNDERLYING_SYMBOL}&interval=5`}
                            >
                              <FcCandleSticks />
                            </a>
                          </td>
                          <td className="text-center text-white">
                            <span
                              className={`${
                                stock?.changePercentage >= 0
                                  ? "bg-green-600"
                                  : "bg-red-600"
                              } px-2 py-1 text-xs rounded-full text-white`}
                            >
                              {stock?.changePercentage?.toFixed(2)}
                            </span>
                          </td>
                          <td className="text-right text-xs ">
                            {(stock?.turnover / 1e7).toFixed(2) + " Cr"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-4 "
                        >
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighPowerStock;
