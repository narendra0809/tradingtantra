import React, { useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const TimeRangeSlider = () => {
  const minTime = 9.00;
  const maxTime = 16.00;
  const step = 0.75; // 45-minute steps
  
  // Generate meter labels based on step
  const timeLabels = Array.from({ length: Math.round((maxTime - minTime) / step) + 1 }, (_, i) => 
    parseFloat((minTime + i * step).toFixed(2))
  );

  const [range, setRange] = useState([timeLabels[0], timeLabels[timeLabels.length - 1]]);

  // Convert decimal time to HH:MM format
  const formatTime = (decimalTime) => {
    let hours = Math.floor(decimalTime);
    let minutes = Math.round((decimalTime - hours) * 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex md:flex-row flex-col gap-4 items-center mt-5 w-full">
      {/* Slider Container */}
      <div className="dark:bg-gradient-to-br from-[#0108B1] to-[#02000E] w-full p-px rounded-lg">
        <div className="w-full p-4 dark:bg-db-primary bg-db-primary-light rounded-lg">
          <Slider
            range
            min={minTime}
            max={maxTime}
            step={step}
            value={range}
            onChange={(val) => {
              // Ensure values match the exact step values
              const adjustedRange = val.map(v => parseFloat(v.toFixed(2)));
              setRange(adjustedRange);
              console.log(adjustedRange);
            }}
            trackStyle={[{ backgroundColor: "#0357F5", height: 6 }]}
            handleStyle={[
              { backgroundColor: "white", borderColor: "blue", width: 18, height: 18 },
              { backgroundColor: "white", borderColor: "blue", width: 18, height: 18 },
            ]}
            railStyle={{ backgroundColor: "white", height: 6 }}
          />

          {/* Meter Scale */}
          <div className="relative mt-4 flex justify-between dark:text-gray-50 text-xs">
            {timeLabels.map((time, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-px h-4 dark:bg-gray-50 bg-gray-900"></div>
                <span className="mt-1">{formatTime(time)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Go Button */}
      <button className="bg-[#0E5FF6] text-white md:px-6 md:py-8 px-5 py-2 rounded-lg">
        Go
      </button>
    </div>
  );
};

export default TimeRangeSlider;
