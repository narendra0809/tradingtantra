// /* eslint-disable react/prop-types */
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Cell,
// } from "recharts";

// // Custom Tooltip Component
// const CustomTooltip = ({ active, payload }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-gray-800 text-white p-2 rounded shadow-lg">
//         <p>Option: {payload[0].payload.name}</p>
//         <p>OI Change: {payload[0].value.toLocaleString()}</p>
//       </div>
//     );
//   }
//   return null;
// };

// const OiClockChartTwo = ({ data: chartData }) => {
//   const formattedData = [
//     {
//       name: "CE",
//       value: chartData.TotalOiChangeCE,
//       color: "#007BFF",
//     },
//     {
//       name: "PE",
//       value: chartData.TotalOiChangePE,
//       color: "#95025A",
//     },
//   ];

//   return (
//     <div className="w-full h-[375px] dark:bg-db-secondary bg-primary-light p-5 rounded-lg shadow-lg">
//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart
//           data={formattedData}
//           margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//         >
//           <CartesianGrid strokeDasharray="3 3" stroke="#1B263B" />
//           <XAxis dataKey="name" tick={{ fill: "white" }} />
//           <YAxis
//             tick={{ fill: "white" }}
//             tickFormatter={(value) => value.toLocaleString()}
//           />
//           <Tooltip
//             content={<CustomTooltip />}
//             cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
//           />
//           <Bar
//             dataKey="value"
//             name="OI Change"
//             radius={[4, 4, 0, 0]}
//             barSize={60}
//           >
//             {formattedData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={entry.color} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default OiClockChartTwo;
/* eslint-disable react/prop-types */
import { useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }) => {
    const theme = useSelector((state) => state.theme.theme);

  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800  p-2 rounded shadow-lg text-white">
        <p>Option: {payload[0].payload.name}</p>
        <p>OI Change: {Math.round(payload[0].value).toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const OiClockChartTwo = ({ data: chartData }) => {
   const theme = useSelector((state) => state.theme.theme);



  const isMobile = useMediaQuery({ maxWidth: 768 });
  const formattedData = [
    {
      name: "CE",
      value: chartData.TotalOiChangeCE,
      color: "#007BFF",
    },
    {
      name: "PE",
      value: chartData.TotalOiChangePE,
      color: "#95025A",
    },
  ];

  return (
    <div
      className={`w-full h-[375px] bg-db-primary not-dark:bg-[#EEEEEE] ${
        isMobile ? "" : "p-5"
      } rounded-lg shadow-lg`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1B263B" />
          <XAxis dataKey="name"
           tick={{ fill: theme==="dark" ? "white" : "black" }} 
           />
          <YAxis
             tick={{ fill: theme==="dark" ? "white" : "black" }} 
            tickFormatter={(value) => Math.round(value).toLocaleString()}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
          />
          <Bar
            dataKey="value"
            name="OI Change"
            radius={[4, 4, 0, 0]}
            barSize={60}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OiClockChartTwo;
