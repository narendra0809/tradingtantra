/* eslint-disable react/prop-types */
import Chart from "react-apexcharts";
import Lock from "./Lock";
import { useSelector } from "react-redux";

const OptionDataDonutChart = ({ contributor, allIndexPts, isSubscribed }) => {
  const indexPts = allIndexPts[contributor.indexName]?.pts || 1;
 const theme = useSelector((state) => state.theme.theme);

  const topContributors = contributor.contributions
    .sort((a, b) => Math.abs(b.points) - Math.abs(a.points))
    .slice(0, 10)
    .map((item) => ({
      name: item.displayName,
      points: parseFloat(item.points.toFixed(2)),
      percent: Math.abs((item.points / indexPts) * 100),
    }));

  const otherContributionsPoints = contributor.contributions
    .slice(10)
    .reduce((sum, item) => sum + item.points, 0);

  const otherContributionsPercent = parseFloat(
    Math.abs((otherContributionsPoints / indexPts) * 100).toFixed(2)
  );

  const chartSeries =
    otherContributionsPercent > 0
      ? [...topContributors.map((s) => s.percent), otherContributionsPercent]
      : topContributors.map((s) => s.percent);

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
        dropShadow: {
          enabled: true,
          top: 0,
          left: 0,
          blur: 10,
          opacity: 0.2,
        },
      },
      labels: chartLabels,
      colors: chartColors,
      stroke: {
        width: 2,
        // colors: ["#01071C"],
         colors: theme=="dark" ? ["#01071C"] :["#FFF"],
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "12px",
          fontWeight: "bold",
          colors: ["#000"],
        },
        dropShadow: {
          enabled: false,
        },
        offset: 5,
        minAngleToShowLabel: 1,
      },
      plotOptions: {
        pie: {
          donut: {
            size: "70%",
            labels: {
              show: true,
              name: {
                color: "#000",
              },
              value: {
                color: indexPts <0 ? "#9B3B44" : "#269F3C",
                fontSize: "16px",
                fontWeight: "bold",
                formatter: function (val) {
                  return val ? val.toFixed(1) + "%" : "";
                },
              },
              total: {
                show: true,
                showAlways: true,
                label: contributor.indexName,
                color: indexPts < 0 ? "#F44336" : "#4CAF50", // Red if negative, green if positive
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
      legend: {
        show: false,
      },
      tooltip: {
        enabled: true,
        style: {
          fontSize: "14px",
        },
        y: {
          formatter: function (val) {
            return val.toFixed(1) + "%";
          },
        },
      },
    },
  };

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
        <div className="w-full lg:w-1/2 xl:w-2/5 flex justify-center">
          <div className="w-full max-w-md h-[400px]">
            {!isSubscribed ? (
              <Lock />
            ) : (
              <Chart
                options={chartData.options}
                series={chartData.series}
                type="donut"
                width="100%"
                height={400}
              />
            )}
          </div>
        </div>

        <div className="w-full lg:w-1/2 xl:w-3/5">
          <div
            className="rounded-lg p-4 h-96 overflow-y-auto not-dark:bg-primary-light"
            style={{
              // backgroundColor: "#01071C",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              /* Custom scrollbar styles for dark theme */
              scrollbarWidth: "thin" /* For Firefox */,
              scrollbarColor: "#4A5568 #2D3748" /* Thumb and track colors */,
            }}
          >
            <style>
              {`
                /* Webkit browsers (Chrome, Safari, Edge) */
                .rounded-lg::-webkit-scrollbar {
                  width: 8px;
                }
                .rounded-lg::-webkit-scrollbar-track {
                  background: #2D3748; /* Dark track */
                }
                .rounded-lg::-webkit-scrollbar-thumb {
                  background: #4A5568; /* Dark thumb */
                  border-radius: 4px;
                }
                .rounded-lg::-webkit-scrollbar-thumb:hover {
                  background: #718096; /* Lighter thumb on hover */
                }
              `}
            </style>
            <h3 className=" font-bold mb-4 text-lg">
              Top Contributors
            </h3>
            <div className="space-y-2 h-full">
              {!isSubscribed ? (
                <Lock />
              ) : (
                topContributors.map((contributor, index) => (
                  <div
                    key={index}
                    className="flex items-center py-2 px-3 rounded transition-colors"
                  >
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: chartColors[index] }}
                    />
                    <span className=" flex-1 truncate">
                      {contributor.name}
                    </span>
                    <span
                      className={`ml-2 font-medium ${
                        contributor.points > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {contributor.points > 0 ? "+" : ""}
                      {contributor.points}
                    </span>
                  </div>
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
                  <span className=" flex-1">
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
