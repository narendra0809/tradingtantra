// /* eslint-disable react-hooks/rules-of-hooks */
// /* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable react/prop-types */

// import { useEffect, useState } from "react";
// import Slider from "rc-slider";
// import "rc-slider/assets/index.css";
// import { useMediaQuery } from "react-responsive";

// const TimeRangeSlider = ({ getDataByIndexAndExpiry, isSubscribed }) => {
//   const isMobile = useMediaQuery({ maxWidth: 767 });
//   const minTime = 9.25; // 9:15 AM
//   const maxTime = 15.5; // 3:30 PM
//   const smallStep = 0.05;
//   const labelStep = 0.75;

//   const getRoundedTime = () => {
//     const now = new Date();
//     const hours = now.getHours();
//     const minutes = Math.floor(now.getMinutes() / 3) * 3;
//     const decimalTime = parseFloat((hours + minutes / 60).toFixed(2));

//     // Define trading hours (9:15 AM to 3:30 PM IST)
//     const marketOpen = 9.25; // 9:15 AM
//     const marketClose = 15.5; // 3:30 PM

//     // Get current day and time
//     const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
//     const isWeekday = currentDay >= 1 && currentDay <= 5; // Monday to Friday

//     // If current time is after market close or on a non-trading day, return maxTime (3:30 PM)
//     if (!isWeekday || decimalTime > marketClose) {
//       return maxTime;
//     }

//     // If before market open on a trading day, return maxTime (to show previous day's data)
//     if (isWeekday && decimalTime < marketOpen) {
//       return maxTime;
//     }

//     // During trading hours, return the current rounded time
//     return Math.min(decimalTime, maxTime);
//   };

//   const [currentTime, setCurrentTime] = useState(getRoundedTime());
//   const [range, setRange] = useState([minTime, currentTime]);

//   const timeLabels = [];
//   let currTime = minTime;
//   while (currTime <= maxTime) {
//     timeLabels.push(parseFloat(currTime.toFixed(2)));
//     currTime += labelStep;
//   }
//   if (timeLabels[timeLabels.length - 1] < maxTime) {
//     timeLabels.push(maxTime);
//   }

//   const formatTime = (decimalTime) => {
//     if (!decimalTime && decimalTime !== 0) return "";
//     const hours = Math.floor(decimalTime);
//     const minutes = Math.round((decimalTime - hours) * 60);
//     return `${hours}:${minutes.toString().padStart(2, "0")}`;
//   };

//   const formatRange = (val) => {
//     if (!val || !Array.isArray(val)) return "";
//     return `${formatTime(val[0])}-${formatTime(val[1])}`;
//   };

//   useEffect(() => {
//     const initialRange = formatRange(range);
//     if (initialRange && isSubscribed) {
//       getDataByIndexAndExpiry(initialRange);
//     }
//   }, [isSubscribed]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const roundedTime = getRoundedTime();
//       setCurrentTime(roundedTime);
//       setRange((prevRange) => {
//         const adjusted = [...prevRange];
//         if (adjusted[1] > roundedTime) adjusted[1] = roundedTime;
//         if (adjusted[0] > roundedTime) adjusted[0] = roundedTime;
//         return adjusted;
//       });
//     }, 5 * 60 * 1000); // Update every 5 minutes

//     return () => clearInterval(interval);
//   }, []);

//   const trackStyle = {
//     backgroundColor: "#0357F5",
//     height: 6,
//   };

//   const railStyle = {
//     background: `linear-gradient(to right, white 0%, white ${
//       ((currentTime - minTime) / (maxTime - minTime)) * 100
//     }%, #4B5563 ${
//       ((currentTime - minTime) / (maxTime - minTime)) * 100
//     }%, #4B5563 100%)`,
//     height: 6,
//   };

//   const handleStyle = {
//     backgroundColor: "#ffffff",
//     borderColor: "blue",
//     width: 18,
//     height: 18,
//   };

//   const handleChange = (val) => {
//     const adjustedRange = val.map((v) => parseFloat(v.toFixed(2)));
//     if (adjustedRange[1] > currentTime) adjustedRange[1] = currentTime;
//     if (adjustedRange[0] > currentTime) adjustedRange[0] = currentTime;
//     setRange(adjustedRange);
//   };

//   const handleGoClick = () => {
//     if (!isSubscribed) {
//       alert("Please subscribe to access this feature.");
//       return;
//     }
//     const newRange = formatRange(range);
//     if (newRange) {
//       getDataByIndexAndExpiry(newRange);
//     }
//   };

//   return (
//     <div className="flex md:flex-row flex-col gap-4 items-center mt-5 w-full">
//       <div className="dark:bg-gradient-to-br from-[#0108B1] to-[#02000E] w-full p-px rounded-lg">
//         <div className="w-full p-4 dark:bg-db-primary bg-primary-light rounded-lg">
//           <div className="relative">
//             <div
//               className={`absolute -top-8 ${
//                 isMobile && "right-32 scale-[1.1] m-1"
//               }`}
//               style={{
//                 left:
//                   !isMobile &&
//                   `${((range[1] - minTime) / (maxTime - minTime)) * 100}%`,
//                 transform: !isMobile && "translateX(-20%)",
//               }}
//             >
//               <div className="bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
//                 {formatRange(range)}
//               </div>
//             </div>

//             <Slider
//               range
//               min={minTime}
//               max={maxTime}
//               step={smallStep}
//               value={range}
//               onChange={handleChange}
//               trackStyle={[trackStyle]}
//               handleStyle={[handleStyle, handleStyle]}
//               railStyle={railStyle}
//               pushable={true}
//             />
//           </div>

//           <div className="relative mt-4 flex justify-between dark:text-gray-50 text-xs">
//             {timeLabels.map((time, index) => (
//               <div key={index} className="flex flex-col items-center">
//                 <div
//                   className={`w-px h-4 ${
//                     time <= currentTime
//                       ? "dark:bg-gray-50 bg-gray-900"
//                       : "bg-gray-500"
//                   }`}
//                 ></div>
//                 <span
//                   className={`mt-1 ${
//                     time <= currentTime ? "" : "text-gray-500"
//                   }`}
//                 >
//                   {formatTime(time)}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <button
//         onClick={handleGoClick}
//         disabled={!isSubscribed}
//         className={`${
//           isSubscribed
//             ? "bg-[#0E5FF6] hover:bg-[#0b4cd1]"
//             : "bg-gray-500 cursor-not-allowed"
//         } text-white md:px-6 md:py-8 px-5 py-2 rounded-lg transition-colors`}
//       >
//         Go
//       </button>
//     </div>
//   );
// };

// export default TimeRangeSlider;

/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

import { useEffect, useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useMediaQuery } from "react-responsive";
import { useRef } from "react";
import { useCallback } from "react";

const TimeRangeSlider = ({
  onTimeRangeChange,
  selectedTimeRange,
  isSubscribed,
  disabled,
}) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const minTime = 9.25;
  const maxTime = 15.5;
  const smallStep = 0.05;
  const labelStep = 0.75;

  const getRoundedTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = Math.floor(now.getMinutes() / 3) * 3;
    const decimalTime = parseFloat((hours + minutes / 60).toFixed(2));

    const marketOpen = 9.25;
    const marketClose = 15.5;
    const currentDay = now.getDay();
    const isWeekday = currentDay >= 1 && currentDay <= 5;

    if (!isWeekday || decimalTime > marketClose) {
      return maxTime;
    }
    if (isWeekday && decimalTime < marketOpen) {
      return maxTime;
    }
    return Math.min(decimalTime, maxTime);
  };

  const [currentTime, setCurrentTime] = useState(getRoundedTime());
  const [range, setRange] = useState([minTime, currentTime]);
  const [, setDebouncedRange] = useState(range);
  const debounceTimeoutRef = useRef(null);

  const debouncedHandleChange = useCallback(
    (newRangeStr) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        if (onTimeRangeChange && newRangeStr) {
          onTimeRangeChange(newRangeStr);
        }
      }, 700);
    },
    [onTimeRangeChange]
  );

  const parseTimeToDecimal = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours + (minutes || 0) / 60;
  };

  const formatTime = (decimalTime) => {
    if (!decimalTime && decimalTime !== 0) return "";
    const hours = Math.floor(decimalTime);
    const minutes = Math.round((decimalTime - hours) * 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  const getInitialRange = () => {
    if (selectedTimeRange) {
      const [startStr, endStr] = selectedTimeRange.split("-");
      const startTime = parseTimeToDecimal(startStr);
      const endTime = parseTimeToDecimal(endStr);
      return [
        Math.max(minTime, startTime || minTime),
        Math.min(maxTime, endTime || maxTime),
      ];
    }
    return [minTime, currentTime];
  };

  const formatRange = (val) => {
    if (!val || !Array.isArray(val)) return "";
    return `${formatTime(val[0])}-${formatTime(val[1])}`;
  };

  const timeLabels = [];
  let currTime = minTime;
  while (currTime <= maxTime) {
    timeLabels.push(parseFloat(currTime.toFixed(2)));
    currTime += labelStep;
  }
  if (timeLabels[timeLabels.length - 1] < maxTime) {
    timeLabels.push(maxTime);
  }

  const trackStyle = {
    backgroundColor: "#0357F5",
    height: 6,
  };

  const railStyle = {
    background: `linear-gradient(to right, white 0%, white ${
      ((currentTime - minTime) / (maxTime - minTime)) * 100
    }%, #4B5563 ${
      ((currentTime - minTime) / (maxTime - minTime)) * 100
    }%, #4B5563 100%)`,
    height: 6,
  };

  const handleStyle = {
    backgroundColor: "#ffffff",
    borderColor: "#0357F5",
    borderWidth: 2,
    width: 18,
    height: 18,
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  };

  const handleChange = (val) => {
    const adjustedRange = val.map((v) => parseFloat(v.toFixed(2)));

    // Clamp to valid bounds
    adjustedRange[0] = Math.max(minTime, adjustedRange[0]);
    adjustedRange[1] = Math.min(maxTime, adjustedRange[1]);
    adjustedRange[1] = Math.min(adjustedRange[1], currentTime);
    adjustedRange[0] = Math.min(adjustedRange[0], adjustedRange[1]);

    setRange(adjustedRange);

    // Update debounced range for API call
    setDebouncedRange(adjustedRange);

    // Debounce API call
    const newRangeStr = formatRange(adjustedRange);
    debouncedHandleChange(newRangeStr);
  };

  const isSliderDisabled = disabled || !isSubscribed;

  useEffect(() => {
    setDebouncedRange(range);
  }, [range]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedTimeRange) {
      const newRange = getInitialRange();
      setRange(newRange);
    }
  }, [selectedTimeRange]);

  useEffect(() => {
    const interval = setInterval(() => {
      const roundedTime = getRoundedTime();
      setCurrentTime(roundedTime);
      setRange((prevRange) => {
        const adjusted = [...prevRange];
        if (adjusted[1] > roundedTime) adjusted[1] = roundedTime;
        if (adjusted[0] > roundedTime) adjusted[0] = roundedTime;
        return adjusted;
      });
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex md:flex-row flex-col gap-6 items-center w-full">
      <div className="flex-1 w-full">
        <div className="dark:bg-gradient-to-br from-[#0108B1] to-[#02000E] p-px rounded-xl">
          <div className="w-full p-6 dark:bg-db-primary bg-primary-light rounded-xl">
            {/* Slider */}
            <div className="relative">
              <div
                className={`absolute -top-10 transition-all duration-200 ${
                  isMobile ? "right-32 scale-[1.1]" : ""
                }`}
                style={{
                  left: isMobile
                    ? "auto"
                    : (() => {
                        const percent =
                          ((range[1] - minTime) / (maxTime - minTime)) * 100;
                        if (percent < 5) return "5%";
                        if (percent > 95) return "95%";
                        return `${percent}%`;
                      })(),
                  transform: isMobile
                    ? "none"
                    : (() => {
                        const percent =
                          ((range[1] - minTime) / (maxTime - minTime)) * 100;
                        if (percent < 5) return "translateX(0%)";
                        if (percent > 95) return "translateX(-100%)";
                        return "translateX(-50%)";
                      })(),
                }}
              >
                <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-md border border-gray-700 whitespace-nowrap">
                  {formatRange(range)}
                </div>
              </div>

              <Slider
                range
                min={minTime}
                max={maxTime}
                step={smallStep}
                value={range}
                onChange={handleChange}
                trackStyle={[trackStyle]}
                handleStyle={[handleStyle, handleStyle]}
                railStyle={railStyle}
                pushable={true}
                disabled={isSliderDisabled}
              />
            </div>

            {/* Time Labels */}
            <div className="relative mt-8 flex justify-between dark:text-gray-300 text-gray-700 text-xs">
              {timeLabels.map((time, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-px h-4 transition-colors ${
                      time <= currentTime
                        ? "dark:bg-emerald-400 bg-emerald-500"
                        : "bg-gray-400"
                    }`}
                  />
                  <span
                    className={`mt-2 font-mono ${
                      time <= currentTime
                        ? "text-emerald-400 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {formatTime(time)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {!isSubscribed && (
        <div className="text-center text-sm text-gray-500">
          <p>🔒 Subscribe to use Time Range Slider</p>
        </div>
      )}
    </div>
  );
};

export default TimeRangeSlider;
