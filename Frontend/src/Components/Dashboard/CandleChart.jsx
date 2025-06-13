/* eslint-disable react/prop-types */

import Chart from "react-apexcharts";
import { useSelector } from "react-redux";

const CandleChart = ({ candles }) => {
  const theme = useSelector((state) => state.theme.theme);

  const labelStyle = {
    color: theme === "dark" ? "white" : "black",
  };

  const chartData = {
    series: [
      {
        data: candles,
      },
    ],
    options: {
      chart: {
        type: "candlestick",
        height: 350,
        background: "transparent",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 500,
        },
        zoom: {
          enabled: true,
          type: "x",
          autoScaleYaxis: true,
        },
        pan: {
          enabled: true,
          type: "x",
        },
      },
      xaxis: {
        type: "datetime",
        labels: {
          style: { colors: labelStyle },
          formatter: (val) => new Date(val).toLocaleTimeString(),
        },
      },
      yaxis: {
        tooltip: { enabled: true },
        labels: { style: { colors: labelStyle } },
      },
      tooltip: {
        enabled: true,
        shared: false,
        intersect: false,
        theme: "dark",
        style: { background: "#01071C", color: "#ffffff" },
        x: {
          formatter: (val) => new Date(val).toLocaleString(),
        },
      },
      crosshair: {
        show: true,
        stroke: {
          width: 1,
          dashArray: 0,
        },
      },
      markers: {
        size: 0,
      },
      dataLabels: {
        enabled: false,
      },
    },
  };

  return (
    <div id="chart" className="h-full">
      <Chart
        options={chartData.options}
        series={chartData.series}
        type="candlestick"
        height="100%"
      />
    </div>
  );
};

export default CandleChart;
