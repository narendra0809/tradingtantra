/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  RadialBarChart,
  RadialBar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Custom theme colors - vibrant and matching the admin theme
const COLORS = {
  total: ["#3B82F6", "#60A5FA"],
  active: ["#10B981", "#34D399"],
  revenue: ["#8B5CF6", "#A78BFA"],
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 text-white px-4 py-3 rounded-xl shadow-2xl">
        <p className="font-bold text-sm">{data.name}</p>
        <p className="text-2xl font-bold" style={{ color: data.fill }}>
          {data.value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const StatusByProcessChart = ({ statData }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const data = [
    {
      name: "Total Users",
      value: statData?.totalUsers || 0,
      fill: COLORS.total[0],
      icon: "👥",
      description: "All registered users",
    },
    {
      name: "Active Users",
      value: statData?.activeUsers || 0,
      fill: COLORS.active[0],
      icon: "✅",
      description: "With active subscription",
    },
    {
      name: "Revenue",
      value: statData?.totalAmount || 0,
      fill: COLORS.revenue[0],
      icon: "💰",
      description: "Total earnings",
    },
  ];

  const totalUsers = statData?.totalUsers || 0;
  const activeUsers = statData?.activeUsers || 0;
  const inactiveUsers = totalUsers - activeUsers;
  const activePercentage = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

  // Calculate segment angles for custom pie chart
  const pieData = [
    { name: "Active", value: activeUsers, fill: COLORS.active[0] },
    { name: "Inactive", value: inactiveUsers, fill: "#374151" },
  ];

  return (
    <div className="w-full h-full p-2 sm:p-4">
      <div className="bg-[#0F172A] rounded-xl p-3 sm:p-4 w-full h-full flex flex-col">
        {/* Infographic-style display */}
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          
          {/* Donut Chart */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                barSize={isMobile ? 15 : 20}
                data={pieData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  minAngle={15}
                  background
                  clockWise
                  dataKey="value"
                  cornerRadius={10}
                  animationDuration={1500}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
            
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl sm:text-4xl font-bold text-white">{activePercentage}%</div>
              <div className="text-xs sm:text-sm text-gray-400">Active</div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex flex-col gap-3 flex-1">
            {data.map((item, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-xl p-3 bg-gradient-to-r from-[#1E293B] to-[#0F172A] border border-white/5 hover:border-white/20 transition-all"
              >
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  style={{ backgroundColor: item.fill }}
                />
                <div className="flex items-center justify-between ml-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-gray-400 text-xs">{item.name}</span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-white mt-0.5">
                      {item.isCurrency ? "₹" : ""}{item.value.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar for active users */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Subscription Rate</span>
            <span>{activePercentage}%</span>
          </div>
          <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000"
              style={{ width: `${activePercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusByProcessChart;
