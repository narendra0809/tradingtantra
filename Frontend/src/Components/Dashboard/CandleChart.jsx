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
import Chart from "react-apexcharts";
import { useSelector } from "react-redux";

const CandleChart = ({ candles, volumes }) => {
  const theme = useSelector((state) => state.theme.theme);

  // Generate enhanced dummy data with proper up/down candles and volume
  const enhancedCandles = candles.map((candle, idx) => {
    const volume = volumes[idx];
    const isUp = candle.y[3] >= candle.y[0];

    return {
      ...candle,
      x: new Date(candle.x),
      y: [candle.y[0], candle.y[1], candle.y[2], candle.y[3]],
      volume,
      isUp,
    };
  });

  const labelStyle = {
    color: theme === "dark" ? "white" : "black",
    fontSize: "10px",
  };

  const candlestickOptions = {
    chart: {
      id: "candlestick",
      height: 250,
      type: "candlestick",
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: true,
      },
      pan: {
        enabled: true,
        type: "x",
      },
      toolbar: {
        autoSelected: "zoom",
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
    },
    title: {
      text: "Candlestick with OI Change",
      align: "left",
      style: {
        color: labelStyle.color,
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        show: false, // Hide x-axis labels for candlestick chart
        style: labelStyle,
        formatter: (val) => new Date(val).toLocaleTimeString(),
      },
      axisBorder: {
        show: false,
      },
      crosshairs: {
        show: true,
        position: "back",
        stroke: {
          color: theme === "dark" ? "#9CA3AF" : "#374151",
          width: 1,
          dashArray: 0,
        },
      },
      tickPlacement: "between",
      labelRotation: 0,
      padding: {
        left: 0,
        right: 0,
      },
    },
    yaxis: {
      seriesName: "Candlestick",
      opposite: true,
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      labels: {
        style: labelStyle,
        formatter: (val) => val.toFixed(2),
      },
      title: {
        text: "Price",
        style: {
          color: labelStyle.color,
        },
      },
      padding: {
        left: 0,
        right: 0,
      },
      forceNiceScale: true,
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: theme === "dark" ? "#10B981" : "#059669",
          downward: theme === "dark" ? "#EF4444" : "#DC2626",
        },
        wick: {
          useFillColor: true,
        },
      },
    },
    stroke: {
      width: 1,
    },
    tooltip: {
      enabled: true,
      shared: false,
      theme: theme,
      style: {
        fontSize: "12px",
        background: theme === "dark" ? "#1F2937" : "#FFFFFF",
      },
      x: {
        formatter: (val) => new Date(val).toLocaleString(),
      },
      y: {
        title: "Price: ",
        formatter: (val) => val.toFixed(2),
      },
    },
    grid: {
      show: false,
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    },
    legend: {
      show: false,
    },
  };

  const volumeOptions = {
    chart: {
      id: "volume",
      height: 170,
      type: "bar",
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: true,
      },
      pan: {
        enabled: true,
        type: "x",
      },
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        show: true,
        style: labelStyle,
        formatter: (val) =>
          new Date(val).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
      },
      axisBorder: {
        show: false,
      },
      crosshairs: {
        show: true,
        position: "back",
        stroke: {
          color: theme === "dark" ? "#9CA3AF" : "#374151",
          width: 1,
          dashArray: 0,
        },
      },
      tickPlacement: "between",
      labelRotation: 0,
      padding: {
        left: 0,
        right: 0,
      },
    },
    yaxis: {
      seriesName: "Volume",
      opposite: false,
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      labels: {
        show: false,
      },
      title: {
        text: "",
      },
      padding: {
        left: 0,
        right: 0,
      },
      forceNiceScale: true,
      // max: Math.max(...enhancedCandles.map((c) => c.volume)) * 1,
    },
    plotOptions: {
      bar: {
        columnWidth: "70%",
        colors: {
          ranges: [
            {
              from: 0,
              to: Infinity,
              color: theme === "dark" ? "#4B556366" : "#9CA3AF66",
            },
          ],
        },
        dataLabels: {
          enabled: false,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0,
    },
    tooltip: {
      enabled: true,
      shared: false,
      theme: theme,
      style: {
        fontSize: "12px",
        background: theme === "dark" ? "#1F2937" : "#FFFFFF",
      },
      x: {
        formatter: (val) => new Date(val).toLocaleString(),
      },
      y: {
        title: "Volume: ",
        formatter: (val) => val.toLocaleString(),
      },
    },
    grid: {
      show: false,
      padding: {
        left: 10,
        right: 10,
        top: 0,
        bottom: 10,
      },
    },
    legend: {
      show: false,
    },
  };

  return (
    <div
      id="chart"
      className="h-full w-full p-0 m-0"
      style={{ padding: 0, margin: 0 }}
    >
      <Chart
        options={candlestickOptions}
        series={[
          {
            name: "Candlestick",
            type: "candlestick",
            data: enhancedCandles.map((candle) => ({
              x: candle.x,
              y: candle.y,
            })),
          },
        ]}
        type="candlestick"
        height={220}
        width="100%"
      />
      <Chart
        options={volumeOptions}
        series={[
          {
            name: "Volume",
            type: "bar",
            data: enhancedCandles.map((candle) => ({
              x: candle.x,
              y: candle.volume,
              fillColor: candle.isUp
                ? theme === "dark"
                  ? "#10B98133"
                  : "#05966933"
                : theme === "dark"
                ? "#EF444433"
                : "#DC262633",
            })),
          },
        ]}
        type="bar"
        height={170}
        width="100%"
      />
    </div>
  );
};

export default CandleChart;
