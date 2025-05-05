import React from "react";
import clsx from "clsx";
import { Tooltip } from "react-tooltip";

const CalendarGrid = ({ setSelectedDate, selectedDateRange, tradeData }) => {
  const startDate = selectedDateRange?.[0]?.startDate || new Date();
  const endDate = selectedDateRange?.[0]?.endDate || new Date();

  console.log("tradeData", tradeData);
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  const startMonth = startDate.getMonth() + 1;
  const endMonth = endDate.getMonth() + 1;

  const monthsToShow = [];
  let currentYear = startYear;
  let currentMonth = startMonth;

  while (
    currentYear < endYear ||
    (currentYear === endYear && currentMonth <= endMonth)
  ) {
    monthsToShow.push({ month: currentMonth, year: currentYear });
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  if (monthsToShow.length > 12) {
    monthsToShow.length = 12;
  }

  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
  const getStartDayIndex = (year, month) =>
    new Date(year, month - 1, 1).getDay();

  const getColor = (value) => {
    if (value > 10) return "bg-green-900";
    if (value > 5) return "bg-green-600";
    if (value > 0) return "bg-green-300";
    if (value === 0) return "bg-gray-200";
    if (value < -5) return "bg-red-900";
    if (value < -10) return "bg-red-600";
    return "bg-red-300";
  };

  const generateMonthData = (year, month) => {
    const totalDays = getDaysInMonth(year, month);
    const startDay = getStartDayIndex(year, month);
    const data = [];
    let currentColumn = 0;
    let currentRow = (startDay + 6) % 7;

    for (let i = 1; i <= totalDays; i++) {
      if (currentRow === 0) {
        currentColumn++;
      }

      const dateString = `${year}-${String(month).padStart(2, "0")}-${String(
        i
      ).padStart(2, "0")}`;

      // Find all trades for this specific date
      const tradesForDate =
        tradeData?.filter((t) => {
          const entryDate = new Date(t.entryDate).toISOString().split("T")[0];
          return entryDate === dateString;
        }) || [];

      // console.log("tradesForDate", tradesForDate);
      // Sum up total profit/loss for the day if multiple trades exist
      const totalValue = tradesForDate.reduce(
        (sum, t) => sum + t.totalProfitOrLoss,
        0
      );

      // console.log("totalValue", totalValue);
      data.push({
        date: dateString,
        value: totalValue,
        profitLossPercentage: tradesForDate.profitLossPercentage,
        trades: tradesForDate, // Store all trades for tooltip
        column: currentColumn,
        row: currentRow,
      });

      currentRow = (currentRow + 1) % 7;
    }

    return data;
  };

  const monthData = monthsToShow.map(({ month, year }) =>
    generateMonthData(year, month)
  );

  const handleDateClick = (date) => {
    const selected = new Date(date);
    setSelectedDate({
      day: selected.getDate(),
      month: selected.toLocaleString("default", { month: "long" }),
      year: selected.getFullYear(),
    });
  };

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const totalColumns = 13;
  const emptyColumns = totalColumns - monthsToShow.length - 1;

  return (
    <section className="bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px rounded-md">
      <div className="p-5 dark:bg-db-secondary bg-db-secondary-light text-white">
        <p className="text-lg font-light inline-block">Tradebook</p>
        <div className="flex flex-col items-center">
          <h2 className="text-center text-lg font-bold text-primary mb-6">
            Please Select The Range To See The Data
          </h2>
          <div className="overflow-x-auto w-full">
            <div className="grid grid-cols-13 sm:gap-x-5 gap-x-3 min-w-max">
              <div></div>
              {monthsToShow.map(({ month, year }, index) => (
                <div
                  key={index}
                  className="text-center font-bold text-xs mb-5 text-white"
                >
                  {new Date(year, month - 1, 1).toLocaleString("default", {
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              ))}
              {Array(emptyColumns)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="text-center font-bold text-xs mb-5 text-white"
                  ></div>
                ))}
              {daysOfWeek.map((day, rowIndex) => (
                <>
                  <div
                    key={day}
                    className={`font-bold text-[10px] ${
                      ["Tue", "Thu", "Sat"].includes(day)
                        ? "text-transparent"
                        : "text-white"
                    }`}
                  >
                    {day}
                  </div>
                  {monthsToShow.map((_, monthIndex) => {
                    const monthEntries = monthData[monthIndex]
                      .filter((entry) => entry.row === rowIndex)
                      .sort((a, b) => a.column - b.column);

                    const maxColumns = Math.max(
                      ...monthData[monthIndex].map((entry) => entry.column)
                    );
                    const rowSlots = [];

                    for (let col = 0; col <= maxColumns; col++) {
                      const entry = monthEntries.find(
                        (entry) => entry.column === col
                      );
                      rowSlots.push(entry || null);
                    }

                    const limitedSlots = rowSlots.slice(0, 6);

                    return (
                      <div key={monthIndex} className="flex gap-1">
                        {limitedSlots.map((entry, index) =>
                          entry ? (
                            <div
                              key={index}
                              className={clsx(
                                "w-2 h-2 flex justify-center mt-1 font-bold cursor-pointer",
                                getColor(entry.value)
                              )}
                              data-tooltip-id={entry.date}
                              onClick={() => handleDateClick(entry.date)}
                            >
                              <Tooltip id={entry.date} place="top">
                                {entry.date}
                                <br />
                                {entry.trades.length > 0
                                  ? entry.trades.map((trade, idx) => (
                                      <div key={idx}>
                                        {trade.symbol}:{" "}
                                        {trade.totalProfitOrLoss > 0
                                          ? `Profit: ₹${trade.totalProfitOrLoss}`
                                          : trade.totalProfitOrLoss < 0
                                          ? `Loss: ₹${Math.abs(
                                              trade.totalProfitOrLoss
                                            )}`
                                          : "Neutral"}
                                      </div>
                                    ))
                                  : "No trades"}
                                {entry.trades.length > 1 && (
                                  <div>
                                    Total: ₹{entry.value > 0 ? "+" : ""}
                                    {entry.value}
                                  </div>
                                )}
                              </Tooltip>
                            </div>
                          ) : (
                            <div
                              key={index}
                              className="w-2 h-2 bg-transparent"
                            ></div>
                          )
                        )}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-5 justify-start">
          <div className="text-[10px] font-medium">Max Loss</div>
          <div className="bg-[#C62828] w-2 h-2 rounded-[2px]"></div>
          <div className="bg-[#E53935] w-2 h-2 rounded-[2px]"></div>
          <div className="bg-[#EF9A9A] w-2 h-2 rounded-[2px]"></div>
          <div className="bg-[#A5D6A7] w-2 h-2 rounded-[2px]"></div>
          <div className="bg-[#33D026] w-2 h-2 rounded-[2px]"></div>
          <div className="bg-[#4CAF50] w-2 h-2 rounded-[2px]"></div>
          <div className="text-[10px] font-medium">Max Profit</div>
        </div>
      </div>
    </section>
  );
};

export default CalendarGrid;
