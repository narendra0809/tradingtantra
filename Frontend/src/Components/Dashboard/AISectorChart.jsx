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
  Rectangle,
} from "recharts";
import { useMediaQuery } from "react-responsive";

const AISectorChart = ({ data, handleGoToTable }) => {
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
      return {
        name: sector,
        value: Number(averagePercentageChange.toFixed(2)),
      };
    })
    // Sort by value (descending) and then alphabetically by name for equal values
    .sort((a, b) => {
      if (a.value === b.value) {
        return a.name.localeCompare(b.name); // Alphabetical sort for same value
      }
      return b.value - a.value; // Sort by value in descending order
    });

  setSectorWisePercentageChange(updatedData);
}, [data]);

  const renderCustomXAxisTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})${isMobile ? " rotate(-90)" : ""}`}>
        <text
          x={0}
          y={0}
          dy={10}
          textAnchor={isMobile ? "end" : "middle"}
          fill={theme === "dark" ? "#fff" : "#000"}
          fontSize={isMobile ? 10 : 12}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  // Custom bar component with click handler for the entire area
  const CustomBar = (props) => {
    const { fill, x, y, width, height, name } = props;
    const chartHeight = 450; // Match your chart height
    const marginBottom = isMobile ? 100 : 20;
    const effectiveHeight = chartHeight - marginBottom;

    return (
      <g onClick={() => handleGoToTable(name)} style={{ cursor: "pointer" }}>
        {/* The visible bar */}
        <Rectangle
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          radius={[5, 5, 0, 0]}
        />
        {/* Invisible clickable area that covers the full height */}
        <Rectangle
          x={x}
          y={0}
          width={width}
          height={effectiveHeight}
          fill="transparent"
        />
      </g>
    );
  };

  // Handle empty data state
  if (sectorWisePercentageChange.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center dark:bg-db-secondary bg-db-primary p-5 rounded-lg shadow-lg">
        <p>Loading or missing data...</p>
      </div>
    );
  }

  const barSize = isMobile ? 15 : 30;
  const barGap = isMobile ? 8 : 15;
  const xAxisHeight = isMobile ? 100 : 30;
  const marginBottom = isMobile ? 100 : 20;

  return (
    <div
      className={`w-full overflow-x-auto overflow-y-hidden ${
        isMobile ? "h-[350px]" : "h-[500px]"
      }`}
    >
      <div className="min-w-[600px] md:min-w-full h-[400px] md:h-[500px] dark:bg-db-secondary bg-db-primary p-0 md:p-5 lg:p-3 rounded-lg shadow-lg">
        <ResponsiveContainer width="100%" height={450}>
          <BarChart
            data={sectorWisePercentageChange}
            barCategoryGap={barGap}
            margin={{
              top: 20,
              right: isMobile ? 10 : 30,
              left: isMobile ? 10 : 20,
              bottom: marginBottom,
            }}
          >
            <XAxis
              dataKey="name"
              tick={renderCustomXAxisTick}
              interval={0}
              height={xAxisHeight}
              stroke={theme === "dark" ? "#fff" : "#000"}
            />
            <YAxis
              type="number"
              stroke={theme === "dark" ? "#fff" : "#000"}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 30 : 40}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.1)" }}
              contentStyle={{
                backgroundColor: "#000A2D",
                borderRadius: "5px",
                borderColor: theme === "dark" ? "#fff" : "#000",
                fontSize: isMobile ? 10 : 14,
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
              barSize={barSize}
              shape={<CustomBar />}
              nameAccessor="name"
            >
              {sectorWisePercentageChange?.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value >= 0 ? "#0256F5" : "#95025A"}
                  name={entry.name}
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
