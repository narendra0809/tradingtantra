/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
// /* eslint-disable react/prop-types */
// import Chart from "react-apexcharts";
// import { useSelector } from "react-redux";

// const CandleChart = ({ candles }) => {
//   const theme = useSelector((state) => state.theme.theme);

//   // Generate enhanced dummy data with proper up/down candles and volume
//   const enhancedCandles = candles.map((candle) => {
//     const volume = candle.volume || Math.floor(Math.random() * 10000) + 5000; // Dummy volume
//     const isUp = candle.y[3] >= candle.y[0]; // close >= open

//     return {
//       ...candle,
//       x: new Date(candle.x),
//       y: [candle.y[0], candle.y[1], candle.y[2], candle.y[3]],
//       volume,
//       isUp,
//     };
//   });
//   console.log("Enchancde Candles  :", enhancedCandles);
//   const labelStyle = {
//     color: theme === "dark" ? "white" : "black",
//   };

//   const chartData = {
//     series: [
//       {
//         name: "Candlestick",
//         type: "candlestick",
//         data: enhancedCandles.map((candle) => ({
//           x: candle.x,
//           y: candle.y,
//         })),
//       },
//       {
//         name: "Volume",
//         type: "bar",
//         data: enhancedCandles.map((candle) => ({
//           x: candle.x,
//           y: candle.volume,
//           fillColor: candle.isUp
//             ? theme === "dark"
//               ? "#10B98133"
//               : "#05966933" // Shaded green for up
//             : theme === "dark"
//             ? "#EF444433"
//             : "#DC262633", // Shaded red for down
//         })),
//       },
//     ],
//     options: {
//       chart: {
//         height: 400,
//         type: "candlestick",
//         stacked: false,
//         zoom: {
//           enabled: true,
//           type: "x",
//           autoScaleYaxis: true,
//         },
//         pan: {
//           enabled: true,
//           type: "x",
//         },
//         toolbar: {
//           autoSelected: "zoom",
//         },
//         animations: {
//           enabled: true,
//           easing: "easeinout",
//           speed: 800,
//         },
//       },
//       title: {
//         text: "NIFTY Candlestick with Volume",
//         align: "left",
//         style: {
//           color: labelStyle.color,
//         },
//       },
//       xaxis: {
//         type: "datetime",
//         labels: {
//           style: { colors: labelStyle },
//           formatter: (val) => new Date(val).toLocaleTimeString(),
//         },
//         axisBorder: {
//           show: false, // Removed x-axis border
//         },
//         crosshairs: {
//           show: true,
//           position: "back",
//           stroke: {
//             color: theme === "dark" ? "#9CA3AF" : "#374151",
//             width: 1,
//             dashArray: 0,
//           },
//         },
//         tickPlacement: "between",
//         labelRotation: 0,
//         padding: {
//           left: 0,
//           right: 0,
//         },
//       },
//       yaxis: [
//         {
//           seriesName: "Candlestick",
//           opposite: true,
//           axisTicks: {
//             show: false, // Removed y-axis ticks
//           },
//           axisBorder: {
//             show: false, // Removed y-axis border
//           },
//           labels: {
//             style: { colors: labelStyle },
//             formatter: (val) => val.toFixed(2),
//           },
//           title: {
//             text: "Price",
//             style: {
//               color: labelStyle.color,
//             },
//           },
//           padding: {
//             left: 0,
//             right: 0,
//           },
//           forceNiceScale: true, // Ensures candles stay within bounds
//         },
//         {
//           seriesName: "Volume",
//           opposite: false,
//           axisTicks: {
//             show: false, // Removed y-axis ticks
//           },
//           axisBorder: {
//             show: false, // Removed y-axis border
//           },
//           labels: {
//             style: { colors: labelStyle },
//             formatter: (val) => val.toLocaleString(),
//           },
//           title: {
//             text: "Volume",
//             style: {
//               color: labelStyle.color,
//             },
//           },
//           padding: {
//             left: 0,
//             right: 0,
//           },
//           forceNiceScale: true, // Ensures volume bars stay within bounds
//         },
//       ],
//       plotOptions: {
//         candlestick: {
//           colors: {
//             upward: theme === "dark" ? "#10B981" : "#059669",
//             downward: theme === "dark" ? "#EF4444" : "#DC2626",
//           },
//           wick: {
//             useFillColor: true,
//           },
//         },
//         bar: {
//           columnWidth: "80%",
//           colors: {
//             ranges: [
//               {
//                 from: 0,
//                 to: Infinity,
//                 color: theme === "dark" ? "#4B556366" : "#9CA3AF66", // Shaded volume bars
//               },
//             ],
//           },
//         },
//       },
//       stroke: {
//         width: [1, 0], // Candlestick has stroke, volume bars don't
//       },
//       tooltip: {
//         enabled: true,
//         shared: true,
//         intersect: false,
//         theme: theme,
//         style: {
//           fontSize: "12px",
//           background: theme === "dark" ? "#1F2937" : "#FFFFFF",
//         },
//         x: {
//           formatter: (val) => new Date(val).toLocaleString(),
//         },
//         y: [
//           {
//             title: "Price: ",
//             formatter: (val) => val.toFixed(2),
//           },
//           {
//             title: "Volume: ",
//             formatter: (val) => val.toLocaleString(),
//           },
//         ],
//       },
//       grid: {
//         show: false,
//         padding: {
//           left: 0,
//           right: 0,
//           top: 0,
//           bottom: 0,
//         },
//       },
//       legend: {
//         show: false,
//       },
//     },
//   };

//   return (
//     <div
//       id="chart"
//       className="h-full w-full p-0 m-0"
//       style={{ padding: 0, margin: 0 }}
//     >
//       <Chart
//         options={chartData.options}
//         series={chartData.series}
//         type="candlestick"
//         height="100%"
//         width="100%"
//       />
//     </div>
//   );
// };

// export default CandleChart;

/* eslint-disable react/prop-types */
// import Chart from "react-apexcharts";
// import { useSelector } from "react-redux";

// const CandleChart = ({ candles, volumes }) => {
//   const theme = useSelector((state) => state.theme.theme);

//   // Generate enhanced dummy data with proper up/down candles and volume
//   const enhancedCandles = candles.map((candle, idx) => {
//     const volume = volumes[idx];
//     const isUp = candle.y[3] >= candle.y[0];

//     return {
//       ...candle,
//       x: new Date(candle.x),
//       y: [candle.y[0], candle.y[1], candle.y[2], candle.y[3]],
//       volume,
//       isUp,
//     };
//   });

//   const labelStyle = {
//     color: theme === "dark" ? "white" : "black",
//     fontSize: "10px",
//   };

//   const candlestickOptions = {
//     chart: {
//       id: "candlestick",
//       height: 250,
//       type: "candlestick",
//       zoom: {
//         enabled: true,
//         type: "x",
//         autoScaleYaxis: true,
//       },
//       pan: {
//         enabled: true,
//         type: "x",
//       },
//       toolbar: {
//         autoSelected: "zoom",
//       },
//       animations: {
//         enabled: true,
//         easing: "easeinout",
//         speed: 800,
//       },
//     },
//     title: {
//       text: "Candlestick with OI Change",
//       align: "left",
//       style: {
//         color: labelStyle.color,
//       },
//     },
//     xaxis: {
//       type: "datetime",
//       labels: {
//         show: false, // Hide x-axis labels for candlestick chart
//         style: labelStyle,
//         formatter: (val) => new Date(val).toLocaleTimeString(),
//       },
//       axisBorder: {
//         show: false,
//       },
//       crosshairs: {
//         show: true,
//         position: "back",
//         stroke: {
//           color: theme === "dark" ? "#9CA3AF" : "#374151",
//           width: 1,
//           dashArray: 0,
//         },
//       },
//       tickPlacement: "between",
//       labelRotation: 0,
//       padding: {
//         left: 0,
//         right: 0,
//       },
//     },
//     yaxis: {
//       seriesName: "Candlestick",
//       opposite: true,
//       axisTicks: {
//         show: false,
//       },
//       axisBorder: {
//         show: false,
//       },
//       labels: {
//         style: labelStyle,
//         formatter: (val) => val.toFixed(2),
//       },
//       title: {
//         text: "Price",
//         style: {
//           color: labelStyle.color,
//         },
//       },
//       padding: {
//         left: 0,
//         right: 0,
//       },
//       forceNiceScale: true,
//     },
//     plotOptions: {
//       candlestick: {
//         colors: {
//           upward: theme === "dark" ? "#10B981" : "#059669",
//           downward: theme === "dark" ? "#EF4444" : "#DC2626",
//         },
//         wick: {
//           useFillColor: true,
//         },
//       },
//     },
//     stroke: {
//       width: 1,
//     },
//     tooltip: {
//       enabled: true,
//       shared: false,
//       theme: theme,
//       style: {
//         fontSize: "12px",
//         background: theme === "dark" ? "#1F2937" : "#FFFFFF",
//       },
//       x: {
//         formatter: (val) => new Date(val).toLocaleString(),
//       },
//       y: {
//         title: "Price: ",
//         formatter: (val) => val.toFixed(2),
//       },
//     },
//     grid: {
//       show: false,
//       padding: {
//         left: 0,
//         right: 0,
//         top: 0,
//         bottom: 0,
//       },
//     },
//     legend: {
//       show: false,
//     },
//   };

//   const volumeOptions = {
//     chart: {
//       id: "volume",
//       height: 170,
//       type: "bar",
//       zoom: {
//         enabled: true,
//         type: "x",
//         autoScaleYaxis: true,
//       },
//       pan: {
//         enabled: true,
//         type: "x",
//       },
//       toolbar: {
//         show: false,
//       },
//       animations: {
//         enabled: true,
//         easing: "easeinout",
//         speed: 800,
//       },
//     },
//     xaxis: {
//       type: "datetime",
//       labels: {
//         show: true,
//         style: labelStyle,
//         formatter: (val) =>
//           new Date(val).toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           }),
//       },
//       axisBorder: {
//         show: false,
//       },
//       crosshairs: {
//         show: true,
//         position: "back",
//         stroke: {
//           color: theme === "dark" ? "#9CA3AF" : "#374151",
//           width: 1,
//           dashArray: 0,
//         },
//       },
//       tickPlacement: "between",
//       labelRotation: 0,
//       padding: {
//         left: 0,
//         right: 0,
//       },
//     },
//     yaxis: {
//       seriesName: "Volume",
//       opposite: false,
//       axisTicks: {
//         show: false,
//       },
//       axisBorder: {
//         show: false,
//       },
//       labels: {
//         show: false,
//       },
//       title: {
//         text: "",
//       },
//       padding: {
//         left: 0,
//         right: 0,
//       },
//       forceNiceScale: true,
//       // max: Math.max(...enhancedCandles.map((c) => c.volume)) * 1,
//     },
//     plotOptions: {
//       bar: {
//         columnWidth: "70%",
//         colors: {
//           ranges: [
//             {
//               from: 0,
//               to: Infinity,
//               color: theme === "dark" ? "#4B556366" : "#9CA3AF66",
//             },
//           ],
//         },
//         dataLabels: {
//           enabled: false,
//         },
//       },
//     },
//     dataLabels: {
//       enabled: false,
//     },
//     stroke: {
//       width: 0,
//     },
//     tooltip: {
//       enabled: true,
//       shared: false,
//       theme: theme,
//       style: {
//         fontSize: "12px",
//         background: theme === "dark" ? "#1F2937" : "#FFFFFF",
//       },
//       x: {
//         formatter: (val) => new Date(val).toLocaleString(),
//       },
//       y: {
//         title: "Volume: ",
//         formatter: (val) => val.toLocaleString(),
//       },
//     },
//     grid: {
//       show: false,
//       padding: {
//         left: 10,
//         right: 10,
//         top: 0,
//         bottom: 10,
//       },
//     },
//     legend: {
//       show: false,
//     },
//   };

//   return (
//     <div
//       id="chart"
//       className="h-full w-full p-0 m-0"
//       style={{ padding: 0, margin: 0 }}
//     >
//       <Chart
//         options={candlestickOptions}
//         series={[
//           {
//             name: "Candlestick",
//             type: "candlestick",
//             data: enhancedCandles.map((candle) => ({
//               x: candle.x,
//               y: candle.y,
//             })),
//           },
//         ]}
//         type="candlestick"
//         height={220}
//         width="100%"
//       />
//       <Chart
//         options={volumeOptions}
//         series={[
//           {
//             name: "Volume",
//             type: "bar",
//             data: enhancedCandles.map((candle) => ({
//               x: candle.x,
//               y: candle.volume,
//               fillColor: candle.isUp
//                 ? theme === "dark"
//                   ? "#10B98133"
//                   : "#05966933"
//                 : theme === "dark"
//                 ? "#EF444433"
//                 : "#DC262633",
//             })),
//           },
//         ]}
//         type="bar"
//         height={170}
//         width="100%"
//       />
//     </div>
//   );
// };

// export default CandleChart;

// import Chart from "react-apexcharts";
// import { useSelector } from "react-redux";

// const CandleChart = ({ candles, volumes }) => {
//   const theme = useSelector((state) => state.theme.theme);

//   // Validate input
//   if (
//     !candles ||
//     !volumes ||
//     !Array.isArray(candles) ||
//     !Array.isArray(volumes)
//   ) {
//     return <div>No valid data provided</div>;
//   }

//   // Enhanced data
//   const enhancedCandles = candles.map((candle, idx) => {
//     const volume = volumes[idx] || 0;
//     const isUp = candle.y && candle.y[3] >= candle.y[0];

//     return {
//       ...candle,
//       x: new Date(candle.x),
//       y: candle.y
//         ? [candle.y[0], candle.y[1], candle.y[2], candle.y[3]]
//         : [0, 0, 0, 0],
//       volume,
//       isUp,
//     };
//   });

//   const labelStyle = {
//     color: theme === "dark" ? "white" : "black",
//     fontSize: "10px",
//   };

//   const chartOptions = {
//     chart: {
//       id: "candle-volume",
//       height: 600,
//       type: "candlestick",
//       zoom: {
//         enabled: true,
//         type: "x",
//         autoScaleYaxis: true,
//       },
//       pan: {
//         enabled: true,
//         type: "x",
//       },
//       toolbar: {
//         autoSelected: "zoom",
//       },
//       animations: {
//         enabled: false,
//       },
//     },
//     title: {
//       text: "Candlestick with Volume",
//       align: "left",
//       style: {
//         color: labelStyle.color,
//       },
//     },
//     xaxis: {
//       type: "datetime",
//       labels: {
//         style: labelStyle,
//         formatter: (val) =>
//           val
//             ? new Date(val).toLocaleTimeString([], {
//                 hour: "2-digit",
//                 minute: "2-digit",
//               })
//             : "",
//       },
//       axisBorder: {
//         show: false,
//       },
//       crosshairs: {
//         show: true,
//         position: "back",
//         stroke: {
//           color: theme === "dark" ? "#9CA3AF" : "#374151",
//           width: 1,
//           dashArray: 0,
//         },
//       },
//       tickPlacement: "between",
//       tickAmount: 6,
//       padding: {
//         left: 0,
//         right: 0,
//       },
//     },
//     yaxis: [
//       {
//         seriesName: "Candlestick",
//         opposite: true,
//         axisTicks: { show: false },
//         axisBorder: { show: false },
//         labels: {
//           style: labelStyle,
//           formatter: (val) => (val ? val.toFixed(2) : "0.00"),
//         },
//         title: {
//           text: "Price",
//           style: { color: labelStyle.color },
//         },
//         padding: { left: 0, right: 0 },
//         forceNiceScale: true,
//       },
//       {
//         seriesName: "Volume",
//         opposite: false,
//         axisTicks: { show: false },
//         axisBorder: { show: false },
//         labels: { show: false },
//         title: { text: "" },
//         padding: { left: 0, right: 0 },
//         forceNiceScale: true,
//         min: 0,
//         max: (max) => max * 3,
//       },
//     ],
//     plotOptions: {
//       candlestick: {
//         colors: {
//           upward: theme === "dark" ? "#10B981" : "#059669",
//           downward: theme === "dark" ? "#EF4444" : "#DC2626",
//         },
//         wick: {
//           useFillColor: true,
//         },
//       },
//       bar: {
//         columnWidth: "40%",
//         colors: {
//           ranges: [
//             {
//               from: 0,
//               to: Infinity,
//               color: theme === "dark" ? "#4B556366" : "#9CA3AF66",
//             },
//           ],
//         },
//         dataLabels: {
//           enabled: false,
//         },
//       },
//     },
//     stroke: {
//       width: [1, 0],
//     },
//     tooltip: {
//       enabled: true,
//       shared: false,
//       intersect: true,
//       custom: ({ series, seriesIndex, dataPointIndex, w }) => {
//         const data = enhancedCandles[dataPointIndex];
//         if (!data) return "";
//         const [open, high, low, close] = data.y;
//         const volume = data.volume;

//         return `
//           <div style="padding: 10px; background: ${
//             theme === "dark" ? "#1F2937" : "#FFFFFF"
//           }; font-size: 12px; border-radius: 4px; color: ${
//           theme === "dark" ? "#F9FAFB" : "#111827"
//         };">
//             <div><strong>Time:</strong> ${new Date(
//               data.x
//             ).toLocaleString()}</div>
//             <div><strong>Open:</strong> ${open.toFixed(2)}</div>
//             <div><strong>High:</strong> ${high.toFixed(2)}</div>
//             <div><strong>Low:</strong> ${low.toFixed(2)}</div>
//             <div><strong>Close:</strong> ${close.toFixed(2)}</div>
//             <div><strong>Volume:</strong> ${volume.toLocaleString()}</div>
//           </div>
//         `;
//       },
//     },
//     grid: {
//       show: false,
//       padding: {
//         left: 0,
//         right: 0,
//         top: 30,
//         bottom: 30,
//       },
//     },
//     legend: {
//       show: false,
//     },
//   };

//   const series = [
//     {
//       name: "Candlestick",
//       type: "candlestick",
//       data: enhancedCandles.map((candle) => ({
//         x: candle.x,
//         y: candle.y,
//       })),
//     },
//     {
//       name: "Volume",
//       type: "bar",
//       data: enhancedCandles.map((candle) => ({
//         x: candle.x,
//         y: candle.volume,
//         fillColor: candle.isUp
//           ? theme === "dark"
//             ? "#10B98133"
//             : "#05966933"
//           : theme === "dark"
//           ? "#EF444433"
//           : "#DC262633",
//       })),
//     },
//   ];

//   return (
//     <div
//       id="chart-container"
//       className="h-full w-full p-0 m-0"
//       style={{ padding: 0, margin: 0, height: 600 }}
//     >
//       <Chart
//         options={chartOptions}
//         series={series}
//         type="candlestick"
//         height="100%"
//         width="100%"
//       />
//     </div>
//   );
// };

// export default CandleChart;

// import { useEffect } from "react";
// import Chart from "react-apexcharts";
// import { useSelector } from "react-redux";

// const CandleChart = ({ candles, volumes }) => {
//   const theme = useSelector((state) => state.theme.theme);
//   console.log(candles, volumes);
//   if (
//     !candles ||
//     !volumes ||
//     !Array.isArray(candles) ||
//     !Array.isArray(volumes)
//   ) {
//     return <div>No valid data provided</div>;
//   }

//   const enhancedCandles = candles.map((candle, idx) => {
//     const volume = volumes[idx]?.change || 0;
//     const isUp = candle.y && candle.y[3] >= candle.y[0];

//     return {
//       ...candle,
//       x: new Date(candle.x),
//       y: candle.y ? [...candle.y] : [0, 0, 0, 0],
//       volume,
//       isUp,
//       isGreen: volumes[idx]?.isGreen,
//     };
//   });

//   const labelStyle = {
//     color: theme === "dark" ? "white" : "black",
//     fontSize: "10px",
//   };

//   const chartOptions = {
//     chart: {
//       id: "candle-volume",
//       type: "candlestick",
//       height: "100%",
//       zoom: {
//         enabled: true,
//         type: "x",
//         autoScaleYaxis: true,
//       },
//       pan: {
//         enabled: true,
//         type: "x",
//       },
//       toolbar: {
//         autoSelected: "zoom",
//       },
//       animations: {
//         enabled: false,
//       },
//     },
//     title: {
//       text: "Candlestick with OI Change",
//       align: "left",
//       style: {
//         color: labelStyle.color,
//       },
//     },
//     xaxis: {
//       type: "datetime",
//       labels: {
//         style: labelStyle,
//         formatter: (val) =>
//           val
//             ? new Date(val).toLocaleTimeString([], {
//                 hour: "2-digit",
//                 minute: "2-digit",
//               })
//             : "",
//       },
//       crosshairs: {
//         show: true,
//         position: "back",
//         stroke: {
//           color: theme === "dark" ? "#9CA3AF" : "#374151",
//           width: 1,
//         },
//       },
//     },
//     yaxis: [
//       {
//         seriesName: "Candlestick",
//         opposite: true,
//         axisTicks: { show: false },
//         axisBorder: { show: false },
//         labels: {
//           style: labelStyle,
//           formatter: (val) => (val ? val.toFixed(2) : "0.00"),
//         },
//         title: {
//           text: "Price",
//           style: { color: labelStyle.color },
//         },
//         forceNiceScale: true,
//       },
//       {
//         seriesName: "Volume",
//         opposite: false,
//         axisTicks: { show: false },
//         axisBorder: { show: false },
//         labels: { show: false },
//         forceNiceScale: true,
//         min: 0,
//         max: (max) => max * 2,
//       },
//     ],
//     tooltip: {
//       enabled: true,
//       shared: false,
//       intersect: true,
//       custom: ({ _, dataPointIndex }) => {
//         console.log("candle");
//         const candle = enhancedCandles[dataPointIndex];
//         if (!candle) return "";
//         const [open, high, low, close] = candle.y.map(Number);
//         const isUp = close >= open;
//         const color = isUp
//           ? theme === "dark"
//             ? "#10B981"
//             : "#059669"
//           : theme === "dark"
//           ? "#EF4444"
//           : "#DC2626";

//         return `
//       <div class="apexcharts-tooltip-candlestick" style="
//         background: ${theme === "dark" ? "#1F2937" : "#FFFFFF"};
//         color: ${theme === "dark" ? "#E5E7EB" : "#111827"};
//         border: 1px solid ${theme === "dark" ? "#374151" : "#D1D5DB"};
//         border-radius: 0.375rem;
//         padding: 0.5rem;
//         box-shadow: ${
//           theme === "dark"
//             ? "0 4px 6px rgba(0, 0, 0, 0.5)"
//             : "0 4px 6px rgba(0, 0, 0, 0.1)"
//         };
//         font-family: ui-sans-serif, system-ui, sans-serif;
//       ">
//         <div style="
//           font-size: 0.875rem;
//           font-weight: 600;
//           margin-bottom: 0.25rem;
//           color: ${theme === "dark" ? "#F3F4F6" : "#111827"};
//         ">
//           ${new Date(candle.x).toLocaleString()}
//         </div>
//         <div style="display: grid; grid-template-columns: max-content 1fr; gap: 0.25rem 0.5rem;">
//           <span style="color: ${
//             theme === "dark" ? "#9CA3AF" : "#6B7280"
//           }">Open:</span>
//           <span>${open.toFixed(2)}</span>
//           <span style="color: ${
//             theme === "dark" ? "#9CA3AF" : "#6B7280"
//           }">High:</span>
//           <span style="color: ${color}">${high.toFixed(2)}</span>
//           <span style="color: ${
//             theme === "dark" ? "#9CA3AF" : "#6B7280"
//           }">Low:</span>
//           <span style="color: ${color}">${low.toFixed(2)}</span>
//           <span style="color: ${
//             theme === "dark" ? "#9CA3AF" : "#6B7280"
//           }">Close:</span>
//           <span style="color: ${color}">${close.toFixed(2)}</span>
//           <span style="color: ${
//             theme === "dark" ? "#9CA3AF" : "#6B7280"
//           }">OI Change:</span>
//           <span>${candle.volume.toLocaleString()}</span>
//         </div>
//       </div>
//     `;
//       },
//     },

//     plotOptions: {
//       candlestick: {
//         colors: {
//           upward: theme === "dark" ? "#10B981" : "#059669",
//           downward: theme === "dark" ? "#EF4444" : "#DC2626",
//         },
//         wick: {
//           useFillColor: true,
//         },
//       },
//       bar: {
//         columnWidth: "40%",
//         // colors: {
//         //   ranges: [
//         //     {
//         //       from: 0,
//         //       to: Infinity,
//         //       color: theme === "dark" ? "#4B556366" : "#9CA3AF66",
//         //     },
//         //   ],
//         // },
//         dataLabels: {
//           enabled: false,
//         },
//       },
//     },
//     stroke: {
//       width: [1, 0],
//     },
//     grid: {
//       show: false,
//       padding: {
//         left: 0,
//         right: 0,
//         top: 30,
//         bottom: 30,
//       },
//     },
//     legend: {
//       show: false,
//     },
//     responsive: [
//       {
//         breakpoint: 768,
//         options: {
//           chart: {
//             height: 400,
//           },
//           title: {
//             style: {
//               fontSize: "14px",
//             },
//           },
//         },
//       },
//     ],
//   };

//   const series = [
//     {
//       name: "Candlestick",
//       type: "candlestick",
//       data: enhancedCandles.map((candle) => ({
//         x: candle.x,
//         y: candle.y,
//       })),
//     },
//     {
//       name: "Volume",
//       type: "bar",
//       data: enhancedCandles.map((candle) => ({
//         x: candle.x,
//         y: candle.volume,
//         fillColor: candle.isGreen
//           ? theme === "dark"
//             ? "#10B98133"
//             : "#05966933"
//           : theme === "dark"
//           ? "#EF444433"
//           : "#DC262633",
//       })),
//     },
//   ];

//   return (
//     <div
//       id="chart-container"
//       style={{ height: "100%", width: "100%", padding: 0, margin: 0 }}
//     >
//       <Chart
//         options={chartOptions}
//         series={series}
//         type="candlestick"
//         height="100%"
//         width="100%"
//       />
//     </div>
//   );
// };

// export default CandleChart;

// import { useEffect, useRef } from "react";
// import { createChart, ColorType } from "lightweight-charts";

// const CandleChartFromRaw = ({ candles }) => {
//   const containerRef = useRef(null);
//   const chartRef = useRef(null);
//   const seriesRef = useRef(null);

//   useEffect(() => {
//     if (!containerRef.current) return;

//     if (chartRef.current) {
//       chartRef.current.remove();
//       chartRef.current = null;
//       seriesRef.current = null;
//     }

//     const chart = createChart(containerRef.current, {
//       layout: {
//         background: { type: ColorType.Solid, color: "white" },
//         textColor: "black",
//       },
//       timeScale: {
//         timeVisible: true,
//         secondsVisible: true,
//       },
//       rightPriceScale: {
//         borderVisible: false,
//       },
//     });

//     chartRef.current = chart;

//     const candleSeries = chart.addCandlestickSeries({
//       upColor: "#26a69a",
//       downColor: "#ef5350",
//       borderVisible: false,
//       wickUpColor: "#26a69a",
//       wickDownColor: "#ef5350",
//     });

//     seriesRef.current = candleSeries;

//     const safe = (candles || []).filter(
//       (c) =>
//         c && typeof c.x === "number" && Array.isArray(c.y) && c.y.length === 4
//     );

//     safe.sort((a, b) => a.x - b.x);

//     const data = safe.map((c) => ({
//       time: Math.floor(c.x / 1000),
//       open: Number(c.y[0]),
//       high: Number(c.y[1]),
//       low: Number(c.y[2]),
//       close: Number(c.y[3]),
//     }));

//     if (data.length > 0) {
//       candleSeries.setData(data);
//       chart.timeScale().fitContent();
//     }

//     const handleResize = () => {
//       if (!chartRef.current || !containerRef.current) return;
//       chartRef.current.applyOptions({
//         width: containerRef.current.clientWidth || 0,
//         height: containerRef.current.clientHeight || 0,
//       });
//     };

//     handleResize();
//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       if (chartRef.current) {
//         chartRef.current.remove();
//         chartRef.current = null;
//       }
//     };
//   }, [candles]);

//   return <div ref={containerRef} style={{ width: "100%", height: "400px" }} />;
// };

// export default CandleChartFromRaw;

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";
import { useMediaQuery } from "react-responsive";

const CandleChartWithVolume = ({ candles, volumes }) => {
  if (!candles || !volumes) return null;
  const theme = useSelector((state) => state.theme.theme);
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const isMobile = useMediaQuery({ maxWidth: "768px" });

  useEffect(() => {
    if (!containerRef.current) return;
    if (!Array.isArray(candles) || !Array.isArray(volumes)) return;

    // Clean up old chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    }

    const isDark = theme === "dark";

    const chart = createChart(containerRef.current, {
      layout: {
        background: {
          type: ColorType.Solid,
          color: isDark ? "#020617" : "#FFFFFF",
        },
        textColor: isDark ? "#E5E7EB" : "#111827",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: isDark ? "#020617" : "#FFFFFF" },
        horzLines: { color: isDark ? "#020617" : "#FFFFFF" },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderVisible: false,
      },
      crosshair: { mode: 1 },
      // Crosshair time label formatting (bottom label) [web:162]
      localization: {
        timeFormatter: (time) => {
          const date = new Date(time * 1000);
          return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
          });
        },
      },
    });

    chartRef.current = chart;

    // Candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: isDark ? "#10B981" : "#059669",
      downColor: isDark ? "#EF4444" : "#DC2626",
      wickUpColor: isDark ? "#10B981" : "#059669",
      wickDownColor: isDark ? "#EF4444" : "#DC2626",
      borderVisible: false,
    });
    candleSeriesRef.current = candleSeries;

    candleSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.05, bottom: 0.3 },
    });

    // Volume histogram overlay [web:39]
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: "",
      priceFormat: { type: "volume" },
      color: isDark ? "#4B5563" : "#9CA3AF",
      scaleMargins: { top: 0.7, bottom: 0.02 },
    });
    volumeSeriesRef.current = volumeSeries;

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0.02 },
    });
    // 1) Attach original index so we can align volumes after sorting
    const safe = (candles || [])
      .map((c, idx) => ({
        ...c,
        __i: idx,
      }))
      .filter(
        (c) =>
          c && typeof c.x === "number" && Array.isArray(c.y) && c.y.length === 4
      );

    // 2) Sort copy by time
    const sorted = [...safe].sort((a, b) => a.x - b.x);

    // 3) Build candle + volume data and keep combined array for tooltip lookup
    const candleData = [];
    const volumeData = [];
    const combined = [];

    sorted.forEach((c) => {
      const vol = volumes[c.__i] || { change: 0, isGreen: true };
      const change = Number(vol.change) || 0;
      const isGreen = !!vol.isGreen;

      const timeSec = Math.floor(c.x / 1000);
      const open = Number(c.y[0]);
      const high = Number(c.y[1]);
      const low = Number(c.y[2]);
      const close = Number(c.y[3]);

      candleData.push({
        time: timeSec,
        open,
        high,
        low,
        close,
      });

      volumeData.push({
        time: timeSec,
        value: Math.abs(change),
        color: isGreen
          ? isDark
            ? "rgba(16,185,129,0.4)"
            : "rgba(5,150,105,0.4)"
          : isDark
          ? "rgba(239,68,68,0.4)"
          : "rgba(220,38,38,0.4)",
      });

      combined.push({
        time: timeSec,
        open,
        high,
        low,
        close,
        change,
        isGreen,
      });
    });

    if (candleData.length === 0) return;

    candleSeries.setData(candleData);
    volumeSeries.setData(volumeData);

    // X-axis tick labels: HH:MM IST [web:80]
    chart.applyOptions({
      timeScale: {
        tickMarkFormatter: (time) => {
          const date = new Date(time * 1000);
          return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Kolkata",
          });
        },
      },
    });

    chart.timeScale().fitContent();

    // === Tooltip: OHLC + OI Change on hover (candle or volume) === [web:53][web:160]
    const tooltip = document.createElement("div");

    tooltip.style.position = "absolute";
    tooltip.style.zIndex = "1000";
    tooltip.style.pointerEvents = "none";
    tooltip.style.background = isDark ? "#1F2937" : "#FFFFFF";
    tooltip.style.color = isDark ? "#E5E7EB" : "#111827";
    tooltip.style.border = `1px solid ${isDark ? "#374151" : "#D1D5DB"}`;
    tooltip.style.borderRadius = "0.375rem";
    tooltip.style.padding = "0.5rem";
    tooltip.style.fontSize = "12px";
    tooltip.style.fontFamily = "ui-sans-serif, system-ui, sans-serif";
    tooltip.style.display = "none";

    containerRef.current.appendChild(tooltip);

    chart.subscribeCrosshairMove((param) => {
      if (
        !param.point ||
        !param.time ||
        param.point.x < 0 ||
        param.point.y < 0 ||
        param.point.x > containerRef.current.clientWidth ||
        param.point.y > containerRef.current.clientHeight
      ) {
        tooltip.style.display = "none";
        return;
      }

      const priceMap = param.seriesData || param.seriesPrices;
      if (!priceMap) {
        tooltip.style.display = "none";
        return;
      }

      const ohlc = priceMap.get(candleSeries);
      if (!ohlc || ohlc.open === undefined) {
        tooltip.style.display = "none";
        return;
      }

      const timeSec = param.time;
      const tsMs = timeSec * 1000;

      // Find matching combined entry by time
      const row = combined.find((d) => d.time === timeSec);
      const change = row ? row.change : 0;
      const isUp = ohlc.close >= ohlc.open;

      const timeStr = new Date(tsMs).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });

      const color = isUp
        ? isDark
          ? "#10B981"
          : "#059669"
        : isDark
        ? "#EF4444"
        : "#DC2626";

      tooltip.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 0.25rem;">
          ${timeStr}
        </div>
        <div style="display: grid; grid-template-columns: max-content 1fr; gap: 0.25rem 0.5rem;">
          <span style="color:${isDark ? "#9CA3AF" : "#6B7280"}">Open:</span>
          <span>${ohlc.open.toFixed(2)}</span>
          <span style="color:${isDark ? "#9CA3AF" : "#6B7280"}">High:</span>
          <span style="color:${color}">${ohlc.high.toFixed(2)}</span>
          <span style="color:${isDark ? "#9CA3AF" : "#6B7280"}">Low:</span>
          <span style="color:${color}">${ohlc.low.toFixed(2)}</span>
          <span style="color:${isDark ? "#9CA3AF" : "#6B7280"}">Close:</span>
          <span style="color:${color}">${ohlc.close.toFixed(2)}</span>
          <span style="color:${
            isDark ? "#9CA3AF" : "#6B7280"
          }">OI Change:</span>
          <span>${change.toLocaleString()}</span>
        </div>
      `;

      const tooltipWidth = 220;
      const tooltipHeight = 130;
      let left = param.point.x + 10;
      let top = param.point.y + 10;

      if (left + tooltipWidth > containerRef.current.clientWidth) {
        left = param.point.x - tooltipWidth - 10;
      }
      if (top + tooltipHeight > containerRef.current.clientHeight) {
        top = param.point.y - tooltipHeight - 10;
      }

      tooltip.style.left = `${isMobile ? 0 : left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.style.display = "block";
    });
    chart.applyOptions({
      width: containerRef.current.clientWidth || 0,
      height: containerRef.current.clientHeight || 0,
    });

    const resizeObserver = new ResizeObserver((entries) => {
      if (!chartRef.current) return;
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chartRef.current.applyOptions({
          width: width || 0,
          height: height || 0,
        });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
    // const handleResize = () => {
    //   if (!chartRef.current || !containerRef.current) return;
    //   chartRef.current.applyOptions({
    //     width: containerRef.current.clientWidth || 0,
    //     height: containerRef.current.clientHeight || 0,
    //   });
    // };

    // handleResize();
    // window.addEventListener("resize", handleResize);

    // return () => {
    //   window.removeEventListener("resize", handleResize);
    //   if (chartRef.current) {
    //     chartRef.current.remove();
    //     chartRef.current = null;
    //   }
    // };
  }, [candles, volumes, theme]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{ padding: 0, margin: 0 }}
    />
  );
};

export default CandleChartWithVolume;
