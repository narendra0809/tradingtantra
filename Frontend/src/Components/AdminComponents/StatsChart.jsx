/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1c1f3a] text-white text-sm px-3 py-1 rounded shadow-md">
        <p className="font-medium">{`${payload[0].payload.title}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const HorizontalBarChart = ({ statData }) => {
  const [chartData, setChartData] = useState([
    { title: "Total Users", value: 0, fill: "#E56A54" },
    { title: "Total Active User", value: 0, fill: "#DEB250" },
    { title: "Total Amount", value: 0, fill: "#EA4D2D" },
  ]);

  useEffect(() => {
    if (statData) {
      setChartData([
        {
          title: "Total Users",
          value: statData.totalUsers || 0,
          fill: "#E56A54",
        },
        {
          title: "Total Active User",
          value: statData.activeUsers || 0,
          fill: "#DEB250",
        },
        {
          title: "Total Amount",
          value: statData.totalAmount || 0,
          fill: "#EA4D2D",
        },
      ]);
    }
  }, [statData]);

  return (
    <div className="w-full h-full p-4">
      <div className="h-full w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
            barSize={30}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2E334B"
              horizontal={false}
            />
            <XAxis
              type="number"
              stroke="#B0B3C2"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="title"
              type="category"
              stroke="#B0B3C2"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "12px",
              }}
              payload={[
                {
                  value: "Current Stats",
                  type: "square",
                  color: "#66ffcc",
                },
              ]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={1500}>
              <LabelList
                dataKey="value"
                position="right"
                fill="#fff"
                style={{ fontSize: 12 }}
                formatter={(value) => value.toLocaleString()}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HorizontalBarChart;
