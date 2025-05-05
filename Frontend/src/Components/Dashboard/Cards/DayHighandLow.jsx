import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { FcCandleSticks } from "react-icons/fc";
import Loader from "../../Loader";
import dayHigh from "../../../assets/Images/Dashboard/marketdepthpage/dayHigh.png";
import dayLow from "../../../assets/Images/Dashboard/marketdepthpage/dayLow.png";
import Lock from "../Lock";

const DayHigh = ({ data, loading, error, isSubscribed }) => {
  const [sortedData, setSortedData] = useState([]);
  const [sortOrderChange, setSortOrderChange] = useState("desc");
  const [sortOrderDiff, setSortOrderDiff] = useState("desc");
  const [sortOrderSymbol, setSortOrderSymbol] = useState("desc");

  useEffect(() => {
    setSortedData(data || []);
  }, [data]);

  const handleSortByPercentageChange = () => {
    if (!sortedData?.length) return;

    const newOrder = sortOrderChange === "asc" ? "desc" : "asc";
    const sorted = [...sortedData].sort((a, b) =>
      newOrder === "asc"
        ? a.percentageChange - b.percentageChange
        : b.percentageChange - a.percentageChange
    );

    setSortedData(sorted);
    setSortOrderChange(newOrder);
  };

  const handleSortByPercentageDifference = () => {
    if (!sortedData?.length) return;

    const newOrder = sortOrderDiff === "asc" ? "desc" : "asc";
    const sorted = [...sortedData].sort((a, b) =>
      newOrder === "asc"
        ? a.percentageDifference - b.percentageDifference
        : b.percentageDifference - a.percentageDifference
    );

    setSortedData(sorted);
    setSortOrderDiff(newOrder);
  };

  const handleSortBySymbol = () => {
    if (!sortedData?.length) return;

    const newOrder = sortOrderSymbol === "asc" ? "desc" : "asc";
    const sorted = [...sortedData].sort((a, b) =>
      newOrder === "asc"
        ? a.stock.UNDERLYING_SYMBOL.localeCompare(b.stock.UNDERLYING_SYMBOL)
        : b.stock.UNDERLYING_SYMBOL.localeCompare(a.stock.UNDERLYING_SYMBOL)
    );

    setSortedData(sorted);
    setSortOrderSymbol(newOrder);
  };

  return (
    <div className="relative w-full h-[360px] bg-gradient-to-tr from-[#0009B2] to-[#02000E] rounded-lg p-px overflow-hidden">
      <div className="w-full h-full dark:bg-db-primary bg-db-primary-light rounded-lg p-2">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img
              src={dayHigh}
              alt="Logo"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                Day High Break <FcCandleSticks />
              </h2>
              <p className="dark:text-gray-400 text-sm flex items-center gap-2">
                How to use{" "}
                <span className="bg-blue-600 px-2 py-1 rounded-full text-xs">
                  Live
                </span>
              </p>
            </div>
          </div>

          <button className="p-2 rounded-lg transition bg-gradient-to-b from-[#085AF5] to-[#73A3FE]">
            <FaSearch />
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-gradient-to-bl from-[#00078F] to-[#01071C] p-px h-fit mt-4 rounded-lg">
          <div className="w-full rounded-lg dark:bg-db-secondary bg-db-secondary-light p-2 relative">
            {/* Scrollable wrapper */}
            <div className="h-[260px] overflow-y-auto rounded-lg scrollbar-hidden">
              {isSubscribed === "false" ? (
                <Lock />
              ) : (
                <table className="w-full">
                  {/* Table Header */}
                  <thead className="sticky top-0 dark:bg-db-secondary bg-db-secondary-light z-10">
                    <tr className="dark:text-gray-300 text-gray-800">
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
                        onClick={handleSortByPercentageDifference}
                      >
                        <span className="flex justify-end items-center">
                          Diff{" "}
                          <MdOutlineKeyboardArrowDown
                            className={
                              sortOrderDiff === "desc" ? "rotate-180" : ""
                            }
                          />
                        </span>
                      </th>
                    </tr>
                    <tr className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#000A2D] via-[#002ED0] to-[#000A2D]" />
                  </thead>

                  {/* Scrollable Table Body */}
                  <tbody>
                    {loading && <Loader />}
                    {error && <p>{error}</p>}
                    {sortedData.length > 0 ? (
                      sortedData?.map((stock, index) => (
                        <tr key={index}>
                          {/* {console.log(stock?.xElement)} */}
                          <td className="flex items-center font-medium text-xs gap-2 py-3">
                            <a
                              target="_blank"
                              href={`https://in.tradingview.com/chart/?symbol=NSE%3A${stock?.stock?.UNDERLYING_SYMBOL}`}
                            >
                              {stock?.stock?.UNDERLYING_SYMBOL}
                            </a>
                          </td>
                          <td className="text-lg">
                            <FcCandleSticks />
                          </td>
                          <td className="text-center">
                            <span
                              className={`${
                                stock?.percentageChange >= 0
                                  ? "bg-green-600"
                                  : "bg-red-600"
                              } px-2 py-1 text-xs rounded-full`}
                            >
                              {stock?.percentageChange}
                            </span>
                          </td>
                          <td className="text-right text-xs">
                            {stock?.percentageDifference}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          {!loading && !error ? "No data available" : ""}
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

const DayLow = ({ data, loading, error, isSubscribed }) => {
  const [sortedData, setSortedData] = useState([]);
  const [sortOrderChange, setSortOrderChange] = useState("desc");
  const [sortOrderDiff, setSortOrderDiff] = useState("desc");
  const [sortOrderSymbol, setSortOrderSymbol] = useState("desc");

  // console.log('dayLow',data)
  // Update sortedData whenever data changes
  useEffect(() => {
    setSortedData(data || []);
  }, [data]);

  // Function to sort data
  const handleSortByPercentageChange = () => {
    if (!sortedData?.length) return;

    const newOrder = sortOrderChange === "asc" ? "desc" : "asc";
    const sorted = [...sortedData].sort((a, b) =>
      newOrder === "asc"
        ? a.percentageChange - b.percentageChange
        : b.percentageChange - a.percentageChange
    );

    setSortedData(sorted);
    setSortOrderChange(newOrder);
  };

  const handleSortByPercentageDifference = () => {
    if (!sortedData?.length) return;

    const newOrder = sortOrderDiff === "asc" ? "desc" : "asc";
    const sorted = [...sortedData].sort((a, b) =>
      newOrder === "asc"
        ? a.percentageDifference - b.percentageDifference
        : b.percentageDifference - a.percentageDifference
    );

    setSortedData(sorted);
    setSortOrderDiff(newOrder);
  };

  const handleSortBySymbol = () => {
    if (!sortedData?.length) return;

    const newOrder = sortOrderSymbol === "asc" ? "desc" : "asc";
    const sorted = [...sortedData].sort((a, b) =>
      newOrder === "asc"
        ? a.stock.UNDERLYING_SYMBOL.localeCompare(b.stock.UNDERLYING_SYMBOL)
        : b.stock.UNDERLYING_SYMBOL.localeCompare(a.stock.UNDERLYING_SYMBOL)
    );

    setSortedData(sorted);
    setSortOrderSymbol(newOrder);
  };

  return (
    <div className="relative w-full h-[360px] bg-gradient-to-tr from-[#0009B2] to-[#02000E] rounded-lg p-px overflow-hidden">
      <div className="w-full h-full dark:bg-db-primary bg-db-primary-light rounded-lg p-2">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={dayLow} alt="Logo" className="w-12 h-12 object-contain" />
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                Day Low Break <FcCandleSticks />
              </h2>
              <p className="dark:text-gray-400 text-sm flex items-center gap-2">
                How to use{" "}
                <span className="bg-blue-600 px-2 py-1 rounded-full text-xs">
                  Live
                </span>
              </p>
            </div>
          </div>

          <button className="p-2 rounded-lg transition bg-gradient-to-b from-[#085AF5] to-[#73A3FE]">
            <FaSearch />
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-gradient-to-bl from-[#00078F] to-[#01071C] p-px h-fit mt-4 rounded-lg">
          <div className="w-full rounded-lg dark:bg-db-secondary bg-db-secondary-light p-2 relative">
            {/* Scrollable wrapper */}
            <div className="h-[260px] overflow-y-auto rounded-lg scrollbar-hidden">
              {isSubscribed === "false" ? (
                <Lock />
              ) : (
                <table className="w-full">
                  {/* Table Header */}
                  <thead className="sticky top-0 dark:bg-db-secondary bg-db-secondary-light z-10">
                    <tr className="dark:text-gray-300 text-gray-800">
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
                        onClick={handleSortByPercentageDifference}
                      >
                        <span className="flex justify-end items-center">
                          Diff{" "}
                          <MdOutlineKeyboardArrowDown
                            className={
                              sortOrderDiff === "desc" ? "rotate-180" : ""
                            }
                          />
                        </span>
                      </th>
                    </tr>
                    <tr className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#000A2D] via-[#002ED0] to-[#000A2D]" />
                  </thead>

                  {/* Scrollable Table Body */}
                  <tbody>
                    {loading && <Loader />}
                    {error && <p>{error}</p>}
                    {sortedData.length > 0 ? (
                      sortedData.map((stock, index) => (
                        <tr key={index}>
                          <td className="flex items-center font-medium text-xs gap-2 py-3">
                            <a
                              target="_blank"
                              href={`https://in.tradingview.com/chart/?symbol=NSE%3A${stock?.stock?.UNDERLYING_SYMBOL}`}
                            >
                              {stock?.stock?.UNDERLYING_SYMBOL}
                            </a>
                          </td>
                          <td className="text-lg">
                            <FcCandleSticks />
                          </td>
                          <td className="text-center">
                            <span
                              className={`${
                                stock?.percentageChange >= 0
                                  ? "bg-green-600"
                                  : "bg-red-600"
                              } px-2 py-1 text-xs rounded-full`}
                            >
                              {stock?.percentageChange}
                            </span>
                          </td>
                          <td className="text-right text-xs">
                            {stock?.percentageDifference}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          {!loading && !error ? "No data available" : ""}
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

export { DayHigh, DayLow };
