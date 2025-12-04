/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import CalendarGrid from "../../Components/Dashboard/CalenarGrid";
import "react-calendar/dist/Calendar.css";
import { FaInfoCircle, FaCalendarAlt } from "react-icons/fa";
import Cookies from "js-cookie";
import useFetchData from "../../utils/useFetchData";
import { tickerSymbol } from "../../utils/tickerSymbol";
import axios from "axios";
import Lock from "../../Components/Dashboard/Lock";

const URI = import.meta.env.VITE_SERVER_URI;

// Reusable Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 backdrop-blur-3xl bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="w-full max-w-[600px] rounded-md dark:bg-db-primary bg-primary-light p-4 md:p-7 border dark:border-transparent border-white shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-2xl font-medium ">{title}</h3>
          <span
            onClick={onClose}
            className="text-xl md:text-2xl font-extrabold cursor-pointer "
          >
            X
          </span>
        </div>
        {children}
      </div>
    </div>
  );
};

const TradingJournal = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [summary, setSummary] = useState([]);
  const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
  const startDate = new Date(startYear, 3, 1);
  const endDate = new Date(startYear + 1, 3, 1);
  const [dateRange, setDateRange] = useState({ startDate, endDate });
  const [tempDates, setTempDates] = useState({ startDate, endDate });
  const [reload, setReload] = useState(true);
  const [holidays, setHolidays] = useState([]);
  const [selectedDate, setSelectedDate] = useState({
    day: "",
    month: "",
    year: "",
  });
  const [dateRangeType, setDateRangeType] = useState("long");
  const [showDateRange, setShowDateRange] = useState(false);
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [tradeData, setTradeData] = useState({
    entryDate: today,
    exitDate: today,
    symbol: "",
    entryPrice: "",
    exitPrice: "",
    quantity: "",
    dateRange: "long",
  });
  const { data, error, loading, fetchData } = useFetchData();
  const [addedTrades, setAddedTrades] = useState([]);

  const dateRangeRef = useRef(null);
  const startInputRef = useRef(null);
  const endInputRef = useRef(null);
  const addTradeRef = useRef(null);

  const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;

  const handleDateChange = (e, type) => {
    const newDate = new Date(e.target.value);
    if (type === "start") {
      const diff = tempDates.endDate - newDate;
      if (diff < 0) {
        setTempDates({ startDate: newDate, endDate: newDate });
      } else if (diff > ONE_YEAR) {
        setTempDates({
          startDate: newDate,
          endDate: new Date(newDate.getTime() + ONE_YEAR),
        });
      } else {
        setTempDates({ ...tempDates, startDate: newDate });
      }
    } else {
      const diff = newDate - tempDates.startDate;
      if (diff < 0) {
        setTempDates({ startDate: newDate, endDate: newDate });
      } else if (diff > ONE_YEAR) {
        setTempDates({
          startDate: new Date(newDate.getTime() - ONE_YEAR),
          endDate: newDate,
        });
      } else {
        setTempDates({ ...tempDates, endDate: newDate });
      }
    }
  };

  const handleTradeDateChange = (e, field) => {
    setTradeData({ ...tradeData, [field]: new Date(e.target.value) });
  };

  const handleTradeInputChange = (e) => {
    const { name, value } = e.target;
    setTradeData({ ...tradeData, [name]: value });
  };

  const handleApply = () => {
    setDateRange({
      startDate: tempDates.startDate,
      endDate: tempDates.endDate,
    });
    setShowDateRange(false);
  };

  const handleAddTradeSubmit = async () => {
    setShowAddTrade(false);
    if (!tradeData.symbol) {
      tradeData.symbol = tickerSymbol[0].proName;
    }
    await fetchData("auth/add-trade", "POST", tradeData);
    setReload(!reload);
  };

  const formatDateForInput = (date) => {
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dateRangeRef.current &&
        !dateRangeRef.current.contains(event.target)
      ) {
        setShowDateRange(false);
      }
      if (addTradeRef.current && !addTradeRef.current.contains(event.target)) {
        setShowAddTrade(false);
      }
    };

    if (showDateRange || showAddTrade) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDateRange, showAddTrade]);

  const handleInputClick = (ref) => {
    ref.current.showPicker();
  };

  useEffect(() => {
    function formatDateRange(dateRange) {
      return {
        fromDate: new Date(dateRange.startDate).toISOString().split("T")[0],
        toDate: new Date(dateRange.endDate).toISOString().split("T")[0],
      };
    }

    const formattedDate = formatDateRange(dateRange);
    fetchData("auth/get-trade", "POST", formattedDate);
  }, [reload]);

  useEffect(() => {
    if (data?.trades) {
      console.log("Data : ", data);
      setAddedTrades(data.trades);
      setSummary(data.summary);
    }
  }, [data]);

  const fetchHolidays = async () => {
    try {
      const res = await axios.get(`${URI}/get-holidays`);
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      setHolidays(res.data.holidays);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const Subscribed = Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed === "true");
  }, []);
  useEffect(() => {
    fetchHolidays();
  }, []);

  if (!isSubscribed) {
    return (
      <div className="h-full">
        <h1 className="font-semibold text-2xl md:text-3xl my-4 md:my-5">
          Trading Journal
        </h1>
        <Lock />
      </div>
    );
  }
  if (loading)
    return <div className="text-center text-white">Loading trades...</div>;
  if (error)
    return (
      <div className="text-center text-red-500">
        Error: {error.data.message}
      </div>
    );

  return (
    <div className="container mx-auto max-w-full px-4">
      <h1 className="font-semibold text-2xl md:text-3xl my-4 md:my-5">
        Trading Journal
      </h1>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-5 gap-2 md:gap-4">
        <button className="text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 border border-primary text-primary rounded-[5px] w-full md:w-auto">
          How To Use Trading Journal?
        </button>
        <div className="flex flex-col md:flex-row gap-2 md:gap-2.5 w-full md:w-auto">
          <div className="relative">
            <button
              className="text-xs md:text-sm font-normal bg-primary rounded-[5px] py-1.5 md:py-2 px-2 md:px-3 w-full md:w-auto text-white"
              onClick={() => setShowAddTrade(!showAddTrade)}
            >
              Add Trade (+)
            </button>
          </div>
          <div className="relative">
            <button
              className="text-xs md:text-sm font-normal flex items-center justify-center md:justify-start gap-2 bg-[#0256F5] rounded-[5px] py-1.5 md:py-2 px-2 md:px-3 w-full md:w-auto text-white"
              onClick={() => setShowDateRange(!showDateRange)}
            >
              <p>Date Range Selector</p>
              <FaCalendarAlt />
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showAddTrade}
        onClose={() => setShowAddTrade(false)}
        title="Add Trade"
      >
        <div className="flex flex-col gap-4 md:gap-5 ">
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full">
            <p className="text-sm md:text-lg font-normal mb-2 md:mb-0 ">
              Select Date Range* :
            </p>
            <div className="flex items-center gap-2">
              <div
                className="text-sm md:text-base cursor-pointer"
                onClick={() => setDateRangeType("long")}
              >
                Long
              </div>
              <div
                onClick={() =>
                  setDateRangeType(() =>
                    dateRangeType === "short" ? "long" : "short"
                  )
                }
                className="w-12 md:w-14 h-5 md:h-6 dark:bg-[#00114E] bg-primary-light rounded-[5px] flex items-center p-1 cursor-pointer transition-all"
              >
                <div
                  className={`w-5 md:w-6 h-5 md:h-6 bg-primary rounded-[5px] shadow-md transform transition-all ${
                    dateRangeType === "short"
                      ? "translate-x-6 md:translate-x-8"
                      : ""
                  }`}
                />
              </div>
              <div
                className="text-sm md:text-base cursor-pointer"
                onClick={() => setDateRangeType("short")}
              >
                Short
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full">
            <p className="text-sm md:text-lg font-normal mb-2 md:mb-0">
              Entry Date & Time* :
            </p>
            <input
              ref={startInputRef}
              type="date"
              value={formatDateForInput(tradeData.entryDate)}
              onChange={(e) => handleTradeDateChange(e, "entryDate")}
              onClick={() => handleInputClick(startInputRef)}
              className="dark:bg-[#00114E] bg-primary dark:placeholder:text-[#C9CFE5] placeholder:text-white text-white rounded-sm px-2 md:px-3 py-1 w-full md:w-[60%]"
            />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full">
            <p className="text-sm md:text-lg font-normal mb-2 md:mb-0">
              Exit Date & Time* :
            </p>
            <input
              ref={endInputRef}
              type="date"
              value={formatDateForInput(tradeData.exitDate)}
              onChange={(e) => handleTradeDateChange(e, "exitDate")}
              onClick={() => handleInputClick(endInputRef)}
              className="dark:bg-[#00114E] bg-primary rounded-sm px-2 md:px-3 py-1 w-full md:w-[60%] dark:placeholder:text-[#C9CFE5] placeholder:text-white text-white"
            />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full">
            <p className="text-sm md:text-lg font-normal mb-2 md:mb-0">
              Symbol/Ticker* :
            </p>
            <select
              name="symbol"
              value={tradeData?.symbol}
              onChange={handleTradeInputChange}
              className="dark:bg-[#00114E] bg-primary rounded-sm px-2 md:px-3 py-1 w-full md:w-[60%] dark:placeholder:text-[#C9CFE5] placeholder:text-white"
              placeholder="Enter symbol/ticker"
            >
              {tickerSymbol.map((symbol, index) => (
                <option key={index} value={symbol.proName}>
                  {symbol.proName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full">
            <p className="text-sm md:text-lg font-normal mb-2 md:mb-0">
              Entry Price* :
            </p>
            <input
              type="number"
              name="entryPrice"
              value={tradeData?.entryPrice}
              onChange={handleTradeInputChange}
              className="dark:bg-[#00114E] bg-primary rounded-sm px-2 md:px-3 py-1 w-full md:w-[60%] dark:placeholder:text-[#C9CFE5] placeholder:text-white"
              placeholder="Enter entry price"
            />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full">
            <p className="text-sm md:text-lg font-normal mb-2 md:mb-0">
              Exit Price* :
            </p>
            <input
              type="number"
              name="exitPrice"
              value={tradeData?.exitPrice}
              onChange={handleTradeInputChange}
              className="dark:bg-[#00114E] bg-primary rounded-sm px-2 md:px-3 py-1 w-full md:w-[60%] dark:placeholder:text-[#C9CFE5] placeholder:text-white"
              placeholder="Enter exit price"
            />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full">
            <p className="text-sm md:text-lg font-normal mb-2 md:mb-0">
              Quantity* :
            </p>
            <input
              type="number"
              name="quantity"
              value={tradeData?.quantity}
              onChange={handleTradeInputChange}
              className="dark:bg-[#00114E] dark:placeholder:text-[#C9CFE5] placeholder:text-white bg-primary rounded-sm px-2 md:px-3 py-1 w-full md:w-[60%]"
              placeholder="Enter quantity"
            />
          </div>
          <button
            className="bg-primary w-full text-white rounded-md py-1.5 md:py-2 mt-4 md:mt-10"
            onClick={handleAddTradeSubmit}
          >
            Submit
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showDateRange}
        onClose={() => setShowDateRange(false)}
        title="Select Date Range"
      >
        <div className="flex flex-col gap-4 md:gap-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full">
            <p className="text-sm md:text-lg font-normal mb-2 md:mb-0 ">
              Select Date Range* :
            </p>
            <div className="flex items-center gap-2">
              <div
                className="text-sm md:text-base cursor-pointer "
                onClick={() => setDateRangeType("long")}
              >
                Long
              </div>
              <div
                onClick={() =>
                  setDateRangeType(() =>
                    dateRangeType === "short" ? "long" : "short"
                  )
                }
                className="w-12 md:w-14 h-5 md:h-6 dark:bg-[#00114E] bg-primary-light rounded-[5px] flex items-center p-1 cursor-pointer transition-all"
              >
                <div
                  className={`w-5 md:w-6 h-5 md:h-6 bg-primary rounded-[5px] shadow-md transform transition-all ${
                    dateRangeType === "short"
                      ? "translate-x-6 md:translate-x-8"
                      : ""
                  }`}
                />
              </div>
              <div
                className="text-sm md:text-base cursor-pointer "
                onClick={() => setDateRangeType("short")}
              >
                Short
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full">
            <p className="text-sm md:text-lg font-normal mb-2 md:mb-0 ">
              Entry Date & Time* :
            </p>
            <input
              ref={startInputRef}
              type="date"
              value={formatDateForInput(tempDates.startDate)}
              onChange={(e) => handleDateChange(e, "start")}
              onClick={() => handleInputClick(startInputRef)}
              className="dark:bg-[#00114E] bg-primary rounded-sm px-2 md:px-3 py-1 w-full md:w-[60%] "
            />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full">
            <p className="text-sm md:text-lg font-normal mb-2 md:mb-0 ">
              Exit Date & Time* :
            </p>
            <input
              ref={endInputRef}
              type="date"
              value={formatDateForInput(tempDates?.endDate)}
              onChange={(e) => handleDateChange(e, "end")}
              onClick={() => handleInputClick(endInputRef)}
              className="dark:bg-[#00114E] bg-primary rounded-sm px-2 md:px-3 py-1 w-full md:w-[60%] "
            />
          </div>
          <button
            className="bg-primary w-full text-white rounded-md py-1.5 md:py-2 mt-4 md:mt-10"
            onClick={handleApply}
          >
            Apply
          </button>
        </div>
      </Modal>

      <section className="dark:bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px rounded-md">
        <div className="dark:bg-db-primary bg-primary-light rounded-md p-2 md:p-2.5">
          <CalendarGrid
            setSelectedDate={setSelectedDate}
            selectedDateRange={[dateRange]}
            tradeData={addedTrades}
            holidays={holidays}
            isSubscribed={isSubscribed}
          />

          <div className="my-2 md:my-2.5 ">
            <section className="lg:col-span-2 dark:bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px rounded-md">
              <div className="dark:bg-db-secondary bg-[#EEEEEE] rounded-md p-2 md:p-2.5">
                <h5 className="font-normal text-xl md:text-2xl text-center mb-4 md:mb-6">
                  Statistics
                </h5>
                {!isSubscribed ? (
                  <Lock />
                ) : (
                  <div className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-2 md:gap-5 w-full md:w-[90%] mx-auto mb-4 md:mb-5">
                    {[
                      "Total P&L",
                      "Total Trades",
                      "Biggest Win",
                      "Biggest Loss",
                      "Avg. Winner",
                      "Avg. Loser",
                      "Risk to Reward",
                      "Avg. P&L",
                    ].map((stat, index) => (
                      <div
                        key={stat}
                        className={`dark:bg-db-primary bg-[#E2E2E2] flex flex-col items-center rounded-md px-2 md:px-4 py-3 md:py-5 ${
                          index >= 4 ? "sm:col-span-2" : ""
                        }`}
                      >
                        <p className="flex items-center gap-2 md:gap-3">
                          <p className="text-xs md:text-sm">{stat}</p>
                          <FaInfoCircle />
                        </p>
                        <p className="text-sm md:text-base">
                          {stat === "Total P&L"
                            ? data.summary?.totalProfitLoss
                            : stat === "Total Trades"
                            ? data.summary?.totalTrade
                            : stat === "Biggest Win"
                            ? data.summary?.maxPL
                            : stat === "Biggest Loss"
                            ? data.summary?.minPL
                            : stat === "Avg. Winner"
                            ? data.summary?.avgW
                            : stat === "Avg. Loser"
                            ? data.summary?.avgL
                            : stat === "Risk to Reward"
                            ? data.summary?.riskToReward
                            : stat === "Avg. P&L"
                            ? data.summary?.averagePL
                            : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="grid md:grid-cols-2 grid-cols-1 gap-2 md:gap-2.5 ">
            <section className="bg-[#000A2D] not-dark:bg-[#EEEEEE] p-px rounded-md">
              <div className="rounded-md p-2 md:p-2.5">
                <h5 className="font-normal text-xl md:text-2xl text-center mb-4 md:mb-6">
                  Top Winner
                </h5>
                <div className="grid md:grid-cols-3 grid-cols-1 gap-2 md:gap-5 w-full md:w-[90%] mx-auto mb-4 md:mb-5">
                  {!isSubscribed ? (
                    <Lock />
                  ) : (
                    data?.topWinnersLosers?.top3Winners.map((data, index) => (
                      <div
                        key={index}
                        className="dark:bg-db-primary bg-[#E2E2E2] flex flex-col items-center rounded-md px-2 md:px-4 py-3 md:py-5 gap-1 md:gap-2"
                      >
                        <p className="text-xs md:text-sm">Winner {index + 1}</p>
                        <p className="text-sm md:text-base">{data.symbol}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="bg-[#000A2D] not-dark:bg-[#EEEEEE] p-px rounded-md ">
              <div className="rounded-md p-2 md:p-2.5">
                <h5 className="font-normal text-xl md:text-2xl text-center mb-4 md:mb-6">
                  Top Loser
                </h5>
                <div className="grid md:grid-cols-3 grid-cols-1 gap-2 md:gap-5 w-full md:w-[90%] mx-auto mb-4 md:mb-5">
                  {!isSubscribed ? (
                    <Lock />
                  ) : (
                    data?.topWinnersLosers?.top3Losers.map((data, index) => (
                      <div
                        key={index}
                        className="bg-db-primary not-dark:bg-[#E2E2E2] flex flex-col items-center rounded-md px-2 md:px-4 py-3 md:py-5 gap-1 md:gap-2"
                      >
                        <p className="text-xs md:text-sm">Loser {index + 1}</p>
                        <p className="text-sm md:text-base">{data.symbol}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TradingJournal;
