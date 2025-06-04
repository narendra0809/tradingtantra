/* eslint-disable react/prop-types */

// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   ReferenceLine,
//   Cell,
// } from "recharts";
// import { useMediaQuery } from "react-responsive";

// const CustomTooltip = ({ active, payload }) => {
//   if (active && payload && payload.length) {
//     const data = payload[0].payload;

//     return (
//       <div className="bg-gray-800 text-white p-3 rounded shadow-lg">
//         <p className="font-bold">Strike: {data.strikePrice}</p>
//         <p>
//           <span className="font-semibold text-yellow-300">
//             OI Change (CE):{" "}
//           </span>
//           <span
//             className={
//               data.oiChangeCE > 0 ? "text-[#007BFF]" : "text-[#95025A]"
//             }
//           >
//             {data.oiChangeCE.toLocaleString()}
//           </span>
//           <br />
//           Price Change: {data.priceChangeCE?.toFixed(2)}
//         </p>
//         <hr className="my-2 border-gray-600" />
//         <p>
//           <span className="font-semibold text-blue-300"> OI Change (PE): </span>
//           <span
//             className={
//               data.oiChangePE > 0 ? "text-[#007BFF]" : "text-[#95025A]"
//             }
//           >
//             {data.oiChangePE.toLocaleString()}
//           </span>
//           <br />
//           Price Change: {data.priceChangePE?.toFixed(2)}
//         </p>
//       </div>
//     );
//   }
//   return null;
// };

// const OiClockChart = ({ data: chartData }) => {
//   const isMobile = useMediaQuery({ maxWidth: 768 });

//   if (chartData.length === 0) {
//     return (
//       <div className="w-full h-[500px] flex items-center justify-center dark:bg-db-secondary bg-db-primary p-5 rounded-lg shadow-lg">
//         <p>Loading or missing data...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full h-[500px] dark:bg-db-secondary bg-db-primary p-5 rounded-lg shadow-lg">
//       <ResponsiveContainer width="100%" height={500}>
//         <BarChart
//           data={chartData}
//           barCategoryGap="20%"
//           margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
//         >
//           <CartesianGrid strokeDasharray="3 3" stroke="#1B263B" />
//           <XAxis
//             dataKey="strikePrice"
//             tick={{ fill: "white", fontSize: isMobile ? 10 : 12 }}
//             angle={isMobile ? -85 : -45}
//             textAnchor="end"
//             height={70}
//           />
//           <YAxis
//             type="number"
//             tick={{ fill: "white", fontSize: isMobile ? 10 : 12 }}
//             domain={["auto", "auto"]}
//           />
//           <Tooltip content={<CustomTooltip />} />
//           <ReferenceLine y={0} stroke="#fff" strokeWidth={1} />

//           <Bar
//             barSize={30}
//             minPointSize={20}
//             dataKey="oiChangeCE"
//             name="Call OI Change"
//             fill="#4CAF50"
//           >
//             {chartData.map((entry, index) => (
//               <Cell
//                 radius={[5, 5, 0, 0]}
//                 key={`ce-${index}`}
//                 fill={entry.oiChangeCE > 0 ? "#007BFF" : "#95025A"}
//               />
//             ))}
//           </Bar>

//           <Bar
//             barSize={30}
//             dataKey="oiChangePE"
//             minPointSize={30}
//             name="Put OI Change"
//             fill="#2196F3"
//           >
//             {chartData.map((entry, index) => (
//               <Cell
//                 radius={[5, 5, 0, 0]}
//                 key={`pe-${index}`}
//                 fill={entry.oiChangePE > 0 ? "#95025A" : "#007BFF"}
//               />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default OiClockChart;

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { useMediaQuery } from "react-responsive";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-gray-800 text-white p-3 rounded shadow-lg">
        <p className="font-bold">Strike: {data.strikePrice}</p>
        <p>
          <span className="font-semibold text-yellow-300">
            OI Change (CE):{" "}
          </span>
          <span
            className={
              data.oiChangeCE > 0 ? "text-[#007BFF]" : "text-[#95025A]"
            }
          >
            {data.oiChangeCE.toLocaleString()}
          </span>
          <br />
          Price Change: {data.priceChangeCE?.toFixed(2)}
        </p>
        <hr className="my-2 border-gray-600" />
        <p>
          <span className="font-semibold text-blue-300"> OI Change (PE): </span>
          <span
            className={
              data.oiChangePE > 0 ? "text-[#007BFF]" : "text-[#95025A]"
            }
          >
            {data.oiChangePE.toLocaleString()}
          </span>
          <br />
          Price Change: {data.priceChangePE?.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const OiClockChart = ({ data: chartData }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center dark:bg-db-secondary bg-db-primary p-5 rounded-lg shadow-lg">
        <p>Loading or missing data...</p>
      </div>
    );
  }

  const barSize = isMobile ? 20 : 30;
  const barGap = isMobile ? 0 : "20%";
  const xAxisHeight = isMobile ? 80 : 70;
  const xAxisAngle = isMobile ? -90 : -45;
  const marginBottom = isMobile ? 80 : 60;

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px] md:min-w-full h-[400px] md:h-[500px] dark:bg-db-secondary bg-db-primary p-3 md:p-5 rounded-lg">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            barCategoryGap={barGap}
            margin={{
              top: 20,
              right: 20,
              left: 20,
              bottom: marginBottom,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1B263B" />
            <XAxis
              dataKey="strikePrice"
              tick={{
                fill: "white",
                fontSize: isMobile ? 10 : 12,
              }}
              angle={xAxisAngle}
              textAnchor="end"
              height={xAxisHeight}
              // interval={isMobile ? Math.ceil(chartData.length / 5) : 0}
            />
            <YAxis
              tick={{ fill: "white", fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 30 : 40}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#fff" strokeWidth={1} />

            <Bar
              minPointSize={isMobile ? 10 : 20}
              barSize={barSize}
              dataKey="oiChangeCE"
              name="Call OI Change"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`ce-${index}`}
                  fill={entry.oiChangeCE > 0 ? "#007BFF" : "#95025A"}
                />
              ))}
            </Bar>

            <Bar
              barSize={barSize}
              minPointSize={isMobile ? 10 : 20}
              dataKey="oiChangePE"
              name="Put OI Change"
            >
              {chartData.map((entry, index) => (
                <Cell
                  radius={[4, 4, 4, 4]}
                  key={`pe-${index}`}
                  fill={entry.oiChangePE > 0 ? "#95025A" : "#007BFF"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OiClockChart;
