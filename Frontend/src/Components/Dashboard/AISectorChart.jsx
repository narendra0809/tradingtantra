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
          dy={5}
          dx={-5}
          textAnchor="end"
          fill={theme === "dark" ? "#fff" : "#000"}
          transform={`${isMobile ? "rotate(-90)" : "rotate(-85)"}`}
          fontSize={isMobile ? 10 : 14}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className=" dark:bg-db-secondary bg-db-primary  rounded-lg shadow-md w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={sectorWisePercentageChange}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis
            dataKey="name"
            tick={renderCustomXAxisTick}
            interval={0}
            height={120}
            stroke={theme === "dark" ? "#fff" : "#000"}
          />
          <YAxis stroke={theme === "dark" ? "#fff" : "#000"} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.1)" }}
            contentStyle={{
              backgroundColor: "#000A2D",
              borderRadius: "5px",
              borderColor: theme === "dark" ? "#fff" : "#000",
            }}
            itemStyle={{ color: "#fff" }}
          />
          <ReferenceLine
            y={0}
            stroke={theme === "dark" ? "#fff" : "#000"}
            strokeWidth={1}
          />
          <Bar dataKey="value" barSize={30} radius={[5, 5, 0, 0]}>
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
  );
};

export default AISectorChart;
