/* eslint-disable react-hooks/rules-of-hooks */
// /* eslint-disable react-hooks/rules-of-hooks */
// /* eslint-disable react/prop-types */

// import { useEffect, useState } from "react";
// import Slider from "rc-slider";
// import "rc-slider/assets/index.css";
// import { useMediaQuery } from "react-responsive";

// const TimeRangeSlider = ({ getDataByIndexAndExpiry, setTime }) => {
//   const isMobile = useMediaQuery({ maxWidth: 786 });
//   const minTime = 9.25;
//   const maxTime = 15.5;
//   const smallStep = 0.05;
//   const labelStep = 0.75;

//   const getRoundedTime = () => {
//     const now = new Date();
//     const hours = now.getHours();
//     const minutes = Math.floor(now.getMinutes() / 3) * 3;
//     return parseFloat((hours + minutes / 60).toFixed(2));
//   };

//   const [currentTime, setCurrentTime] = useState(getRoundedTime());
//   const [range, setRange] = useState([minTime, minTime]);

//   const timeLabels = [];
//   let currTime = minTime;
//   while (currTime <= maxTime) {
//     timeLabels.push(parseFloat(currTime.toFixed(2)));
//     currTime += labelStep;
//   }
//   if (timeLabels[timeLabels.length - 1] < maxTime) {
//     timeLabels.push(maxTime);
//   }

//   // Format time as HH:MM
//   const formatTime = (decimalTime) => {
//     const hours = Math.floor(decimalTime);
//     const minutes = Math.round((decimalTime - hours) * 60);
//     return `${hours}:${minutes.toString().padStart(2, "0")}`;
//   };

//   const formatRange = (val) => {
//     if (!val) return "";
//     if (Array.isArray(val)) {
//       return `${formatTime(val[0])} - ${formatTime(val[1])}`;
//     }
//     return formatTime(val);
//   };

//   useEffect(() => {
//     setTime(formatTime(currentTime));
//     getDataByIndexAndExpiry(formatRange(range));
//   }, []);

//   // Update current time every 3 minutes
//   useEffect(() => {
//     const interval = setInterval(() => {
//       const roundedTime = getRoundedTime();
//       console.log(
//         "Interval fired at",
//         new Date().toLocaleTimeString(),
//         "New currentTime:",
//         roundedTime
//       );
//       setCurrentTime(roundedTime);
//       // Adjust range if it exceeds new currentTime
//       setRange((prevRange) => {
//         const adjusted = [...prevRange];
//         if (adjusted[1] > roundedTime) adjusted[1] = roundedTime;
//         if (adjusted[0] > roundedTime) adjusted[0] = roundedTime;
//         return adjusted;
//       });
//     }, 3 * 60 * 1000);

//     return () => clearInterval(interval);
//   }, []);

//   // useEffect(() => {
//   //   console.log("currentTime updated to:", currentTime);
//   // }, [currentTime]);

//   // Styles
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
//     backgroundColor: "white",
//     borderColor: "blue",
//     width: 18,
//     height: 18,
//   };

//   // Prevent selection beyond currentTime
//   const handleChange = (val) => {
//     const adjustedRange = val.map((v) => parseFloat(v.toFixed(2)));
//     if (adjustedRange[1] > currentTime) {
//       adjustedRange[1] = currentTime;
//     }
//     if (adjustedRange[0] > currentTime) {
//       adjustedRange[0] = currentTime;
//     }
//     setRange(adjustedRange);
//   };

//   // Log rendering for debugging
//   console.log(
//     "Rendering with currentTime:",
//     currentTime,
//     "railStyle:",
//     railStyle.background
//   );

//   return (
//     <div className="flex md:flex-row flex-col gap-4 items-center mt-5 w-full">
//       <div className="dark:bg-gradient-to-br from-[#0108B1] to-[#02000E] w-full p-px rounded-lg">
//         <div className="w-full p-4 dark:bg-db-primary bg-db-primary rounded-lg">
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
//         onClick={() => getDataByIndexAndExpiry(formatRange(range))}
//         className="bg-[#0E5FF6] text-white md:px-6 md:py-8 px-5 py-2 rounded-lg"
//       >
//         Go
//       </button>
//     </div>
//   );
// };

// export default TimeRangeSlider;

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

import { useEffect, useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useMediaQuery } from "react-responsive";

const TimeRangeSlider = ({ getDataByIndexAndExpiry }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const minTime = 9.25;
  const maxTime = 15.5;
  const smallStep = 0.05;
  const labelStep = 0.75;

  const getRoundedTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = Math.floor(now.getMinutes() / 5) * 5;
    const decimalTime = parseFloat((hours + minutes / 60).toFixed(2));
    // Cap time at maxTime (3:30 PM) if after market hours
    return Math.min(decimalTime, maxTime);
  };

  const [currentTime, setCurrentTime] = useState(getRoundedTime());
  const [range, setRange] = useState([minTime, getRoundedTime()]);

  const timeLabels = [];
  let currTime = minTime;
  while (currTime <= maxTime) {
    timeLabels.push(parseFloat(currTime.toFixed(2)));
    currTime += labelStep;
  }
  if (timeLabels[timeLabels.length - 1] < maxTime) {
    timeLabels.push(maxTime);
  }

  const formatTime = (decimalTime) => {
    if (!decimalTime && decimalTime !== 0) return "";
    const hours = Math.floor(decimalTime);
    const minutes = Math.round((decimalTime - hours) * 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  const formatRange = (val) => {
    if (!val || !Array.isArray(val)) return "";
    return `${formatTime(val[0])}-${formatTime(val[1])}`;
  };

  useEffect(() => {
    const initialRange = formatRange(range);
    if (initialRange) {
      getDataByIndexAndExpiry(initialRange);
    }
  }, []);

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
    }, 5 * 60 * 1000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

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
    borderColor: "blue",
    width: 18,
    height: 18,
  };

  const handleChange = (val) => {
    const adjustedRange = val.map((v) => parseFloat(v.toFixed(2)));
    if (adjustedRange[1] > currentTime) adjustedRange[1] = currentTime;
    if (adjustedRange[0] > currentTime) adjustedRange[0] = currentTime;
    setRange(adjustedRange);
    // setTime(formatTime(adjustedRange[1]));
    // const newRange = formatRange(adjustedRange);
    // if (newRange) {
    //   getDataByIndexAndExpiry(newRange);
    // }
  };

  return (
    <div className="flex md:flex-row flex-col gap-4 items-center mt-5 w-full">
      <div className="dark:bg-gradient-to-br from-[#0108B1] to-[#02000E] w-full p-px rounded-lg">
        <div className="w-full p-4 dark:bg-db-primary bg-db-primary rounded-lg">
          <div className="relative">
            <div
              className={`absolute -top-8 ${
                isMobile && "right-32 scale-[1.1] m-1"
              }`}
              style={{
                left:
                  !isMobile &&
                  `${((range[1] - minTime) / (maxTime - minTime)) * 100}%`,
                transform: !isMobile && "translateX(-20%)",
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
              onChange={handleChange}
              trackStyle={[trackStyle]}
              handleStyle={[handleStyle, handleStyle]}
              railStyle={railStyle}
              pushable={true}
            />
          </div>

          <div className="relative mt-4 flex justify-between dark:text-gray-50 text-xs">
            {timeLabels.map((time, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-px h-4 ${
                    time <= currentTime
                      ? "dark:bg-gray-50 bg-gray-900"
                      : "bg-gray-500"
                  }`}
                ></div>
                <span
                  className={`mt-1 ${
                    time <= currentTime ? "" : "text-gray-500"
                  }`}
                >
                  {formatTime(time)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          const newRange = formatRange(range);
          if (newRange) getDataByIndexAndExpiry(newRange);
        }}
        className="bg-[#0E5FF6] text-white md:px-6 md:py-8 px-5 py-2 rounded-lg"
      >
        Go
      </button>
    </div>
  );
};

export default TimeRangeSlider;
