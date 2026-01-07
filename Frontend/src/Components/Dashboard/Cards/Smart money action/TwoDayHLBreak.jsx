/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { FcCandleSticks } from "react-icons/fc";
import Loader from "../../../Loader";
import twoDayhl from "../../../../assets/Images/Dashboard/monryActionPage/twoDayHL.png";
import Lock from "../../Lock";
import StrategyCard from "../../../StrategyCard";

const TwoDayHLBreak = ({ data, loading, error, isSubscribed }) => {
  const [sortedData, setSortedData] = useState([]);
  const [sortOrderChange, setSortOrderChange] = useState("desc");
  const [sortOrderType, setSortOrderType] = useState("desc");
  const [sortOrderSymbol, setSortOrderSymbol] = useState("desc");
  const [sortOrderDateTime, setSortOrderDateTime] = useState("desc");

  useEffect(() => {
    setSortedData(data || []);
  }, [data]);

  const handleSortByPercentageChange = () => {
    if (!sortedData?.length) return;

    const newOrder = sortOrderChange === "asc" ? "desc" : "asc";
    const sorted = [...sortedData].sort((a, b) => {
      const numA = Number(a.percentageChange);
      const numB = Number(b.percentageChange);
      return newOrder === "asc" ? numA - numB : numB - numA;
    });

    setSortedData(sorted);
    setSortOrderChange(newOrder);
  };

  const handleSortByType = () => {
    if (!sortedData?.length) return;

    const newOrder = sortOrderType === "asc" ? "desc" : "asc";
    const sorted = [...sortedData].sort((a, b) =>
      newOrder === "asc"
        ? String(a.type).localeCompare(String(b.type))
        : String(b.type).localeCompare(String(a.type))
    );

    setSortedData(sorted);
    setSortOrderType(newOrder);
  };

  const handleSortBySymbol = () => {
    if (!sortedData?.length) return;

    const newOrder = sortOrderSymbol === "asc" ? "desc" : "asc";
    const sorted = [...sortedData].sort((a, b) =>
      newOrder === "asc"
        ? a.underlyingSymbol.localeCompare(b.underlyingSymbol)
        : b.underlyingSymbol.localeCompare(a.underlyingSymbol)
    );

    setSortedData(sorted);
    setSortOrderSymbol(newOrder);
  };
  const handleSortByDateTime = () => {
    if (!sortedData?.length) return;

    const newOrder = sortOrderDateTime === "asc" ? "desc" : "asc";
    const sorted = [...sortedData].sort((a, b) => {
      const dateA = new Date(
        a.timestamp.replace(/(\d+)\/(\d+)\/(\d+),/, "$2/$1/$3")
      );
      const dateB = new Date(
        b.timestamp.replace(/(\d+)\/(\d+)\/(\d+),/, "$2/$1/$3")
      );

      return newOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setSortedData(sorted);
    setSortOrderDateTime(newOrder);
  };

  return (
    <div className="relative w-full h-[360px] dark:bg-gradient-to-tr from-[#0009B2] to-[#02000E] rounded-lg p-px overflow-hidden">
      <div className="w-full h-full dark:bg-db-primary bg-primary-light rounded-lg p-2">
        {/* Header Section */}
        <StrategyCard
          Icon={FcCandleSticks}
          name={"two-day-hl-break"}
          title={"AI 2 DAY H/L Break ( 5MIN TF)"}
          imageSrc={twoDayhl}
          imageAlt={"logo"}
        />

        {/* Table Section */}
        <div className="dark:bg-gradient-to-bl from-[#00078F] to-[#01071C] p-px h-fit mt-4 rounded-lg">
          <div className="w-full rounded-lg dark:bg-db-secondary bg-[#EEEEEE] p-2 relative">
            {/* Scrollable wrapper */}
            <div className="h-[260px] overflow-y-auto overflow-x-hidden sm:overflow-x-auto rounded-lg scrollbar-hidden">
              {!isSubscribed ? (
                <Lock />
              ) : (
                <table className="w-full">
                  {/* Table Header */}
                  <thead className="sticky top-0 dark:bg-db-secondary bg-[#EEEEEE] z-10">
                    <tr className="dark:text-gray-300 ">
                      <th
                        className="py-2 text-left text-xs sm:text-sm whitespace-nowrap"
                        onClick={handleSortBySymbol}
                      >
                        Symbol{" "}
                        <MdOutlineKeyboardArrowDown className="inline-flex" />
                      </th>
                      <th className="py-2 text-center whitespace-nowrap">
                        <MdOutlineKeyboardArrowDown />
                      </th>
                      <th
                        className="py-2 text-center whitespace-nowrap"
                        onClick={handleSortByPercentageChange}
                      >
                        %{" "}
                        <MdOutlineKeyboardArrowDown
                          className={
                            sortOrderChange === "desc"
                              ? "rotate-180 inline-flex"
                              : " inline-flex"
                          }
                        />
                      </th>
                      <th
                        className="py-2 text-center text-xs sm:text-sm whitespace-nowrap"
                        onClick={handleSortByDateTime}
                      >
                        Date Time{" "}
                        <MdOutlineKeyboardArrowDown
                          className={
                            sortOrderDateTime === "desc"
                              ? "rotate-180 inline-flex"
                              : " inline-flex"
                          }
                        />
                      </th>
                      <th
                        className="py-2 text-right cursor-pointer whitespace-nowrap"
                        onClick={handleSortByType}
                      >
                        <MdOutlineKeyboardArrowDown
                          className={
                            sortOrderType === "desc"
                              ? "rotate-180 inline-flex"
                              : "inline-flex"
                          }
                        />
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
                    {error && <p>{error}</p>}
                    {sortedData.length > 0 ? (
                      sortedData.map((stock, index) => (
                        <tr key={index}>
                          <td className="py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                            <a
                              target="_blank"
                              href={`https://in.tradingview.com/chart/?symbol=NSE%3A${stock?.underlyingSymbol}&interval=5`}
                              className=""
                            >
                              {stock?.underlyingSymbol}
                            </a>
                          </td>
                          <td className="text-base sm:text-lg text-center whitespace-nowrap">
                            <a
                              target="_blank"
                              href={`https://in.tradingview.com/chart/?symbol=NSE%3A${stock?.underlyingSymbol}&interval=5`}
                              className=""
                            >
                              <FcCandleSticks />
                            </a>
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <span
                              className={`${
                                stock?.percentageChange >= 0
                                  ? "bg-green-600"
                                  : "bg-red-600"
                              } px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full text-white`}
                            >
                              {Number(stock?.percentageChange)?.toFixed(2)}
                            </span>
                          </td>
                          <td className="text-[10px] sm:text-xs text-center whitespace-nowrap">
                            {stock?.timestamp}
                          </td>
                          <td className="text-right text-xs sm:text-sm whitespace-nowrap">
                            <span
                              className={`px-1.5 sm:px-2 py-[2px] rounded-full text-white ${
                                stock?.type === "Bearish"
                                  ? "bg-red-600"
                                  : "bg-green-600"
                              }`}
                            >
                              {stock?.type}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4 ">
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

export default TwoDayHLBreak;
