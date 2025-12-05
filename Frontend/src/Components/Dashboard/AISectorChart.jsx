// /* eslint-disable react/prop-types */
// import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { useMediaQuery } from "react-responsive";
// import {
//   Bar,
//   BarChart,
//   Cell,
//   Rectangle,
//   ReferenceLine,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";

// const AISectorChart = ({ data, handleGoToTable }) => {
//   const isMobile = useMediaQuery({ maxWidth: 768 });
//   const theme = useSelector((state) => state.theme.theme);
//   const [yScale, setYScale] = useState(null);

//   const [sectorWisePercentageChange, setSectorWisePercentageChange] = useState(
//     []
//   );

//   useEffect(() => {
//     const updatedData = Object.entries(data)
//       .filter(([sector]) => sector !== "Uncategorized")
//       .map(([sector, values]) => {
//         let totalPercentage = values.reduce(
//           (sum, element) => sum + element.percentageChange,
//           0
//         );
//         const averagePercentageChange = totalPercentage / values.length;
//         return {
//           name: sector,
//           value: Number(averagePercentageChange.toFixed(2)),
//         };
//       })
//       // Sort by value (descending) and then alphabetically by name for equal values
//       .sort((a, b) => {
//         if (a.value === b.value) {
//           return a.name.localeCompare(b.name); // Alphabetical sort for same value
//         }
//         return b.value - a.value; // Sort by value in descending order
//       });

//     setSectorWisePercentageChange(updatedData);
//   }, [data]);

//   const CustomBar = (props) => {
//     const { fill, x, y, width, height, name } = props;
//     const chartHeight = 450; // Match your chart height
//     const marginBottom = isMobile ? 100 : 20;
//     const effectiveHeight = chartHeight - marginBottom;

//     return (
//       <g onClick={() => handleGoToTable(name)} style={{ cursor: "pointer" }}>
//         {/* The visible bar */}
//         <Rectangle
//           x={x}
//           y={y}
//           width={width}
//           height={height}
//           fill={fill}
//           radius={[5, 5, 0, 0]}
//         />
//         {/* Invisible clickable area that covers the full height */}
//         <Rectangle
//           x={x}
//           y={0}
//           width={width}
//           height={effectiveHeight}
//           fill="transparent"
//         />
//       </g>
//     );
//   };

//   if (sectorWisePercentageChange.length === 0) {
//     return (
//       <div className="w-full h-[500px] flex items-center justify-center dark:bg-db-secondary bg-primary-light p-5 rounded-lg shadow-lg">
//         <p>Loading or missing data...</p>
//       </div>
//     );
//   }

//   const barSize = isMobile ? 15 : 30;
//   const barGap = isMobile ? 8 : 15;
//   const marginBottom = isMobile ? 100 : 20;

//   return (
//     <div
//       className={`w-full overflow-x-auto overflow-y-hidden bg-[#EEEEEE] ${"h-[500px]"}`}
//     >
//       <div className="min-w-[800px] h-full dark:bg-db-secondary bg-[#EEEEEE] p-3 rounded-lg shadow-lg">
//         <ResponsiveContainer width="100%" height={450}>
//           <BarChart
//             data={sectorWisePercentageChange}
//             barCategoryGap={barGap}
//             margin={{
//               top: 20,
//               right: isMobile ? 10 : 30,
//               left: isMobile ? 10 : 20,
//               bottom: marginBottom,
//             }}
//           >
//             {/* <YAxis
//               type="number"
//               stroke={theme === "dark" ? "#fff" : "#000000"}
//               tick={{
//                 fill: theme === "dark" ? "#fff" : "#000", // ✅ tick text color
//                 fontSize: isMobile ? 10 : 12,
//               }}
//               width={isMobile ? 30 : 40}
//             /> */}
//             <YAxis
//               type="number"
//               stroke={theme === "dark" ? "#fff" : "#000000"}
//               tick={{
//                 fill: theme === "dark" ? "#fff" : "#000",
//                 fontSize: isMobile ? 10 : 12,
//               }}
//               width={isMobile ? 30 : 40}
//               domain={["dataMin", "dataMax"]}
//               tickFormatter={(value, index, ticks) => {
//                 if (ticks && ticks.length && ticks[0].coordinate != null) {
//                   const scale = (v) => {
//                     const t = ticks.find((t) => t.value === v);
//                     return t ? t.coordinate : 0;
//                   };
//                   setYScale(() => scale);
//                 }
//                 return value;
//               }}
//             />

//             <ReferenceLine
//               y={0}
//               stroke={theme === "dark" ? "#fff" : "#000"}
//               strokeWidth={1.5}
//               enableBackground={"#000"}
//             />

//             <Tooltip
//               cursor={{ fill: "rgba(255,255,255,0.1)" }}
//               contentStyle={{
//                 backgroundColor: theme === "dark" ? "#000A2D" : "#273d8f",
//                 borderRadius: "5px",
//                 borderColor: theme === "dark" ? "#fff" : "#000",
//                 fontSize: isMobile ? 10 : 14,
//                 color: "white",
//               }}
//               itemStyle={{ color: "#fff" }}
//             />
//             <ReferenceLine y={0} stroke={"#fff"} strokeWidth={1} />
//             <Bar
//               dataKey="value"
//               barSize={barSize}
//               shape={<CustomBar />}
//               nameAccessor="name"
//             >
//               {sectorWisePercentageChange?.map((entry, index) => (
//                 <Cell
//                   key={`cell-${index}`}
//                   fill={entry.value >= 0 ? "#0256F5" : "#95025A"}
//                   name={entry.name}
//                 />
//               ))}
//             </Bar>
//             <XAxis
//               dataKey="name"
//               interval={0}
//               tickLine={false}
//               axisLine={false}
//               tick={{ fill: theme === "dark" ? "#fff" : "#000", fontSize: 12 }}
//             />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default AISectorChart;

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
  // XAxis,
  YAxis,
} from "recharts";

const AISectorChart = ({ data, handleGoToTable }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const theme = useSelector((state) => state.theme.theme);
  // const [yScale, setYScale] = useState(null);
  const [zeroY, setZeroY] = useState(null);

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
      .sort((a, b) => {
        if (a.value === b.value) {
          return a.name.localeCompare(b.name);
        }
        return b.value - a.value;
      });

    setSectorWisePercentageChange(updatedData);
  }, [data]);

  // Custom tick component for conditional positioning
  // const CustomTick = ({ x, payload }) => {
  //   if (zeroY == null) return null;

  //   const dataPoint = sectorWisePercentageChange.find(
  //     (item) => item.name === payload.value
  //   );
  //   const value = dataPoint?.value ?? 0;

  //   const offset = 10; // tweak this for spacing
  //   const y = value > 0 ? zeroY + offset : zeroY - offset;

  //   return (
  //     <g transform={`translate(${x},${y})`}>
  //       <text
  //         x={0}
  //         y={0}
  //         textAnchor="middle"
  //         fill={theme === "dark" ? "#fff" : "#000"}
  //         fontSize={12}
  //         transform="rotate(-90)" // keeps labels vertical
  //         dominantBaseline="middle"
  //       >
  //         {payload.value}
  //       </text>
  //     </g>
  //   );
  // };

  const CustomBar = (props) => {
    const { fill, x, y, width, height, name } = props;
    const chartHeight = 450;
    const marginBottom = isMobile ? 100 : 20;
    const effectiveHeight = chartHeight - marginBottom;

    return (
      <g onClick={() => handleGoToTable(name)} style={{ cursor: "pointer" }}>
        <Rectangle
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          radius={[5, 5, 0, 0]}
        />
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

  if (sectorWisePercentageChange.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center dark:bg-db-secondary bg-primary-light p-5 rounded-lg shadow-lg">
        <p>Loading or missing data...</p>
      </div>
    );
  }

  const barSize = isMobile ? 15 : 30;
  const barGap = isMobile ? 8 : 15;
  const marginBottom = isMobile ? 100 : 80; // Increased for vertical labels

  return (
    <div
      className={`w-full overflow-x-auto overflow-y-hidden bg-[#EEEEEE] ${"h-[500px]"}`}
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
                if (ticks && ticks.length) {
                  const zeroTick = ticks.find((t) => t.value === 0);
                  // pixel Y of the reference line (0 on YAxis)
                  const zeroCoord = zeroTick
                    ? zeroTick.coordinate
                    : ticks[0].coordinate;
                  setZeroY(zeroCoord);
                }
                return value;
              }}
            />

            <ReferenceLine
              y={0}
              stroke={theme === "dark" ? "#fff" : "#000"}
              strokeWidth={1.5}
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

              {/* Vertical labels above/below reference line */}
              <LabelList
                dataKey="value"
                content={(props) => {
                  const { x, y, width, height, index } = props;
                  const item = sectorWisePercentageChange[index];
                  if (!item) return null;

                  const isPositive = item.value > 0;
                  const baseY = y + height;

                  // move label just below (positive) or just above (negative/0) that base
                  const offset = 50;
                  const labelY = isPositive ? baseY + offset : baseY - offset;
                  const labelX = x + width / 2;

                  return (
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={theme === "dark" ? "#fff" : "#000"}
                      fontSize={12}
                      transform={`rotate(-90, ${labelX}, ${labelY})`} // vertical
                      style={{ pointerEvents: "none" }} // so clicks go to bar
                    >
                      {item.name}
                    </text>
                  );
                }}
              />
            </Bar>

            {/* <XAxis
              dataKey="name"
              interval={0}
              tickLine={false}
              axisLine={false}
              // tick={<CustomTick />}
            /> */}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AISectorChart;
