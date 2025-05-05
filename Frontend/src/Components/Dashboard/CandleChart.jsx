import React, { useState } from "react";
import Chart from "react-apexcharts";
import { useSelector } from "react-redux";
const CandleChart = () => {

  const theme= useSelector((state) => state.theme.theme);
  const labelStyle={
    color: theme === "dark" ? "white" : "black",
  }
  const [chartData] = useState({
    series: [
      {
        data: [
            { x: new Date(1538778600000), y: [6629.81, 6650.5, 6623.04, 6633.33] },
            { x: new Date(1538780400000), y: [6632.01, 6643.59, 6620, 6630.11] },
            { x: new Date(1538782200000), y: [6630.71, 6648.95, 6623.34, 6635.65] },
            { x: new Date(1538784000000), y: [6635.65, 6651, 6629.67, 6638.24] },
            { x: new Date(1538785800000), y: [6638.24, 6660, 6635, 6650] },
            { x: new Date(1538787600000), y: [6650, 6665, 6645, 6658] },
            { x: new Date(1538789400000), y: [6658, 6670, 6650, 6665] },
            { x: new Date(1538791200000), y: [6665, 6680, 6660, 6675] },
            { x: new Date(1538793000000), y: [6675, 6690, 6670, 6685] },
            { x: new Date(1538794800000), y: [6685, 6700, 6680, 6695] },
            { x: new Date(1538796600000), y: [6695, 6710, 6690, 6705] },
            { x: new Date(1538798400000), y: [6705, 6720, 6700, 6715] },
            { x: new Date(1538800200000), y: [6715, 6730, 6710, 6725] },
            { x: new Date(1538802000000), y: [6725, 6740, 6720, 6735] },
            { x: new Date(1538803800000), y: [6735, 6750, 6730, 6745] },
            { x: new Date(1538805600000), y: [6745, 6760, 6740, 6755] },
            { x: new Date(1538807400000), y: [6755, 6770, 6750, 6765] },
            { x: new Date(1538809200000), y: [6765, 6780, 6760, 6775] },
            { x: new Date(1538811000000), y: [6775, 6790, 6770, 6785] },
            { x: new Date(1538812800000), y: [6785, 6800, 6780, 6795] }
          ]
          
      }
    ],
    options: {
      chart: {
        type: "candlestick",
        height: 350,
        background: "transparent", // Keep background transparent
      },
      
      xaxis: {
        type: "datetime",
        labels: { style: { colors: labelStyle } } // White text color
      },
      yaxis: {
        tooltip: { enabled: true },
        labels: { style: { colors: labelStyle } } // White text color
      },
      tooltip: {
        theme: "dark",
        style: { background: "#01071C", color: "#ffffff" } // Dark tooltip background
      }
    }
  });

  return (
    <div id="chart" className="h-full">
      <Chart options={chartData.options} series={chartData.series} type="candlestick" height="100%" />
    </div>
  );
};

export default CandleChart;
