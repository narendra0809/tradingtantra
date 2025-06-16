/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { useMediaQuery } from "react-responsive";

const AISectorChart = ({ data }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const theme = useSelector((state) => state.theme.theme);

  const [sectorWisePercentageChange, setSectorWisePercentageChange] = useState(
    []
  );

  useEffect(() => {
    const updatedData = Object.entries(data)
      .filter(([sector]) => sector !== "Uncategorized")
      .map(([sector, values]) => {
        let totalPercentage = values.reduce(
          (sum, element) => sum + element.percentageChange,
          0
        );
        const averagePercentageChange = totalPercentage / values.length;
        return { name: sector, value: averagePercentageChange };
      });

    setSectorWisePercentageChange(updatedData);
  }, [data]);

  const renderCustomXAxisTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill={theme === "dark" ? "#fff" : "#000"}
          fontSize={isMobile ? 11 : 12}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="dark:bg-db-secondary bg-db-primary rounded-lg shadow-md w-full overflow-x-auto p-4">
      <div
        style={{
          width: isMobile
            ? `${Math.max(800, sectorWisePercentageChange.length * 80)}px`
            : "100%",
          height: isMobile ? 400 : 350,
          minWidth: "100%",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sectorWisePercentageChange}
            margin={{
              top: 20,
              right: isMobile ? 20 : 30,
              left: isMobile ? 20 : 20,
              bottom: isMobile ? 40 : 5,
            }}
            barCategoryGap={isMobile ? 12 : 15}
          >
            <XAxis
              dataKey="name"
              tick={renderCustomXAxisTick}
              interval={0}
              height={isMobile ? 60 : 30}
              stroke={theme === "dark" ? "#fff" : "#000"}
            />
            <YAxis
              type="number"
              stroke={theme === "dark" ? "#fff" : "#000"}
              tick={{ fontSize: isMobile ? 11 : 12 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.1)" }}
              contentStyle={{
                backgroundColor: "#000A2D",
                borderRadius: "5px",
                borderColor: theme === "dark" ? "#fff" : "#000",
                fontSize: isMobile ? 12 : 14,
              }}
              itemStyle={{ color: "#fff" }}
            />
            <ReferenceLine
              y={0}
              stroke={theme === "dark" ? "#fff" : "#000"}
              strokeWidth={1}
            />
            <Bar
              dataKey="value"
              barSize={isMobile ? 25 : 30}
              radius={[5, 5, 0, 0]}
            >
              {sectorWisePercentageChange?.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value >= 0 ? "#0256F5" : "#95025A"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AISectorChart;
