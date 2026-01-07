/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { FcCandleSticks } from "react-icons/fc";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import nr7 from "../../../../assets/Images/Dashboard/AiSwingTradesPAge/nr7.png";
import Loader from "../../../Loader";
import StrategyCard from "../../../StrategyCard";
import Lock from "../../Lock";

const AIContractions = ({ data, loading, error, isSubscribed }) => {
  const [sortedData, setSortedData] = useState([]);
  const [sortOrderChange, setSortOrderChange] = useState("desc");
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
          name={"contraction"}
          title={"AI Contraction (TF-Daily)"}
          imageSrc={nr7}
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
                        Date{" "}
                        <MdOutlineKeyboardArrowDown
                          className={
                            sortOrderDateTime === "desc"
                              ? "rotate-180 inline-flex"
                              : " inline-flex"
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
                    {error && <p>{error?.message || error?.response?.data}</p>}
                    {sortedData.length > 0 ? (
                      sortedData.map((stock, index) => (
                        <tr key={index}>
                          <td className="py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                            <a
                              target="_blank"
                              href={`https://in.tradingview.com/chart/?symbol=NSE%3A${stock?.UNDERLYING_SYMBOL}&interval=D`}
                              className=""
                            >
                              {stock?.UNDERLYING_SYMBOL}
                            </a>
                          </td>
                          <td className="text-base sm:text-lg text-center whitespace-nowrap">
                            <a
                              target="_blank"
                              href={`https://in.tradingview.com/chart/?symbol=NSE%3A${stock?.UNDERLYING_SYMBOL}&interval=D`}
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
                              {stock?.percentageChange}
                              {/* {Number(stock?.percentageChange=0)?.toFixed(2)} */}
                            </span>
                          </td>
                          <td className="text-[10px] sm:text-xs text-center whitespace-nowrap">
                            {stock?.timestamp.split("T")[0]}
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

export default AIContractions;
