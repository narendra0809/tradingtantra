/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { lotSize } from "../../constants/constants";
import { useMediaQuery } from "react-responsive";

const OiClockChartThree = ({ data, selectedIndex }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const formattedData = [
    {
      name: "Bulls",
      value: Math.round(data.totalOiCE / lotSize[selectedIndex]),
      color: "#007BFF",
    },
    {
      name: "Bears",
      value: Math.round(data.totalOiPE / lotSize[selectedIndex]),
      color: "#95025A",
    },
  ];
  const pcr = (formattedData[1].value / formattedData[0].value).toFixed(2);
  return (
    <div className="dark:bg-db-secondary  bg-db-primary min-h-[375px] rounded-lg text-white shadow-lg w-full  ">
      <div className="flex justify-between items-center">
        {/* Donut Chart */}
        <PieChart width={300} height={400}>
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
        <div className={`${isMobile ? "text-sm" : "text-lg"} space-y-2`}>
          <div className="mt-4 flex flex-col items-center ">
            <div className="flex gap-3">
              <p
                className={`flex ${
                  isMobile ? "flex-col text-nowrap" : "flex-row"
                } items-center gap-2`}
              >
                <span>Total Bulls OI: </span>
                <span
                  className="font-medium bg-[#0256F5] text-white p-2
                 rounded-lg "
                >
                  {formattedData[0].value}
                </span>
              </p>
              <p
                className={`flex ${
                  isMobile ? "flex-col text-nowrap" : "flex-row"
                } items-center gap-2`}
              >
                <span>Total Bears OI: </span>
                <span className="font-medium bg-[#95025A] p-2 rounded-lg">
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
