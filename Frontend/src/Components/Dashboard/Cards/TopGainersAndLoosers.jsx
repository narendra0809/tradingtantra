/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { FcCandleSticks } from "react-icons/fc";
import topGainers from "../../../assets/Images/Dashboard/marketdepthpage/topGainers.png";
import topLoosers from "../../../assets/Images/Dashboard/marketdepthpage/topLoosers.png";
import Loader from "../../Loader";
import Lock from "../Lock";
import StrategyCard from "../../StrategyCard";

const TopGainers = ({ data, loading, error, isSubscribed }) => {
  const [sortedData, setSortedData] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc"); // desc by default
  const [sortOrderChange, setSortOrderChange] = useState("desc");
  const [sortOrderSymbol, setSortOrderSymbol] = useState("desc");

  // Update sortedData whenever data changes
  useEffect(() => {
    setSortedData(data || []);
  }, [data]);

  // Function to sort data

  const handleSort = () => {
    if (!sortedData?.length) return;

    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    const sorted = [...sortedData].sort((a, b) =>
      newOrder === "asc" ? a.xElement - b.xElement : b.xElement - a.xElement
    );

    setSortedData(sorted);
    setSortOrder(newOrder);
  };

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

  const handleSortBySymbol = () => {
    if (!sortedData?.length) return;

    const newOrder = sortOrderSymbol === "asc" ? "desc" : "asc";
    const sorted = [...sortedData].sort((a, b) =>
      newOrder === "asc"
        ? a.stockSymbol.localeCompare(b.stockSymbol)
        : b.stockSymbol.localeCompare(a.stockSymbol)
    );

    setSortedData(sorted);
    setSortOrderSymbol(newOrder);
  };

  return (
    <div className="relative w-full h-[360px] dark:bg-gradient-to-tr from-[#0009B2] to-[#02000E] rounded-lg p-px overflow-hidden">
      <div className="w-full h-full dark:bg-db-primary bg-primary-light rounded-lg p-2">
        {/* Header Section */}
        <StrategyCard
          Icon={FcCandleSticks}
          title={"Top Gainers"}
          imageAlt={"topGainers"}
          imageSrc={topGainers}
          name={"top-gainers"}
        />

        {/* Table Section */}
        <div className="dark:bg-gradient-to-bl from-[#00078F] to-[#01071C] p-px h-fit mt-4 rounded-lg">
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
                      <th className="text-right py-2 cursor-pointer">
                        <span
                          title="xElement"
                          className="flex items-center justify-end"
                          onClick={handleSort}
                        >
                          xElem{" "}
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
                    {loading && (
                      <tr>
                        <td colSpan="4" className="relative h-[200px] w-full">
                          <div className="absolute inset-0 flex justify-center items-center">
                            <Loader />
                          </div>
                        </td>
                      </tr>
                    )}
                    {error && (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          {error}
                        </td>
                      </tr>
                    )}
                    {sortedData.length > 0 ? (
                      sortedData.map((stock, index) => (
                        <tr key={index}>
                          <td className="flex items-center font-medium text-xs gap-2 py-3">
                            <a
                              target="_blank"
                              href={`https://in.tradingview.com/chart/?symbol=NSE%3A${stock?.stockSymbol}&interval=5`}
                              className=""
                            >
                              {stock?.stockSymbol}
                            </a>
                          </td>
                          <td className="text-lg">
                            <a
                              target="_blank"
                              href={`https://in.tradingview.com/chart/?symbol=NSE%3A${stock?.stockSymbol}&interval=5`}
                              className=""
                            >
                              <FcCandleSticks />
                            </a>
                          </td>
                          <td className="text-center text-white">
                            <span
                              className={`${
                                stock?.percentageChange >= 0
                                  ? "bg-green-600"
                                  : "bg-red-600"
                              } px-2 py-1 text-xs rounded-full `}
                            >
                              {stock?.percentageChange}
                            </span>
                          </td>
                          <td className="text-right text-xs ">
                            {stock?.xElement?.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4 ">
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

const TopLoosers = ({ data, loading, error, isSubscribed }) => {
  const [sortedData, setSortedData] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc"); // desc by default
  const [sortOrderChange, setSortOrderChange] = useState("desc");
  const [sortOrderSymbol, setSortOrderSymbol] = useState("desc");
  // Update sortedData whenever data changes
  useEffect(() => {
    setSortedData(data || []);
  }, [data]);

  // Function to sort data
  const handleSort = () => {
    if (!sortedData?.length) return;

    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    const sorted = [...sortedData].sort((a, b) =>
      newOrder === "asc" ? a.xElement - b.xElement : b.xElement - a.xElement
    );

    setSortedData(sorted);
    setSortOrder(newOrder);
  };

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

  const handleSortBySymbol = () => {
    if (!sortedData?.length) return;

    const newOrder = sortOrderSymbol === "asc" ? "desc" : "asc";
    const sorted = [...sortedData].sort((a, b) =>
      newOrder === "asc"
        ? a.stockSymbol.localeCompare(b.stockSymbol)
        : b.stockSymbol.localeCompare(a.stockSymbol)
    );

    setSortedData(sorted);
    setSortOrderSymbol(newOrder);
  };

  return (
    <div className="relative w-full h-[360px] dark:bg-gradient-to-tr from-[#0009B2] to-[#02000E] rounded-lg p-px overflow-hidden">
      <div className="w-full h-full dark:bg-db-primary bg-primary-light rounded-lg p-2">
        {/* Header Section */}
        <StrategyCard
          Icon={FcCandleSticks}
          title={"Top Loosers"}
          imageAlt={"topLoosers"}
          imageSrc={topLoosers}
          name={"top-loosers"}
        />

        {/* Table Section */}
        <div className="dark:bg-gradient-to-bl from-[#00078F] to-[#01071C] p-px h-fit mt-4 rounded-lg">
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
                            sortOrderChange === "asc" ? "rotate-180" : ""
                          }
                        />
                      </th>
                      <th className=" py-2 cursor-pointer">
                        <span
                          title="xElement"
                          className="flex  items-center justify-end"
                          onClick={handleSort}
                        >
                          xElem{" "}
                          <MdOutlineKeyboardArrowDown
                            className={sortOrder === "desc" ? "rotate-180" : ""}
                          />
                        </span>
                      </th>
                    </tr>
                    <tr className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r dark:from-[#000] via-[#002ED0] dark:to-[#000] " />
                  </thead>

                  {/* Scrollable Table Body */}
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan="4" className="relative h-[200px] w-full">
                          <div className="absolute inset-0 flex justify-center items-center">
                            <Loader />
                          </div>
                        </td>
                      </tr>
                    )}
                    {error && (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          {error}
                        </td>
                      </tr>
                    )}
                    {sortedData.length > 0 ? (
                      sortedData.map((stock, index) => (
                        <tr key={index}>
                          <td className="flex items-center font-medium text-xs gap-2 py-3">
                            <a
                              target="_blank"
                              href={`https://in.tradingview.com/chart/?symbol=NSE%3A${stock?.stockSymbol}&interval=5`}
                              className=""
                            >
                              {stock?.stockSymbol}
                            </a>
                          </td>
                          <td className="text-lg">
                            <a
                              target="_blank"
                              href={`https://in.tradingview.com/chart/?symbol=NSE%3A${stock?.stockSymbol}&interval=5`}
                              className=""
                            >
                              <FcCandleSticks />
                            </a>
                          </td>
                          <td className="text-center text-white">
                            <span
                              className={`${
                                stock?.percentageChange >= 0
                                  ? "bg-green-600"
                                  : "bg-red-600"
                              } px-2 py-1 text-xs rounded-full `}
                            >
                              {stock?.percentageChange}
                            </span>
                          </td>
                          <td className="text-right text-xs ">
                            {stock?.xElement?.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4 ">
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

export { TopGainers, TopLoosers };
