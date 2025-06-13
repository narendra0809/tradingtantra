// /* eslint-disable react/prop-types */
// import {
//   RadialBarChart,
//   RadialBar,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// const StatusByProcessChart = ({ statData }) => {
//   const data = [
//     {
//       name: "Total Users",
//       value: statData?.totalUsers || 0,
//       fill: "#00C49F",
//     },
//     {
//       name: "Active Users",
//       value: statData?.activeUsers || 0,
//       fill: "#F4C542",
//     },
//     {
//       name: "Total Amount",
//       value: statData?.totalAmount ? Math.min(statData.totalAmount, 1000) : 0,
//       fill: "#F2523C",
//     },
//   ];

//   const totalValue = data.reduce((sum, item) => sum + item.value, 0);

//   const CustomTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-[#1B2135] text-white p-2 rounded text-xs sm:text-sm shadow-lg">
//           <p className="font-medium">{payload[0].payload.name}</p>
//           <p>{payload[0].value.toLocaleString()}</p>
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="w-full h-full p-2 sm:p-4">
//       <div className="bg-[#0f172a] rounded-xl p-3 sm:p-4 w-full h-full flex flex-col">
//         <div className="flex-1 min-h-[200px] sm:min-h-[250px]">
//           <ResponsiveContainer width="100%" height="100%">
//             <RadialBarChart
//               cx="50%"
//               cy="50%"
//               innerRadius="30%"
//               outerRadius="90%"
//               barSize={window.innerWidth < 640 ? 8 : 10}
//               data={data}
//               startAngle={180}
//               endAngle={-180}
//               margin={{
//                 top: 10,
//                 right: 10,
//                 bottom: 10,
//                 left: 10,
//               }}
//             >
//               <RadialBar
//                 minAngle={15}
//                 clockWise
//                 background
//                 dataKey="value"
//                 cornerRadius={window.innerWidth < 640 ? 6 : 10}
//               />
//               <Tooltip content={<CustomTooltip />} />
//               <text
//                 x="50%"
//                 y="50%"
//                 textAnchor="middle"
//                 dominantBaseline="middle"
//                 className="text-white"
//                 fill="#fff"
//               >
//                 <tspan fontSize={window.innerWidth < 640 ? "12px" : "14px"}>
//                   Total
//                 </tspan>
//                 <tspan
//                   x="50%"
//                   dy={window.innerWidth < 640 ? "16" : "18"}
//                   fontSize={window.innerWidth < 640 ? "12px" : "14px"}
//                   fontWeight="600"
//                 >
//                   {totalValue.toLocaleString()}
//                 </tspan>
//               </text>
//             </RadialBarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Responsive Legend */}
//         <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-2 sm:mt-4 text-[#B0B3C0]">
//           {data.map((item) => (
//             <div
//               key={item.name}
//               className="flex items-center gap-1 text-xs sm:text-sm"
//             >
//               <span
//                 className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full flex-shrink-0"
//                 style={{ backgroundColor: item.fill }}
//               ></span>
//               <span>
//                 {window.innerWidth < 640
//                   ? item.name
//                       .replace("Users", "")
//                       .replace("Total", "")
//                       .trim() || "Users"
//                   : item.name}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StatusByProcessChart;

/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  RadialBarChart,
  RadialBar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const StatusByProcessChart = ({ statData }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const data = [
    {
      name: "Total Users",
      value: statData?.totalUsers || 0,
      fill: "#00C49F",
    },
    {
      name: "Active Users",
      value: statData?.activeUsers || 0,
      fill: "#F4C542",
    },
    {
      name: "Total Amount",
      value: statData?.totalAmount ? Math.min(statData.totalAmount, 1000) : 0,
      fill: "#F2523C",
    },
  ];

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1B2135] text-white p-2 rounded text-xs sm:text-sm shadow-lg">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p>{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full p-2 sm:p-4">
      <div className="bg-[#0f172a] rounded-xl p-3 sm:p-4 w-full h-full flex flex-col">
        <div className="flex-1 min-h-[200px] sm:min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? "20%" : "30%"}
              outerRadius={isMobile ? "80%" : "90%"}
              barSize={isMobile ? 6 : 10}
              data={data}
              startAngle={180}
              endAngle={-180}
              margin={{
                top: isMobile ? 5 : 10,
                right: isMobile ? 5 : 10,
                bottom: isMobile ? 5 : 10,
                left: isMobile ? 5 : 10,
              }}
            >
              <RadialBar
                minAngle={15}
                clockWise
                background
                dataKey="value"
                cornerRadius={isMobile ? 4 : 10}
              />
              <Tooltip content={<CustomTooltip />} />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-white"
                fill="#fff"
              >
                <tspan fontSize={isMobile ? "10px" : "14px"}>Total</tspan>
                <tspan
                  x="50%"
                  dy={isMobile ? "14" : "18"}
                  fontSize={isMobile ? "10px" : "14px"}
                  fontWeight="600"
                >
                  {totalValue.toLocaleString()}
                </tspan>
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Responsive Legend */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-2 sm:mt-4 text-[#B0B3C0]">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-1 text-xs sm:text-sm"
            >
              <span
                className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.fill }}
              ></span>
              <span>
                {isMobile
                  ? item.name
                      .replace("Users", "")
                      .replace("Total", "")
                      .trim() || "Users"
                  : item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusByProcessChart;
