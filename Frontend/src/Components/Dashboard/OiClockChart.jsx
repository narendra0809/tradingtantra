/* eslint-disable react/prop-types */

// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// const data = [
//   { price: 29300, value: 120000 },
//   { price: 29290, value: 100000 },
//   { price: 29280, value: 90000 },
//   { price: 29270, value: -70000 },
//   { price: 29260, value: 80000 },
//   { price: 29050, value: -60000 },
//   { price: 29000, value: 50000 },
//   { price: 28950, value: -50000 },
//   { price: 28900, value: 30000 },
//   { price: 28850, value: -40000 },
//   { price: 28800, value: 20000 },
//   { price: 28750, value: -30000 },
//   { price: 28700, value: 10000 },
//   { price: 28650, value: -20000 },
//   { price: 29002, value: 50000 },
//   { price: 28953, value: -50000 },
//   { price: 28904, value: 30000 },
//   { price: 28855, value: -40000 },
//   { price: 28806, value: 20000 },
//   { price: 28750, value: -30000 },
//   { price: 28700, value: 10000 },
//   { price: 28650, value: -20000 },
//   { price: 28600, value: 5000 },
//   { price: 28550, value: -10000 },
// ];

// const CustomTooltip = ({ active, payload }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-gray-800 text-white p-2 rounded shadow-lg">
//         <p>Price: {payload[0].payload.price}</p>
//         <p>Value: {payload[0].value}</p>
//       </div>
//     );
//   }
//   return null;
// };

// const OiClockChart = () => {
//   // console.log(data[0]);
//   return (
//     <div className="w-full h-[500px] dark:bg-db-secondary  bg-db-secondary-light p-5 rounded-lg shadow-lg">
//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart data={data} barCategoryGap={0} barSize={10}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#1B263B" />
//           <XAxis dataKey="price" tick={{ fill: "white" }} />
//           <YAxis tick={{ fill: "white" }} />
//           <Tooltip
//             content={<CustomTooltip />}
//             cursor={{ fill: "transparent" }}
//           />
//           <Bar
//             dataKey="value"
//             fill="#007BFF"
//             stroke="#0056b3"
//             radius={[50, 50, 0, 0]}
//             width={40}
//           />
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
  if (chartData.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center dark:bg-db-secondary bg-db-secondary-light p-5 rounded-lg shadow-lg">
        <p>Loading or missing data...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] dark:bg-db-secondary bg-db-secondary-light p-5 rounded-lg shadow-lg">
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={chartData}
          barCategoryGap="20%"
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1B263B" />
          <XAxis
            dataKey="strikePrice"
            tick={{ fill: "white" }}
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis
            type="number"
            tick={{ fill: "white" }}
            domain={["auto", "auto"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#fff" strokeWidth={1} />

          <Bar
            barSize={30}
            minPointSize={20}
            dataKey="oiChangeCE"
            name="Call OI Change"
            fill="#4CAF50"
          >
            {chartData.map((entry, index) => (
              <Cell
                radius={[5, 5, 0, 0]}
                key={`ce-${index}`}
                fill={entry.oiChangeCE > 0 ? "#007BFF" : "#95025A"}
              />
            ))}
          </Bar>

          <Bar
            barSize={30}
            dataKey="oiChangePE"
            minPointSize={30}
            name="Put OI Change"
            fill="#2196F3"
          >
            {chartData.map((entry, index) => (
              <Cell
                radius={[5, 5, 0, 0]}
                key={`pe-${index}`}
                fill={entry.oiChangePE > 0 ? "#95025A" : "#007BFF"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OiClockChart;
