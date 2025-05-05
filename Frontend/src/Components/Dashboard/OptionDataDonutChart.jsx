import React, { useState } from "react";
import Chart from "react-apexcharts";

const OptionDataDonutChart = () => {
  const shares = [
    { name: "Reliance", percent: 44, change: 2.5 },  
    { name: "TCS", percent: 55, change: -1.8 },      
    { name: "Infosys", percent: 10, change: 8.2 },   
    { name: "HDFC Bank", percent: 17, change: -7.9 }, 
    { name: "ICICI Bank", percent: 15, change: 1.2 }, 
  ];

  const interpolateColor = (startColor, endColor, factor) => {
    const hexToRgb = (hex) =>
      hex
        .replace(/^#/, "")
        .match(/.{1,2}/g)
        .map((x) => parseInt(x, 16));

    const rgbToHex = (rgb) =>
      `#${rgb.map((x) => x.toString(16).padStart(2, "0")).join("")}`;

    const startRGB = hexToRgb(startColor);
    const endRGB = hexToRgb(endColor);

    const resultRGB = startRGB.map((start, i) =>
      Math.round(start + (endRGB[i] - start) * factor)
    );

    return rgbToHex(resultRGB);
  };

  const getColor = (percent, change) => {
    const minPercent = Math.min(...shares.map((s) => s.percent));
    const maxPercent = Math.max(...shares.map((s) => s.percent));

    const factor = (percent - minPercent) / (maxPercent - minPercent);

    return change > 0
      ? interpolateColor("#c0f2c0", "#144d14", factor) // Light Green → Dark Green
      : interpolateColor("#f2c0c0", "#611414", factor); // Light Red → Dark Red
  };

  const [chartData] = useState({
    series: shares.map((s) => s.percent),
    options: {
      chart: {
        type: "donut",
        width: "100%",
      },
      labels: shares.map((s) => s.name),
      colors: shares.map((s) => getColor(s.percent, s.change)),
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val.toFixed(1) + "%";
        },
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                show: true,
                label: "NIFTY 50",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 600,
              },
            },
          },
        },
      },
      legend: {
        position: "bottom",
        labels: {
          useSeriesColors: true,
          colors: "#fff",
        },
      },
      responsive: [
        {
          breakpoint: 1024,
          options: {
            chart: { width: 350 },
            legend: { position: "bottom" },
          },
        },
        {
          breakpoint: 768,
          options: {
            chart: { width: 300 },
            legend: { position: "bottom" },
          },
        },
        {
          breakpoint: 480,
          options: {
            chart: { width: 250 },
            legend: { position: "bottom" },
          },
        },
      ],
    },
  });

  return (
    <div className="w-full flex flex-col items-center">
      <p className="text-sm font-bold text-center text-white">
        Nifty 50 is down by 32 pts
      </p>
      <div className="w-full flex justify-center">
        <Chart options={chartData.options} series={chartData.series} type="donut" width="100%" />
      </div>
    </div>
  );
};

export default OptionDataDonutChart;
