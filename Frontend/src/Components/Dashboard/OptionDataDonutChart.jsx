/* eslint-disable react/prop-types */
import Chart from "react-apexcharts";

const OptionDataDonutChart = ({ contributor, allIndexPts }) => {
  const indexPts = allIndexPts[contributor.indexName]?.pts || 1;

  const topContributors = contributor.contributions
    .slice(0, 10)
    .map((item) => ({
      name: item.displayName,
      points: parseFloat(item.points.toFixed(2)),
      percent: Math.abs((item.points / indexPts) * 100),
    }));

  const otherContributions = contributor.contributions
    .slice(10)
    .reduce((sum, item) => sum + Math.abs((item.points / indexPts) * 100), 0);

  const chartSeries =
    otherContributions > 0
      ? [
          ...topContributors.map((s) => s.percent),
          parseFloat(otherContributions.toFixed(2)),
        ]
      : topContributors.map((s) => s.percent);

  const chartLabels =
    otherContributions > 0
      ? [
          ...topContributors.map(
            (s) => `${s.name} (${s.points > 0 ? "+" : ""}${s.points})`
          ),
          `Others (${contributor.contributions.slice(10).length} stocks)`,
        ]
      : topContributors.map(
          (s) => `${s.name} (${s.points > 0 ? "+" : ""}${s.points})`
        );

  // Updated color scheme with normal green/red and gradient based on contribution
  const getColor = (percent, points) => {
    const maxPercent = Math.max(...topContributors.map((s) => s.percent));
    const intensity = percent / maxPercent; // Scale from 0 to 1 based on contribution size

    if (points > 0) {
      // Positive contributions - green with varying opacity
      const opacity = 0.4 + intensity * 0.6; // Range from 0.4 to 1.0
      return `rgba(76, 175, 80, ${opacity})`;
    } else {
      // Negative contributions - red with varying opacity
      const opacity = 0.4 + intensity * 0.6; // Range from 0.4 to 1.0
      return `rgba(244, 67, 54, ${opacity})`;
    }
  };

  const chartColors =
    otherContributions > 0
      ? [
          ...topContributors.map((s) => getColor(s.percent, s.points)),
          "#888888",
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
        colors: ["#01071C"],
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "12px",
          fontWeight: "bold",
          colors: ["#fff"],
        },
        dropShadow: {
          enabled: false,
        },
        // formatter: function (val) {
        //   return val > 0.1 ? val.toFixed(1) + "%" : "";
        // },
        offset: 5,
        minAngleToShowLabel: 1,
      },
      plotOptions: {
        pie: {
          donut: {
            size: "70%",
            // background: "#01071C",
            labels: {
              show: true,
              name: {
                color: "#fff",
              },
              value: {
                color: "#fff",
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
                color: "#ffffff",
                fontSize: "18px",
                fontWeight: 600,
                formatter: function () {
                  return `${Math.abs(indexPts.toFixed(2))} pts`;
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
        {/* Donut Chart - Left side on large screens */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex justify-center">
          <div className="w-full max-w-md">
            <Chart
              options={chartData.options}
              series={chartData.series}
              type="donut"
              width="100%"
              height={400}
            />
          </div>
        </div>

        {/* Custom Legend - Right side on large screens */}
        <div className="w-full lg:w-1/2 xl:w-3/5">
          <div
            className="rounded-lg p-4 h-96 overflow-y-auto"
            style={{
              backgroundColor: "#01071C",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <h3 className="text-white font-bold mb-4 text-lg">
              Top Contributors
            </h3>
            <div className="space-y-2">
              {topContributors.map((contributor, index) => (
                <div
                  key={index}
                  className="flex items-center py-2 px-3 rounded  transition-colors"
                >
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: chartColors[index] }}
                  />
                  <span className="text-white flex-1 truncate">
                    {contributor.name}
                  </span>
                  <span
                    className={`ml-2 font-medium ${
                      contributor.points > 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {contributor.points > 0 ? "+" : ""}
                    {contributor.points}
                  </span>
                  {/* <span className="text-gray-400 ml-2 w-16 text-right">
                    ({contributor.percent.toFixed(1)}%)
                  </span> */}
                </div>
              ))}
              {otherContributions > 0 && (
                <div className="flex items-center pt-2 border-t border-gray-700 mt-2 py-2 px-3 rounded">
                  <div className="w-4 h-4 rounded-full mr-3 bg-gray-500" />
                  <span className="text-white flex-1">
                    Other {contributor.contributions.slice(10).length} stocks
                  </span>
                  <span className="text-gray-400 ml-2 w-16 text-right">
                    ({otherContributions.toFixed(1)}%)
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
