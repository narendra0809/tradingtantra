/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AISectorChart = ({ data, handleGoToTable }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const theme = useSelector((state) => state.theme.theme);
  const [yScale, setYScale] = useState(null);

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
      <div className="w-full h-[500px] flex items-center justify-center dark:bg-db-secondary bg-primary-light p-5 rounded-lg shadow-lg">
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
      className={`w-full overflow-x-auto overflow-y-hidden bg-[#EEEEEE] ${
        isMobile ? "h-[350px]" : "h-[500px]"
      }`}
    >
      <div className="min-w-[800px] h-full dark:bg-db-secondary bg-[#EEEEEE] p-3 rounded-lg shadow-lg">
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
            {/* <YAxis
              type="number"
              stroke={theme === "dark" ? "#fff" : "#000000"}
              tick={{
                fill: theme === "dark" ? "#fff" : "#000", // ✅ tick text color
                fontSize: isMobile ? 10 : 12,
              }}
              width={isMobile ? 30 : 40}
            /> */}
            <YAxis
              type="number"
              stroke={theme === "dark" ? "#fff" : "#000000"}
              tick={{
                fill: theme === "dark" ? "#fff" : "#000",
                fontSize: isMobile ? 10 : 12,
              }}
              width={isMobile ? 30 : 40}
              domain={["dataMin", "dataMax"]}
              tickFormatter={(value, index, ticks) => {
                if (ticks && ticks.length && ticks[0].coordinate != null) {
                  const scale = (v) => {
                    const t = ticks.find((t) => t.value === v);
                    return t ? t.coordinate : 0;
                  };
                  setYScale(() => scale);
                }
                return value;
              }}
            />

            <ReferenceLine
              y={0}
              stroke={theme === "dark" ? "#fff" : "#000"}
              strokeWidth={1.5}
              enableBackground={"#000"}
            />

            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.1)" }}
              contentStyle={{
                backgroundColor: theme === "dark" ? "#000A2D" : "#273d8f",
                borderRadius: "5px",
                borderColor: theme === "dark" ? "#fff" : "#000",
                fontSize: isMobile ? 10 : 14,
                color: "white",
              }}
              itemStyle={{ color: "#fff" }}
            />
            <ReferenceLine y={0} stroke={"#fff"} strokeWidth={1} />
            {/* <Bar
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

              <LabelList
                dataKey="name"
                content={({ x, y, width, height, value }) => {
                  const isNegative = height < 0;

                  // Add some distance from the bar
                  const offset = 20; // adjust as per your UI

                  const textY = isNegative ? 170 - offset : 240 + offset;

                  const textColor = theme === "dark" ? "#FFF" : "#000";

                  return (
                    <text
                      x={x + width / 2}
                      y={textY}
                      textAnchor="middle"
                      fill={textColor}
                      fontSize={12}
                      transform={`rotate(-90, ${x + width / 2}, ${textY})`}
                    >
                      {value}
                    </text>
                  );
                }}
              />
            </Bar> */}
            {/* <XAxis
              dataKey="name"
              interval={0}
              tickLine={false}
              axisLine={false}
              tick={{ fill: theme === "dark" ? "#fff" : "#000", fontSize: 12 }}
            /> */}

            <Bar dataKey="value" barSize={barSize} shape={<CustomBar />}>
              {sectorWisePercentageChange.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value >= 0 ? "#0256F5" : "#95025A"}
                />
              ))}

              <LabelList
                dataKey="name"
                content={({ x, y, width, value }) => {
                  const isNegative = value < 0;
                  const offset = 12; // distance from x-axis

                  // y here is top of the bar; ReferenceLine at 0 is in the middle,
                  // so for positive bars the x-axis is below top, for negative above.
                  const textY = isNegative ? y - offset : y + offset;

                  const textColor = theme === "dark" ? "#FFF" : "#000";

                  return (
                    <text
                      x={x + width / 2}
                      y={textY}
                      textAnchor="middle"
                      fill={textColor}
                      fontSize={12}
                    >
                      {value}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AISectorChart;
