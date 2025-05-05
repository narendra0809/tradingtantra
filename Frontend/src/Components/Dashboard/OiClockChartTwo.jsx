import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { price: 2600, value: 1000 },
  { price: 2550, value: -1000 },
];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white p-2 rounded shadow-lg">
        <p>Price: {payload[0].payload.price}</p>
        <p>Value: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const OiClockChartTwo = () => {
  return (
    <div className="w-full h-[375px] dark:bg-db-secondary bg-db-secondary-light p-5 rounded-lg shadow-lg">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={0} barSize={50}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1B263B" />
          <XAxis dataKey="price" tick={{ fill: "white" }} />
          <YAxis tick={{ fill: "white" }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
          
          {/* Bar with conditional color rendering */}
          <Bar dataKey="value" stroke="#0056b3" radius={[4, 4, 0, 0]} width={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.value < 0 ? "#95025A" : "#007BFF"} />
            ))}
          </Bar>

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OiClockChartTwo;
