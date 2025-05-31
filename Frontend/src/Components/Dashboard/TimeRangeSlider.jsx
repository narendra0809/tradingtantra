/* eslint-disable react/prop-types */
// import { useState } from "react";
// import Slider from "rc-slider";
// import "rc-slider/assets/index.css";

// const TimeRangeSlider = () => {
//   const minTime = 9.25;
//   const maxTime = 16.0;
//   const step = 0.75; // 45-minute steps

//   // Generate meter labels based on step
//   const timeLabels = Array.from(
//     { length: Math.round((maxTime - minTime) / step) + 1 },
//     (_, i) => parseFloat((minTime + i * step).toFixed(2))
//   );

//   const [range, setRange] = useState([
//     timeLabels[0],
//     timeLabels[timeLabels.length - 1],
//   ]);

//   // Convert decimal time to HH:MM format
//   const formatTime = (decimalTime) => {
//     let hours = Math.floor(decimalTime);
//     let minutes = Math.round((decimalTime - hours) * 60);
//     return `${hours}:${minutes.toString().padStart(2, "0")}`;
//   };

//   return (
//     <div className="flex md:flex-row flex-col gap-4 items-center mt-5 w-full">
//       {/* Slider Container */}
//       <div className="dark:bg-gradient-to-br from-[#0108B1] to-[#02000E] w-full p-px rounded-lg">
//         <div className="w-full p-4 dark:bg-db-primary bg-db-primary-light rounded-lg">
//           <Slider
//             range
//             min={minTime}
//             max={maxTime}
//             step={step}
//             value={range}
//             onChange={(val) => {
//               // Ensure values match the exact step values
//               const adjustedRange = val.map((v) => parseFloat(v.toFixed(2)));
//               setRange(adjustedRange);
//               console.log(adjustedRange);
//             }}
//             trackStyle={[{ backgroundColor: "#0357F5", height: 6 }]}
//             handleStyle={[
//               {
//                 backgroundColor: "white",
//                 borderColor: "blue",
//                 width: 18,
//                 height: 18,
//               },
//               {
//                 backgroundColor: "white",
//                 borderColor: "blue",
//                 width: 18,
//                 height: 18,
//               },
//             ]}
//             railStyle={{ backgroundColor: "white", height: 6 }}
//           />

//           {/* Meter Scale */}
//           <div className="relative mt-4 flex justify-between dark:text-gray-50 text-xs">
//             {timeLabels.map((time, index) => (
//               <div key={index} className="flex flex-col items-center">
//                 <div className="w-px h-4 dark:bg-gray-50 bg-gray-900"></div>
//                 <span className="mt-1">{formatTime(time)}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Go Button */}
//       <button className="bg-[#0E5FF6] text-white md:px-6 md:py-8 px-5 py-2 rounded-lg">
//         Go
//       </button>
//     </div>
//   );
// };

// export default TimeRangeSlider;

import { useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const TimeRangeSlider = ({ getDataByIndexAndExpiry }) => {
  const minTime = 9.25; // 9:15 in decimal (9 + 15/60)
  const maxTime = 15.5; // 15:30 in decimal (15 + 30/60)
  const smallStep = 0.05; // 3-minute steps (3/60 = 0.05)
  const labelStep = 0.75; // 45-minute steps for labels

  // Generate all possible 3-minute interval values
  const allValues = Array.from(
    { length: Math.round((maxTime - minTime) / smallStep) + 1 },
    (_, i) => parseFloat((minTime + i * smallStep).toFixed(2))
  );

  // Generate meter labels - manually ensure we include 15:30
  const timeLabels = [];
  let currentTime = minTime;
  while (currentTime <= maxTime) {
    timeLabels.push(parseFloat(currentTime.toFixed(2)));
    currentTime += labelStep;
  }
  // Ensure maxTime is included even if it doesn't align perfectly with labelStep
  if (timeLabels[timeLabels.length - 1] < maxTime) {
    timeLabels.push(maxTime);
  }

  const [range, setRange] = useState([
    allValues[0],
    allValues[allValues.length - 1],
  ]);
  const [hoverValue, setHoverValue] = useState(null);

  // Convert decimal time to HH:MM format
  const formatTime = (decimalTime) => {
    const hours = Math.floor(decimalTime);
    const minutes = Math.round((decimalTime - hours) * 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  // Format range for display
  const formatRange = (val) => {
    if (!val) return "";
    if (Array.isArray(val)) {
      return `${formatTime(val[0])} - ${formatTime(val[1])}`;
    }
    return formatTime(val);
  };

  // Calculate position for the first handle's tooltip
  const calculateTooltipPosition = () => {
    const totalRange = maxTime - minTime;
    const position = ((range[0] - minTime) / totalRange) * 100;
    return Math.min(Math.max(position, 5), 95); // Keep within 5-95% to prevent overflow
  };

  return (
    <div className="flex md:flex-row flex-col gap-4 items-center mt-5 w-full">
      {/* Slider Container */}
      <div className="dark:bg-gradient-to-br from-[#0108B1] to-[#02000E] w-full p-px rounded-lg">
        <div className="w-full p-4 dark:bg-db-primary bg-db-primary-light rounded-lg">
          <div className="relative">
            {/* Selected interval display above first handle */}
            <div
              className="absolute -top-8"
              style={{
                left: `${calculateTooltipPosition()}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                {formatRange(range)}
              </div>
            </div>

            <Slider
              range
              min={minTime}
              max={maxTime}
              step={smallStep}
              value={range}
              onChange={(val) => {
                const adjustedRange = val.map((v) => parseFloat(v.toFixed(2)));
                setRange(adjustedRange);
              }}
              trackStyle={[{ backgroundColor: "#0357F5", height: 6 }]}
              handleStyle={[
                {
                  backgroundColor: "white",
                  borderColor: "blue",
                  width: 18,
                  height: 18,
                },
                {
                  backgroundColor: "white",
                  borderColor: "blue",
                  width: 18,
                  height: 18,
                },
              ]}
              railStyle={{ backgroundColor: "white", height: 6 }}
            />
          </div>

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
      <button
        onClick={() => getDataByIndexAndExpiry(formatRange(range))}
        className="bg-[#0E5FF6] text-white md:px-6 md:py-8 px-5 py-2 rounded-lg"
      >
        Go
      </button>
    </div>
  );
};

export default TimeRangeSlider;
