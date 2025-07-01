// // // // /* eslint-disable react/prop-types */
// // // // import { useEffect, useState } from "react";
// // // // import { useSelector } from "react-redux";
// // // // import {
// // // //   BarChart,
// // // //   Bar,
// // // //   XAxis,
// // // //   YAxis,
// // // //   Tooltip,
// // // //   ResponsiveContainer,
// // // //   ReferenceLine,
// // // //   Cell,
// // // // } from "recharts";
// // // // import { useMediaQuery } from "react-responsive";

// // // // const AISectorChart = ({ data }) => {
// // // //   const isMobile = useMediaQuery({ maxWidth: 768 });
// // // //   const theme = useSelector((state) => state.theme.theme);

// // // //   const [sectorWisePercentageChange, setSectorWisePercentageChange] = useState(
// // // //     []
// // // //   );

// // // //   useEffect(() => {
// // // //     const updatedData = Object.entries(data)
// // // //       .filter(([sector]) => sector !== "Uncategorized")
// // // //       .map(([sector, values]) => {
// // // //         let totalPercentage = values.reduce(
// // // //           (sum, element) => sum + element.percentageChange,
// // // //           0
// // // //         );
// // // //         const averagePercentageChange = totalPercentage / values.length;
// // // //         return { name: sector, value: averagePercentageChange };
// // // //       });

// // // //     setSectorWisePercentageChange(updatedData);
// // // //   }, [data]);

// // // //   const renderCustomXAxisTick = ({ x, y, payload }) => {
// // // //     return (
// // // //       <g transform={`translate(${x},${y})`}>
// // // //         <text
// // // //           x={0}
// // // //           y={0}
// // // //           dy={16}
// // // //           textAnchor="middle"
// // // //           fill={theme === "dark" ? "#fff" : "#000"}
// // // //           fontSize={isMobile ? 11 : 12}
// // // //         >
// // // //           {payload.value}
// // // //         </text>
// // // //       </g>
// // // //     );
// // // //   };

// // // //   return (
// // // //     <div className="dark:bg-db-secondary bg-db-primary rounded-lg shadow-md w-full overflow-x-auto p-4">
// // // //       <div
// // // //         style={{
// // // //           width: isMobile
// // // //             ? `${Math.max(800, sectorWisePercentageChange.length * 80)}px`
// // // //             : "100%",
// // // //           height: isMobile ? 400 : 350,
// // // //           minWidth: "100%",
// // // //         }}
// // // //       >
// // // //         <ResponsiveContainer width="100%" height="100%">
// // // //           <BarChart
// // // //             data={sectorWisePercentageChange}
// // // //             margin={{
// // // //               top: 20,
// // // //               right: isMobile ? 20 : 30,
// // // //               left: isMobile ? 20 : 20,
// // // //               bottom: isMobile ? 40 : 5,
// // // //             }}
// // // //             barCategoryGap={isMobile ? 12 : 15}
// // // //           >
// // // //             <XAxis
// // // //               dataKey="name"
// // // //               tick={renderCustomXAxisTick}
// // // //               interval={0}
// // // //               height={isMobile ? 60 : 30}
// // // //               stroke={theme === "dark" ? "#fff" : "#000"}
// // // //             />
// // // //             <YAxis
// // // //               type="number"
// // // //               stroke={theme === "dark" ? "#fff" : "#000"}
// // // //               tick={{ fontSize: isMobile ? 11 : 12 }}
// // // //             />
// // // //             <Tooltip
// // // //               cursor={{ fill: "rgba(255,255,255,0.1)" }}
// // // //               contentStyle={{
// // // //                 backgroundColor: "#000A2D",
// // // //                 borderRadius: "5px",
// // // //                 borderColor: theme === "dark" ? "#fff" : "#000",
// // // //                 fontSize: isMobile ? 12 : 14,
// // // //               }}
// // // //               itemStyle={{ color: "#fff" }}
// // // //             />
// // // //             <ReferenceLine
// // // //               y={0}
// // // //               stroke={theme === "dark" ? "#fff" : "#000"}
// // // //               strokeWidth={1}
// // // //             />
// // // //             <Bar
// // // //               dataKey="value"
// // // //               barSize={isMobile ? 25 : 30}
// // // //               radius={[5, 5, 0, 0]}
// // // //             >
// // // //               {sectorWisePercentageChange?.map((entry, index) => (
// // // //                 <Cell
// // // //                   key={`cell-${index}`}
// // // //                   fill={entry.value >= 0 ? "#0256F5" : "#95025A"}
// // // //                 />
// // // //               ))}
// // // //             </Bar>
// // // //           </BarChart>
// // // //         </ResponsiveContainer>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default AISectorChart;
// // // /* eslint-disable react/prop-types */
// // // import { useEffect, useState } from "react";
// // // import { useSelector } from "react-redux";
// // // import {
// // //   BarChart,
// // //   Bar,
// // //   XAxis,
// // //   YAxis,
// // //   Tooltip,
// // //   ResponsiveContainer,
// // //   ReferenceLine,
// // //   Cell,
// // // } from "recharts";
// // // import { useMediaQuery } from "react-responsive";

// // // const AISectorChart = ({ data }) => {
// // //   const isMobile = useMediaQuery({ maxWidth: 768 });
// // //   const theme = useSelector((state) => state.theme.theme);

// // //   const [sectorWisePercentageChange, setSectorWisePercentageChange] = useState(
// // //     []
// // //   );

// // //   useEffect(() => {
// // //     const updatedData = Object.entries(data)
// // //       .filter(([sector]) => sector !== "Uncategorized")
// // //       .map(([sector, values]) => {
// // //         let totalPercentage = values.reduce(
// // //           (sum, element) => sum + element.percentageChange,
// // //           0
// // //         );
// // //         const averagePercentageChange = totalPercentage / values.length;
// // //         return {
// // //           name: sector,
// // //           value: Number(averagePercentageChange.toFixed(2)),
// // //         };
// // //       });

// // //     setSectorWisePercentageChange(updatedData);
// // //   }, [data]);

// // //   const renderCustomXAxisTick = ({ x, y, payload }) => {
// // //     return (
// // //       <g transform={`translate(${x},${y})`}>
// // //         <text
// // //           x={0}
// // //           y={0}
// // //           dy={16}
// // //           textAnchor="middle"
// // //           fill={theme === "dark" ? "#fff" : "#000"}
// // //           fontSize={isMobile ? 11 : 12}
// // //         >
// // //           {payload.value}
// // //         </text>
// // //       </g>
// // //     );
// // //   };

// // //   return (
// // //     <div className="dark:bg-db-secondary bg-db-primary rounded-lg shadow-md w-full overflow-x-auto md:p-4 lg:p-4">
// // //       <div
// // //         style={{
// // //           width: isMobile
// // //             ? `${Math.max(800, sectorWisePercentageChange.length * 80)}px`
// // //             : "100%",
// // //           height: isMobile ? 400 : 350,
// // //           minWidth: "100%",
// // //         }}
// // //       >
// // //         <ResponsiveContainer width="100%" height="100%">
// // //           <BarChart
// // //             data={sectorWisePercentageChange}
// // //             margin={{
// // //               top: 20,
// // //               right: isMobile ? 20 : 30,
// // //               left: isMobile ? 20 : 20,
// // //               bottom: isMobile ? 40 : 5,
// // //             }}
// // //             barCategoryGap={isMobile ? 12 : 15}
// // //           >
// // //             <XAxis
// // //               dataKey="name"
// // //               tick={renderCustomXAxisTick}
// // //               interval={0}
// // //               height={isMobile ? 60 : 30}
// // //               stroke={theme === "dark" ? "#fff" : "#000"}
// // //             />
// // //             <YAxis
// // //               type="number"
// // //               stroke={theme === "dark" ? "#fff" : "#000"}
// // //               tick={{ fontSize: isMobile ? 11 : 12 }}
// // //             />
// // //             <Tooltip
// // //               cursor={{ fill: "rgba(255,255,255,0.1)" }}
// // //               contentStyle={{
// // //                 backgroundColor: "#000A2D",
// // //                 borderRadius: "5px",
// // //                 borderColor: theme === "dark" ? "#fff" : "#000",
// // //                 fontSize: isMobile ? 12 : 14,
// // //               }}
// // //               itemStyle={{ color: "#fff" }}
// // //             />
// // //             <ReferenceLine
// // //               y={0}
// // //               stroke={theme === "dark" ? "#fff" : "#000"}
// // //               strokeWidth={1}
// // //             />
// // //             <Bar
// // //               dataKey="value"
// // //               barSize={isMobile ? 25 : 30}
// // //               radius={[5, 5, 0, 0]}
// // //             >
// // //               {sectorWisePercentageChange?.map((entry, index) => (
// // //                 <Cell
// // //                   key={`cell-${index}`}
// // //                   fill={entry.value >= 0 ? "#0256F5" : "#95025A"}
// // //                 />
// // //               ))}
// // //             </Bar>
// // //           </BarChart>
// // //         </ResponsiveContainer>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default AISectorChart;

// // /* eslint-disable react/prop-types */
// // import { useEffect, useState } from "react";
// // import { useSelector } from "react-redux";
// // import {
// //   BarChart,
// //   Bar,
// //   XAxis,
// //   YAxis,
// //   Tooltip,
// //   ResponsiveContainer,
// //   ReferenceLine,
// //   Cell,
// // } from "recharts";
// // import { useMediaQuery } from "react-responsive";

// // const AISectorChart = ({ data }) => {
// //   const isMobile = useMediaQuery({ maxWidth: 768 });
// //   const theme = useSelector((state) => state.theme.theme);

// //   const [sectorWisePercentageChange, setSectorWisePercentageChange] = useState(
// //     []
// //   );

// //   useEffect(() => {
// //     const updatedData = Object.entries(data)
// //       .filter(([sector]) => sector !== "Uncategorized")
// //       .map(([sector, values]) => {
// //         let totalPercentage = values.reduce(
// //           (sum, element) => sum + element.percentageChange,
// //           0
// //         );
// //         const averagePercentageChange = totalPercentage / values.length;
// //         return {
// //           name: sector,
// //           value: Number(averagePercentageChange.toFixed(2)),
// //         };
// //       });

// //     setSectorWisePercentageChange(updatedData);
// //   }, [data]);

// //   const renderCustomXAxisTick = ({ x, y, payload }) => {
// //     return (
// //       <g transform={`translate(${x},${y})`}>
// //         <text
// //           x={0}
// //           y={0}
// //           dy={16}
// //           textAnchor={isMobile ? "end" : "middle"}
// //           fill={theme === "dark" ? "#fff" : "#000"}
// //           fontSize={isMobile ? 10 : 12}
// //         >
// //           {payload.value}
// //         </text>
// //       </g>
// //     );
// //   };

// //   // Handle empty data state
// //   if (sectorWisePercentageChange.length === 0) {
// //     return (
// //       <div className="w-full h-[500px] flex items-center justify-center dark:bg-db-secondary bg-db-primary p-5 rounded-lg shadow-lg">
// //         <p>Loading or missing data...</p>
// //       </div>
// //     );
// //   }

// //   const barSize = isMobile ? 15 : 30;
// //   const barGap = isMobile ? 8 : 15;
// //   const xAxisHeight = isMobile ? 80 : 30;
// //   const xAxisAngle = isMobile ? -90 : -45;
// //   const marginBottom = isMobile ? 80 : 5;

// //   return (
// //     <div
// //       className={`w-full overflow-x-auto overflow-y-hidden ${
// //         isMobile ? "h-[350px]" : "h-[500px]"
// //       }`}
// //     >
// //       <div className="min-w-[600px] md:min-w-full h-[400px] md:h-[500px] dark:bg-db-secondary bg-db-primary p-0 md:p-5 lg:p-3 rounded-lg shadow-lg">
// //         <ResponsiveContainer width="100%" height="100%">
// //           <BarChart
// //             data={sectorWisePercentageChange}
// //             barCategoryGap={barGap}
// //             margin={{
// //               top: 20,
// //               right: isMobile ? 10 : 30,
// //               left: isMobile ? 10 : 20,
// //               bottom: marginBottom,
// //             }}
// //           >
// //             <XAxis
// //               dataKey="name"
// //               tick={renderCustomXAxisTick}
// //               interval={0}
// //               height={xAxisHeight}
// //               angle={-90}
// //               textAnchor={"end"}
// //               stroke={theme === "dark" ? "#fff" : "#000"}
// //             />
// //             <YAxis
// //               type="number"
// //               stroke={theme === "dark" ? "#fff" : "#000"}
// //               tick={{ fontSize: isMobile ? 10 : 12 }}
// //               width={isMobile ? 30 : 40}
// //             />
// //             <Tooltip
// //               cursor={{ fill: "rgba(255,255,255,0.1)" }}
// //               contentStyle={{
// //                 backgroundColor: "#000A2D",
// //                 borderRadius: "5px",
// //                 borderColor: theme === "dark" ? "#fff" : "#000",
// //                 fontSize: isMobile ? 10 : 14,
// //               }}
// //               itemStyle={{ color: "#fff" }}
// //             />
// //             <ReferenceLine
// //               y={0}
// //               stroke={theme === "dark" ? "#fff" : "#000"}
// //               strokeWidth={1}
// //             />
// //             <Bar dataKey="value" barSize={barSize} radius={[5, 5, 0, 0]}>
// //               {sectorWisePercentageChange?.map((entry, index) => (
// //                 <Cell
// //                   key={`cell-${index}`}
// //                   fill={entry.value >= 0 ? "#0256F5" : "#95025A"}
// //                 />
// //               ))}
// //             </Bar>
// //           </BarChart>
// //         </ResponsiveContainer>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AISectorChart;
// /* eslint-disable react/prop-types */
// import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   ReferenceLine,
//   Cell,
// } from "recharts";
// import { useMediaQuery } from "react-responsive";

// const AISectorChart = ({ data }) => {
//   const isMobile = useMediaQuery({ maxWidth: 768 });
//   const theme = useSelector((state) => state.theme.theme);

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
//       });

//     setSectorWisePercentageChange(updatedData);
//   }, [data]);

//   const renderCustomXAxisTick = ({ x, y, payload }) => {
//     return (
//       <g transform={`translate(${x},${y}) rotate(-90)`}>
//         <text
//           x={0}
//           y={0}
//           dy={10}
//           textAnchor="end"
//           fill={theme === "dark" ? "#fff" : "#000"}
//           fontSize={isMobile ? 10 : 12}
//         >
//           {payload.value}
//         </text>
//       </g>
//     );
//   };

//   // Handle empty data state
//   if (sectorWisePercentageChange.length === 0) {
//     return (
//       <div className="w-full h-[500px] flex items-center justify-center dark:bg-db-secondary bg-db-primary p-5 rounded-lg shadow-lg">
//         <p>Loading or missing data...</p>
//       </div>
//     );
//   }

//   const barSize = isMobile ? 15 : 30;
//   const barGap = isMobile ? 8 : 15;
//   const xAxisHeight = isMobile ? 100 : 90; // Increased height for vertical labels
//   const marginBottom = isMobile ? 100 : 80; // Increased bottom margin for vertical labels

//   return (
//     <div
//       className={`w-full overflow-x-auto overflow-y-hidden ${
//         isMobile ? "h-[350px]" : "h-[500px]"
//       }`}
//     >
//       <div className="min-w-[600px] md:min-w-full h-[400px] md:h-[500px] dark:bg-db-secondary bg-db-primary p-0 md:p-5 lg:p-3 rounded-lg shadow-lg">
//         <ResponsiveContainer width="100%" height="110%">
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
//             <XAxis
//               dataKey="name"
//               tick={renderCustomXAxisTick}
//               interval={0}
//               height={xAxisHeight}
//               stroke={theme === "dark" ? "#fff" : "#000"}
//             />
//             <YAxis
//               type="number"
//               stroke={theme === "dark" ? "#fff" : "#000"}
//               tick={{ fontSize: isMobile ? 10 : 12 }}
//               width={isMobile ? 30 : 40}
//             />
//             <Tooltip
//               cursor={{ fill: "rgba(255,255,255,0.1)" }}
//               contentStyle={{
//                 backgroundColor: "#000A2D",
//                 borderRadius: "5px",
//                 borderColor: theme === "dark" ? "#fff" : "#000",
//                 fontSize: isMobile ? 10 : 14,
//               }}
//               itemStyle={{ color: "#fff" }}
//             />
//             <ReferenceLine
//               y={0}
//               stroke={theme === "dark" ? "#fff" : "#000"}
//               strokeWidth={1}
//             />
//             <Bar dataKey="value" barSize={barSize} radius={[5, 5, 0, 0]}>
//               {sectorWisePercentageChange?.map((entry, index) => (
//                 <Cell
//                   key={`cell-${index}`}
//                   fill={entry.value >= 0 ? "#0256F5" : "#95025A"}
//                 />
//               ))}
//             </Bar>
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
        return {
          name: sector,
          value: Number(averagePercentageChange.toFixed(2)),
        };
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
  const xAxisHeight = isMobile ? 100 : 30; // Reduced height for horizontal labels on large devices
  const marginBottom = isMobile ? 100 : 20; // Reduced bottom margin for horizontal labels on large devices

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
            <Bar dataKey="value" barSize={barSize} radius={[5, 5, 0, 0]}>
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
