// /* eslint-disable react/prop-types */
// import clsx from "clsx";
// import { Tooltip } from "react-tooltip";
// import Lock from "./Lock";
// import { useSelector } from "react-redux";

// const CalendarGrid = ({
//   setSelectedDate,
//   selectedDateRange,
//   tradeData,
//   isSubscribed,
// }) => {
//   const theme = useSelector((state) => state.theme.theme);
//   const startDate = selectedDateRange?.[0]?.startDate || new Date();
//   const endDate = selectedDateRange?.[0]?.endDate || new Date();

//   const startYear = startDate.getFullYear();
//   const endYear = endDate.getFullYear();
//   const startMonth = startDate.getMonth() + 1;
//   const endMonth = endDate.getMonth() + 1;

//   const monthsToShow = [];
//   let currentYear = startYear;
//   let currentMonth = startMonth;

//   while (
//     currentYear < endYear ||
//     (currentYear === endYear && currentMonth <= endMonth)
//   ) {
//     monthsToShow.push({ month: currentMonth, year: currentYear });
//     currentMonth++;
//     if (currentMonth > 12) {
//       currentMonth = 1;
//       currentYear++;
//     }
//   }

//   if (monthsToShow.length > 12) {
//     monthsToShow.length = 12;
//   }

//   const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
//   const getStartDayIndex = (year, month) =>
//     new Date(year, month - 1, 1).getDay();

//   const getColor = (value) => {
//     if (value > 10) return "bg-green-900";
//     if (value > 5) return "bg-green-600";
//     if (value > 0) return "bg-green-300";
//     if (value === 0) return theme === "dark" ? "bg-[#D9D9D9]" : "bg-[#000A2D]";
//     if (value < -5) return "bg-red-900";
//     if (value < -10) return "bg-red-600";
//     return "bg-red-300";
//   };

//   const generateMonthData = (year, month) => {
//     const totalDays = getDaysInMonth(year, month);
//     const startDay = getStartDayIndex(year, month);
//     const data = [];
//     let currentColumn = 0;
//     let currentRow = (startDay + 6) % 7;

//     for (let i = 1; i <= totalDays; i++) {
//       if (currentRow === 0) {
//         currentColumn++;
//       }

//       const dateString = `${year}-${String(month).padStart(2, "0")}-${String(
//         i
//       ).padStart(2, "0")}`;

//       // Find all trades for this specific date
//       const tradesForDate =
//         tradeData?.filter((t) => {
//           const entryDate = new Date(t.entryDate).toISOString().split("T")[0];
//           return entryDate === dateString;
//         }) || [];

//       // Find holiday for this specific date
//       // const holiday = holidays?.find(
//       //   (h) => new Date(h.date).toISOString().split("T")[0] === dateString
//       // );

//       // Sum up total profit/loss for the day if multiple trades exist
//       const totalValue = tradesForDate.reduce(
//         (sum, t) => sum + t.totalProfitOrLoss,
//         0
//       );

//       data.push({
//         date: dateString,
//         value: totalValue,
//         profitLossPercentage: tradesForDate.profitLossPercentage,
//         trades: tradesForDate,
//         // holiday: holiday || null, // Include holiday data
//         column: currentColumn,
//         row: currentRow,
//       });

//       currentRow = (currentRow + 1) % 7;
//     }

//     return data;
//   };

//   const monthData = monthsToShow.map(({ month, year }) =>
//     generateMonthData(year, month)
//   );

//   const handleDateClick = (date) => {
//     const selected = new Date(date);
//     setSelectedDate({
//       day: selected.getDate(),
//       month: selected.toLocaleString("default", { month: "long" }),
//       year: selected.getFullYear(),
//     });
//   };

//   const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
//   const totalColumns = 13;
//   const emptyColumns = totalColumns - monthsToShow.length - 1;

//   return (
//     <section className="dark:bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px rounded-md">
//       <div className="p-5 dark:bg-db-secondary bg-[#EEEEEE] ">
//         <p className="text-lg font-light inline-block">Tradebook</p>
//         {!isSubscribed ? (
//           <Lock />
//         ) : (
//           <div className="flex flex-col items-center">
//             <h2 className="text-center text-lg font-bold text-primary mb-6">
//               Please Select The Range To See The Data
//             </h2>
//             <div className="overflow-x-auto w-full">
//               <div className="grid grid-cols-13 sm:gap-x-5 gap-x-3 min-w-max">
//                 {monthsToShow.map(({ month, year }, index) => (
//                   <div
//                     key={index}
//                     className="text-center font-bold text-xs mb-5 "
//                   >
//                     {new Date(year, month - 1, 1).toLocaleString("default", {
//                       month: "short",
//                       year: "numeric",
//                     })}
//                   </div>
//                 ))}
//                 {Array(emptyColumns)
//                   .fill(null)
//                   .map((_, index) => (
//                     <div
//                       key={`empty-${index}`}
//                       className="text-center font-bold text-xs mb-5 "
//                     ></div>
//                   ))}
//                 {daysOfWeek.map((day, rowIndex) => (
//                   <>
//                     <div key={day} className={``}>
//                       {day}
//                     </div>
//                     {monthsToShow.map((_, monthIndex) => {
//                       const monthEntries = monthData[monthIndex]
//                         .filter((entry) => entry.row === rowIndex)
//                         .sort((a, b) => a.column - b.column);

//                       const maxColumns = Math.max(
//                         ...monthData[monthIndex].map((entry) => entry.column)
//                       );
//                       const rowSlots = [];

//                       for (let col = 0; col <= maxColumns; col++) {
//                         const entry = monthEntries.find(
//                           (entry) => entry.column === col
//                         );
//                         rowSlots.push(entry || null);
//                       }

//                       const limitedSlots = rowSlots.slice(0, 6);

//                       return (
//                         <div key={monthIndex} className="flex gap-1">
//                           {limitedSlots.map((entry, index) =>
//                             entry ? (
//                               <div
//                                 key={index}
//                                 className={clsx(
//                                   "w-4 h-4 flex justify-center mt-1 font-bold cursor-pointer",
//                                   entry.holiday
//                                     ? "bg-yellow-500"
//                                     : getColor(entry.value)
//                                 )}
//                                 data-tooltip-id={entry.date}
//                                 onClick={() => handleDateClick(entry.date)}
//                               >
//                                 <Tooltip id={entry.date} place="top">
//                                   {entry.date}
//                                   <br />
//                                   {entry.holiday ? (
//                                     <div>
//                                       <strong>
//                                         Holiday: {entry.holiday.description}
//                                       </strong>
//                                       <br />
//                                       Exchanges Closed:{" "}
//                                       {entry.holiday.closed_exchanges.join(
//                                         ", "
//                                       )}
//                                       <br />
//                                     </div>
//                                   ) : null}
//                                   {entry.trades.length > 0
//                                     ? entry.trades.map((trade, idx) => (
//                                         <div key={idx}>
//                                           {trade.symbol}:{" "}
//                                           {trade.totalProfitOrLoss > 0
//                                             ? `Profit: ₹${trade.totalProfitOrLoss}`
//                                             : trade.totalProfitOrLoss < 0
//                                             ? `Loss: ₹${Math.abs(
//                                                 trade.totalProfitOrLoss
//                                               )}`
//                                             : "Neutral"}
//                                         </div>
//                                       ))
//                                     : "No trades"}
//                                   {entry.trades.length > 1 && (
//                                     <div>
//                                       Total: ₹{entry.value > 0 ? "+" : ""}
//                                       {entry.value}
//                                     </div>
//                                   )}
//                                 </Tooltip>
//                               </div>
//                             ) : (
//                               <div
//                                 key={index}
//                                 className="w-2 h-2 bg-transparent"
//                               ></div>
//                             )
//                           )}
//                         </div>
//                       );
//                     })}
//                   </>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}
//         <div className="flex items-center gap-1 mt-5 justify-start">
//           <div className="text-[10px] font-medium">Max Loss</div>
//           <div className="bg-[#C62828] w-2 h-2 rounded-[2px]"></div>
//           <div className="bg-[#E53935] w-2 h-2 rounded-[2px]"></div>
//           <div className="bg-[#EF9A9A] w-2 h-2 rounded-[2px]"></div>
//           <div className="bg-[#A5D6A7] w-2 h-2 rounded-[2px]"></div>
//           <div className="bg-[#33D026] w-2 h-2 rounded-[2px]"></div>
//           <div className="bg-[#4CAF50] w-2 h-2 rounded-[2px]"></div>
//           <div className="text-[10px] font-medium">Max Profit</div>
//           {/* <div className="ml-4 text-[10px] font-medium">Holiday</div>
//           <div className="bg-yellow-500 w-2 h-2 rounded-[2px]"></div> */}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default CalendarGrid;

/* eslint-disable react/prop-types */
import clsx from "clsx";
import React from "react";
import { Tooltip } from "react-tooltip";
import Lock from "./Lock";
import { useSelector } from "react-redux";

const CalendarGrid = ({
  setSelectedDate,
  selectedDateRange,
  tradeData,
  isSubscribed,
}) => {
  const theme = useSelector((state) => state.theme.theme);
  const startDate = selectedDateRange?.[0]?.startDate || new Date();
  const endDate = selectedDateRange?.[0]?.endDate || new Date();

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
  // 0=Sun..6=Sat; convert to Mon..Sun -> 0..6
  const getStartDayIndex = (year, month) => {
    const jsDay = new Date(year, month - 1, 1).getDay(); // 0..6, Sun..Sat
    return (jsDay + 6) % 7; // 0..6, Mon..Sun
  };

  const getColor = (value) => {
    if (value > 10) return "bg-green-900";
    if (value > 5) return "bg-green-600";
    if (value > 0) return "bg-green-300";
    if (value === 0) return theme === "dark" ? "bg-[#D9D9D9]" : "bg-[#000A2D]";
    if (value < -10) return "bg-red-600";
    if (value < -5) return "bg-red-900";
    return "bg-red-300";
  };

  // Produce fixed 7 rows (Mon..Sun) and up to 6 week-columns
  const generateMonthData = (year, month) => {
    const totalDays = getDaysInMonth(year, month);
    const startDayOffset = getStartDayIndex(year, month); // 0..6 for Mon..Sun
    const data = [];

    for (let day = 1; day <= totalDays; day++) {
      const globalIndex = startDayOffset + (day - 1);
      const row = globalIndex % 7; // 0..6 maps to Mon..Sun rows
      const column = Math.floor(globalIndex / 7); // week index 0..5

      const dateString = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;

      const tradesForDate =
        tradeData?.filter((t) => {
          const entryDate = new Date(t.entryDate).toISOString().split("T")[0];
          return entryDate === dateString;
        }) || [];

      const totalValue = tradesForDate.reduce(
        (sum, t) => sum + t.totalProfitOrLoss,
        0
      );

      data.push({
        date: dateString,
        value: totalValue,
        trades: tradesForDate,
        column,
        row,
      });
    }

    // Ensure a 7 x 6 grid shape: rows 0..6, cols 0..5
    const grid = Array.from({ length: 7 }, () =>
      Array.from({ length: 6 }, () => null)
    );

    for (const entry of data) {
      if (entry.column >= 0 && entry.column < 6) {
        grid[entry.row][entry.column] = entry;
      }
    }

    return grid; // 7 rows, each with 6 columns
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

  return (
    <section className="dark:bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px rounded-md">
      <div className="p-5 dark:bg-db-secondary bg-[#EEEEEE] ">
        <p className="text-lg font-light inline-block">Tradebook</p>
        {!isSubscribed ? (
          <Lock />
        ) : (
          <div className="flex flex-col items-center">
            <h2 className="text-center text-lg font-bold text-primary mb-6">
              Please Select The Range To See The Data
            </h2>

            <div className="overflow-x-auto overflow-y-hidden w-full">
              <div
                className={`grid`}
                style={{
                  gridTemplateColumns: `120px repeat(${monthsToShow.length}, minmax(180px, 1fr))`,
                  columnGap: "1.25rem",
                }}
              >
                <div className="text-center font-bold text-xs mb-5" />
                {monthsToShow.map(({ month, year }, index) => (
                  <div
                    key={index}
                    className="text-center font-bold text-xs mb-5"
                  >
                    {new Date(year, month - 1, 1).toLocaleString("default", {
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                ))}

                {/* Body: 7 weekday rows; first column shows labels, next columns show month grids */}
                {daysOfWeek.map((day, rowIndex) => (
                  <React.Fragment key={day}>
                    {/* Weekday label column */}
                    <div className="h-full flex items-start pt-1 text-sm">
                      {day}
                    </div>

                    {/* Each month renders a fixed 6-column grid for weeks */}
                    {monthsToShow.map((_, monthIndex) => {
                      const rowSlots = monthData[monthIndex][rowIndex]; // array of 6 positions (can be null)

                      return (
                        <div
                          key={`${monthIndex}-${rowIndex}`}
                          className="grid gap-1"
                          style={{
                            gridTemplateColumns: "repeat(6, 1rem)",
                          }}
                        >
                          {rowSlots.map((entry, idx) =>
                            entry ? (
                              <div
                                key={idx}
                                className={clsx(
                                  "w-4 h-4 flex justify-center mt-1 font-bold cursor-pointer ",
                                  getColor(entry.value)
                                )}
                                data-tooltip-id={entry.date}
                                onClick={() => handleDateClick(entry.date)}
                              >
                                <Tooltip id={entry.date} place="top">
                                  {entry.date}
                                  <br />
                                  {entry.trades.length > 0
                                    ? entry.trades.map((trade, tIdx) => (
                                        <div key={tIdx}>
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
                                key={idx}
                                className="w-4 h-4 mt-1 bg-transparent"
                              />
                            )
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

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
