/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import Chart from "react-apexcharts";
import Lock from "./Lock";
import { useSelector } from "react-redux";

const OptionDataDonutChart = ({ contributor, allIndexPts, isSubscribed }) => {
  const indexPts = allIndexPts[contributor?.indexName]?.pts || 1;
  const theme = useSelector((state) => state.theme.theme);

  // Helper function to get TradingView URL for stock
  const getStockTradingViewUrl = (stockName) => {
    return `https://in.tradingview.com/chart/?symbol=NSE%3A${stockName}&interval=5`;
  };

  // Helper function to get TradingView URL for index
  const getIndexTradingViewUrl = (indexName) => {
    const indexMap = {
      "NIFTY 50": "NSE:NIFTY",
      BANKNIFTY: "NSE:BANKNIFTY",
      FINNIFTY: "NSE:FINNIFTY",
      MIDCAP: "NSE:NIFTYMIDCAP",
      SENSEX: "BSE:SENSEX",
    };
    const tradingViewSymbol = indexMap[indexName] || `NSE:${indexName}`;
    return `https://in.tradingview.com/chart/?symbol=${encodeURIComponent(tradingViewSymbol)}&interval=5`;
  };

  // 🔥 FIX: Auto-load chart when data is available
  const [isChartReady, setIsChartReady] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Check if data is available
    const hasData = contributor?.contributions?.length > 0;
    
    if (hasData && containerRef.current) {
      // Set ready after ensuring container exists
      const timer = setTimeout(() => {
        setIsChartReady(true);
        // Force chart resize
        window.dispatchEvent(new Event("resize"));
      }, 50);

      return () => clearTimeout(timer);
    } else {
      setIsChartReady(false);
    }
  }, [contributor, allIndexPts]);

  // Early return if no data
  if (!contributor?.contributions || contributor.contributions.length === 0) {
    return (
      <div className="w-full flex justify-center items-center h-[400px]">
        <p>No data available</p>
      </div>
    );
  }

  const topContributors = contributor.contributions
    .sort((a, b) => Math.abs(b.points) - Math.abs(a.points))
    .slice(0, 10)
    .map((item) => ({
      name: item.symbol || item.UNDERLYING_SYMBOL || item.displayName,
      points: parseFloat(item.points.toFixed(2)),
      percent: Math.abs((item.points / indexPts) * 100),
    }));

  const otherContributionsPoints = contributor.contributions
    .slice(10)
    .reduce((sum, item) => sum + item.points, 0);

  const otherContributionsPercent = parseFloat(
    Math.abs((otherContributionsPoints / indexPts) * 100).toFixed(2)
  );

  // Series data (Permissions for drawing slices)
  const chartSeries =
    otherContributionsPercent > 0
      ? [...topContributors.map((s) => s.percent), otherContributionsPercent]
      : topContributors.map((s) => s.percent);

  // 🔥 Tooltip Data Array (Points values for tooltip lookup)
  const tooltipPointsData =
    otherContributionsPercent > 0
      ? [...topContributors.map((s) => s.points), otherContributionsPoints]
      : topContributors.map((s) => s.points);

  const chartLabels =
    otherContributionsPercent > 0
      ? [
          ...topContributors.map(
            (s) => `${s.name} (${s.points > 0 ? "+" : ""}${s.points})`
          ),
          `Others (${contributor.contributions.slice(10).length} stocks)`,
        ]
      : topContributors.map(
          (s) => `${s.name} (${s.points > 0 ? "+" : ""}${s.points})`
        );

  const getColor = (percent, points) => {
    const maxPercent = Math.max(
      ...topContributors.map((s) => s.percent),
      otherContributionsPercent
    );
    const intensity = percent / (maxPercent || 1);

    if (points > 0) {
      const opacity = 0.4 + intensity * 0.6;
      return `rgba(76, 175, 80, ${opacity})`;
    } else {
      const opacity = 0.4 + intensity * 0.6;
      return `rgba(244, 67, 54, ${opacity})`;
    }
  };

  const chartColors =
    otherContributionsPercent > 0
      ? [
          ...topContributors.map((s) => getColor(s.percent, s.points)),
          getColor(otherContributionsPercent, otherContributionsPoints),
        ]
      : topContributors.map((s) => getColor(s.percent, s.points));

  const chartData = {
    series: chartSeries,
    options: {
      chart: {
        type: "donut",
        width: "100%",
        foreColor: "#fff",
        redrawOnParentResize: true,
        dropShadow: {
          enabled: true,
          top: 0,
          left: 0,
          blur: 10,
          opacity: 0.2,
        },
        events: {
          dataPointSelection: function(event, chartContext, config) {
            // Handle chart slice clicks if needed
          },
        },
      },
      labels: chartLabels,
      colors: chartColors,
      stroke: {
        width: 2,
        colors: theme === "dark" ? ["#01071C"] : ["#FFF"],
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "12px",
          fontWeight: "bold",
          colors: ["#000"],
        },
        dropShadow: { enabled: false },
        offset: 5,
        minAngleToShowLabel: 1,
      },
      plotOptions: {
        pie: {
          donut: {
            size: "70%",
            labels: {
              show: true,
              name: { color: "#000" },
              value: {
                color: indexPts < 0 ? "#9B3B44" : "#269F3C",
                fontSize: "16px",
                fontWeight: "bold",
                // Center Label
                formatter: function (val) {
                  return val ? parseFloat(val).toFixed(1) + "%" : "";
                },
              },
              total: {
                show: true,
                showAlways: true,
                label: contributor.indexName,
                color: indexPts < 0 ? "#F44336" : "#4CAF50",
                fontSize: "18px",
                fontWeight: 600,
                formatter: function () {
                  return `${indexPts > 0 ? "+" : ""}${indexPts.toFixed(2)} pts`;
                },
              },
            },
          },
        },
      },
      legend: { show: false },
      tooltip: {
        enabled: true,
        style: { fontSize: "14px" },
        y: {
          // 🔥 FIX 2: Show Points instead of Percentage
          formatter: function (val, { seriesIndex }) {
            const points = tooltipPointsData[seriesIndex];
            return `${points > 0 ? "+" : ""}${points.toFixed(2)} pts`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
        <div className="w-full lg:w-1/2 xl:w-2/5 flex justify-center">
          <div 
            ref={containerRef}
            className="w-full max-w-md h-[400px] min-h-[400px] relative flex items-center justify-center"
          >
            {!isSubscribed ? (
              <Lock />
            ) : isChartReady && contributor?.contributions?.length > 0 ? (
              <div className="relative w-full h-full">
                <Chart
                  key={`chart-${contributor.indexName}-${isChartReady}`}
                  options={chartData.options}
                  series={chartData.series}
                  type="donut"
                  width="100%"
                  height={400}
                />
                {/* Transparent clickable overlay for center label */}
                <div
                  className="absolute inset-0 flex items-center justify-center cursor-pointer"
                  style={{ pointerEvents: "none" }}
                  onClick={() => window.open(getIndexTradingViewUrl(contributor.indexName), '_blank')}
                >
                  <div
                    style={{
                      pointerEvents: "auto",
                      width: "35%",
                      height: "35%",
                    }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* List Section (No Changes needed here, kept as is) */}
        <div className="w-full lg:w-1/2 xl:w-3/5">
          <div
            className="rounded-lg p-4 h-96 overflow-y-auto not-dark:bg-primary-light"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.1)",
              scrollbarWidth: "thin",
              scrollbarColor: "#4A5568 #2D3748",
            }}
          >
            <style>
              {`
                .rounded-lg::-webkit-scrollbar { width: 8px; }
                .rounded-lg::-webkit-scrollbar-track { background: #2D3748; }
                .rounded-lg::-webkit-scrollbar-thumb { background: #4A5568; border-radius: 4px; }
                .rounded-lg::-webkit-scrollbar-thumb:hover { background: #718096; }
              `}
            </style>
            <h3 className="font-bold mb-4 text-lg">Top Contributors</h3>
            <div className="space-y-2 h-full">
              {!isSubscribed ? (
                <Lock />
              ) : (
                topContributors.map((contributorItem, index) => (
                  <a
                    key={index}
                    href={getStockTradingViewUrl(contributorItem.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center py-2 px-3 rounded cursor-pointer"
                  >
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: chartColors[index] }}
                    />
                    <span className="flex-1 truncate">{contributorItem.name}</span>
                    <span
                      className={`ml-2 font-medium ${
                        contributorItem.points > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {contributorItem.points > 0 ? "+" : ""}
                      {contributorItem.points}
                    </span>
                  </a>
                ))
              )}
              {isSubscribed && otherContributionsPercent > 0 && (
                <div className="flex items-center pt-2 border-t border-gray-700 mt-2 py-2 px-3 rounded">
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{
                      backgroundColor: chartColors[topContributors.length],
                    }}
                  />
                  <span className="flex-1">
                    Other {contributor.contributions.slice(10).length} stocks
                  </span>
                  <span
                    className={`ml-2 font-medium ${
                      otherContributionsPoints > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {otherContributionsPoints > 0 ? "+" : ""}
                    {otherContributionsPoints.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionDataDonutChart;