/* eslint-disable react/prop-types */
import { useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const CustomBarChart = ({ data }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const theme = useSelector((state) => state.theme.theme);

  const renderCustomXAxisTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill="#ccc"
          fontSize={isMobile ? 10 : 12}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        height: isMobile ? 300 : 250,
        padding: isMobile ? "10px" : "20px",
        borderRadius: "10px",
        overflowX: isMobile ? "auto" : "hidden",
        overflowY: "hidden",
      }}
      className="dark:bg-db-secondary bg-[#EEEEEE]"
    >
      <div
        style={{
          width: isMobile ? `${Math.max(700, data.length * 80)}px` : "100%",
          minWidth: "100%",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <div>
            <ResponsiveContainer width="100%" height={isMobile ? 220 : 180}>
              <BarChart
                data={data}
                margin={{
                  top: 10,
                  right: isMobile ? 15 : 30,
                  left: isMobile ? 15 : 20,
                  bottom: 5,
                }}
                barCategoryGap={isMobile ? 12 : 15}
              >
                <ReferenceLine y={0} stroke="#ccc" strokeWidth={1.5} />
                <Tooltip
                  contentStyle={{
                    color: "#fff",
                    backgroundColor: theme === "dark" ? "#000A2D" : "#273d8f",
                    borderRadius: "5px",
                    borderColor: "#ccc",
                    fontSize: isMobile ? 10 : 12,
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar
                  dataKey="fii_net"
                  fill="#95025A"
                  barSize={isMobile ? 12 : 10}
                  radius={[5, 5, 0, 0]}
                />
                <Bar
                  dataKey="dii_net"
                  fill="#0256F5"
                  barSize={isMobile ? 12 : 10}
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height={isMobile ? 60 : 40}>
              <BarChart
                data={data}
                margin={{
                  top: 0,
                  right: isMobile ? 15 : 30,
                  left: isMobile ? 15 : 20,
                  bottom: 5,
                }}
              >
                <XAxis
                  dataKey="date"
                  stroke="#ccc"
                  tick={renderCustomXAxisTick}
                  interval={0}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CustomBarChart;
