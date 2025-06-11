/* eslint-disable react/prop-types */
import {
  RadialBarChart,
  RadialBar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Total User",
    value: 300,
    fill: "#00C49F",
  },
  {
    name: "Total Active User",
    value: 200,
    fill: "#F4C542",
  },
  {
    name: "Total Amount",
    value: 400,
    fill: "#F2523C",
  },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1B2135] text-white p-2 rounded text-sm shadow-lg">
        <p className="font-medium">{payload[0].payload.name}</p>
        <p>{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const StatusByProcessChart = () => {
  return (
    <div className=" rounded-xl p-4 w-[300px] h-[330px] flex flex-col justify-between">
      <div>
        <ResponsiveContainer width="100%" height={230}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="35%"
            outerRadius="100%"
            barSize={10}
            data={data}
            startAngle={180}
            endAngle={-180}
          >
            <RadialBar
              minAngle={15}
              clockWise
              background
              dataKey="value"
              cornerRadius={10}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Center Text */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-white text-[14px]"
            >
              <tspan fill="#fff" fontSize="14">
                Total
              </tspan>
              <tspan x="50%" dy="18" fill="#fff" fontSize="14" fontWeight="600">
                500
              </tspan>
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <div className="flex justify-around text-xs text-[#B0B3C0] mt-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.fill }}
            ></span>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusByProcessChart;
