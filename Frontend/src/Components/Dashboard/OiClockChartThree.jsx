import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const data = [
  { name: "Bulls", value: 1319490, color: "#007BFF" }, // Blue
  { name: "Bears", value: 1578625, color: "#95025A" }, // Dark Pink
];

const totalOI = data.reduce((acc, item) => acc + item.value, 0);
const pcr = (data[1].value / data[0].value).toFixed(2); // Bears / Bulls

const OiClockChartThree = () => {
  return (
    <div className="dark:bg-db-secondary  bg-db-secondary-light min-h-[375px] p-6 rounded-lg text-white shadow-lg w-full  ">
      
      
      <div className="flex justify-between items-center">
        {/* Donut Chart */}
        <PieChart width={300} height={300}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={140}
            dataKey="value"
            label={({ name, percent }) => `${(percent * 100).toFixed(2)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>

        {/* OI Details */}
        <div className="text-sm space-y-2">

          <div className="mt-4 flex flex-col items-center ">

            <div className="flex">
            <p >Total Bulls OI: <span className="font-medium bg-[#0256F5] text-white px-1 py-px rounded-full ">{data[0].value.toLocaleString()}</span></p>
            <p >Total Bears OI: <span className="font-medium bg-[#95025A] px-1 py-px rounded-full">{data[1].value.toLocaleString()}</span></p>
            </div>
            <p className="mt-2">PCR: <span className="font-bold">{pcr}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OiClockChartThree;
