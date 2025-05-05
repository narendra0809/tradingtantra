import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const datasets = [
  [
    { time: "9:30 AM", fii: -30, dii: 50 },
    { time: "10:30 AM", fii: -50, dii: 40 },
    { time: "11:30 AM", fii: -20, dii: 70 },
    { time: "12:30 PM", fii: -40, dii: 60 },
    { time: "1:30 PM", fii: -10, dii: 80 },
    { time: "2:30 PM", fii: -50, dii: 30 },
    { time: "3:30 PM", fii: -40, dii: 50 },
  ],
];

const CustomBarChart = ({ data, loading }) => {
  console.log(data, "data");
  return (
    <div
      style={{
        width: "100%",
        height: "auto",
        padding: "20px",
        borderRadius: "10px",
      }}
      className="dark:bg-db-secondary bg-db-secondary-light"
    >
      <ResponsiveContainer width="100%" height="100%">
        <div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={data}
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              {/* Vertical Line at x=0 to separate positive and negative bars */}
              <ReferenceLine y={0} stroke="#ccc" strokeWidth={1.5} />
              {/* Tooltip */}
              <Tooltip />
              {/* Bars with defined colors, width, and rounded edges */}
              <Bar
                dataKey="fii_net"
                fill="#95025A"
                barSize={10}
                radius={[5, 5, 0, 0]}
              />
              <Bar
                dataKey="dii_net"
                fill="#0256F5"
                barSize={10}
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Single X-Axis at the bottom */}
          <ResponsiveContainer width="100%" height={40}>
            <BarChart
              data={data}
              margin={{ top: 0, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="date" stroke="#ccc" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomBarChart;
