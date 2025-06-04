// src/Components/Dashboard/TimeRangeButtons.js
import React, { useState, useEffect } from "react";
import { generateTimestamps } from "../../utils/generateTimestamps";

const TimeRangeButtons = ({ onTimeChange }) => {
  const [selectedTime, setSelectedTime] = useState("");
  const timestamps = generateTimestamps("2025-05-15");
  const currentTime = new Date("2025-05-15T17:55:00+05:30"); // 5:55 PM IST
  const marketClose = new Date("2025-05-15T15:30:00+05:30"); // 3:30 PM IST

  // Set default to latest available timestamp
  useEffect(() => {
    const latestValid = timestamps.reverse().find((ts) => {
      const tsDate = new Date(
        ts.replace(
          /(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{1,2}:\d{2}:\d{2} [AP]M)/,
          "$3-$1-$2 $4"
        )
      );
      return tsDate <= marketClose;
    });
    setSelectedTime(latestValid || "");
    onTimeChange(latestValid || "");
    timestamps.reverse(); // Restore order
  }, []);

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    onTimeChange(time);
  };

  return (
    <div className="mt-5 w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Select Time
      </label>
      <div className="flex flex-wrap gap-2 mt-2 max-h-40 overflow-y-auto p-4 dark:bg-gradient-to-br from-[#0108B1] to-[#02000E] bg-db-primary rounded-lg">
        {timestamps.map((time) => {
          const timeDate = new Date(
            time.replace(
              /(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{1,2}:\d{2}:\d{2} [AP]M)/,
              "$3-$1-$2 $4"
            )
          );
          const isDisabled = timeDate > marketClose;
          return (
            <button
              key={time}
              onClick={() => !isDisabled && handleTimeChange(time)}
              disabled={isDisabled}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                selectedTime === time
                  ? "bg-[#0E5FF6] text-white"
                  : isDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-white text-gray-900 hover:bg-[#0E5FF6] hover:text-white bg-[#000A2D] dark:text-gray-200 dark:hover:bg-[#0E5FF6]"
              }`}
            >
              {time.split(", ")[1].replace(":00 ", " ")} {/* e.g., "9:15 AM" */}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(TimeRangeButtons);
