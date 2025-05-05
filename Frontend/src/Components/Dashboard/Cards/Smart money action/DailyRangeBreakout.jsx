import { FaSearch } from "react-icons/fa";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { FcCandleSticks } from "react-icons/fc";
import Loader from "../../../Loader";
import OneDayHL from "../../../../assets/Images/Dashboard/monryActionPage/oneDayHL.png";
import { useEffect, useState } from "react";
import Lock from "../../Lock";

const DailyRangeBreakout = ({ data, loading, error,isSubscribed }) => {
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
        ? a.stockSymbol.localeCompare(b.stockSymbol)
        : b.stockSymbol.localeCompare(a.stockSymbol)
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
    <div className="relative w-full h-[360px] bg-gradient-to-tr from-[#0009B2] to-[#02000E] rounded-lg p-px overflow-hidden">
      <div className="w-full h-full dark:bg-db-primary bg-db-primary-light rounded-lg p-2">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img
              src={OneDayHL}
              alt="Logo"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
              AI Range Breakout (Daily)
                <FcCandleSticks />
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
             {
              isSubscribed === 'false' ? <Lock/> : (
                <table className="w-full">
                {/* Table Header */}
                <thead className="sticky top-0 dark:bg-db-secondary bg-db-secondary-light z-10">
                  <tr className="dark:text-gray-300 text-gray-800">
                    <th className="py-2 text-left" onClick={handleSortBySymbol}>
                      Symbol{" "}
                      <MdOutlineKeyboardArrowDown className="inline-flex" />
                    </th>
                    <th className="py-2 text-center">
                      <MdOutlineKeyboardArrowDown />
                    </th>
                    <th
                      className="py-2 text-center"
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
                    <th className="py-2 text-center " onClick={handleSortByDateTime}>
                      Date Time{" "}
                      <MdOutlineKeyboardArrowDown  className={sortOrderDateTime === "desc" ? "rotate-180 inline-flex" : " inline-flex"} />
                    </th>
                    <th
                      className="py-2 text-right cursor-pointer "
                      onClick={handleSortByType}
                    >
                      <MdOutlineKeyboardArrowDown
                        className={sortOrderType === "desc" ? "rotate-180" : ""}
                      />
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
                        <td className="py-3 text-left text-sm font-semibold">
                        <a
                            target="_blank"
                              href={`https://in.tradingview.com/chart/?symbol=NSE%3A${stock?.stockSymbol}`}
                            >
                            {stock?.stockSymbol}
                            </a>
                        </td>
                        <td className="text-lg text-center">
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
                            {Number(stock?.percentageChange)?.toFixed(2)}
                          </span>
                        </td>
                        <td className="text-xs text-center">
                          {stock?.timestamp.slice(7, 25)}...
                        </td>
                        <td className="text-right text-sm"><span className={`px-2 py-[2px] rounded-3xl  text-white ${stock?.type === "Bearish" ? "bg-red-600" : "bg-green-600"}`}>{stock?.type}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        {!loading && !error ? "No data available" : ""}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              )
             }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default  DailyRangeBreakout;
