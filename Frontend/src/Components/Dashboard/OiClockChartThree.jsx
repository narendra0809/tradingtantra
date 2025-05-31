/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const OiClockChartThree = ({ data }) => {
  const formattedData = [
    { name: "Bulls", value: data.totalOiCE, color: "#007BFF" },
    { name: "Bears", value: data.totalOiPE, color: "#95025A" },
  ];
  const pcr = (formattedData[1].value / formattedData[0].value).toFixed(2);
  return (
    <div className="dark:bg-db-secondary  bg-db-secondary-light min-h-[375px] p-6 rounded-lg text-white shadow-lg w-full  ">
      <div className="flex justify-between items-center">
        {/* Donut Chart */}
        <PieChart width={300} height={300}>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={140}
            dataKey="value"
            label={({ _, percent }) => `${(percent * 100).toFixed(2)}%`}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>

        {/* OI Details */}
        <div className="text-sm space-y-2">
          <div className="mt-4 flex flex-col items-center ">
            <div className="flex">
              <p>
                Total Bulls OI:{" "}
                <span className="font-medium bg-[#0256F5] text-white px-1 py-px rounded-full ">
                  {formattedData[0].value}
                </span>
              </p>
              <p>
                Total Bears OI:{" "}
                <span className="font-medium bg-[#95025A] px-1 py-px rounded-full">
                  {formattedData[1].value}
                </span>
              </p>
            </div>
            <p className="mt-2">
              PCR: <span className="font-bold">{pcr}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OiClockChartThree;
