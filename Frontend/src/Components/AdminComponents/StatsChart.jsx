/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

// Custom theme colors
const COLORS = {
  users: ["#3B82F6", "#60A5FA", "#93C5FD"],
  active: ["#10B981", "#34D399", "#6EE7B7"],
  amount: ["#8B5CF6", "#A78BFA", "#C4B5FD"],
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-blue-500/30 text-white px-4 py-3 rounded-xl shadow-2xl">
        <p className="font-bold text-lg mb-1">{data.title}</p>
        <p className="text-2xl font-bold text-blue-400">
          {typeof data.value === "number" ? data.value.toLocaleString() : data.value}
        </p>
      </div>
    );
  }
  return null;
};

// Animated counter component
const AnimatedCounter = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
};

const StatsChart = ({ statData }) => {
  const [chartData, setChartData] = useState([
    { title: "Total Users", value: 0, fill: COLORS.users[0], icon: "👥" },
    { title: "Active Users", value: 0, fill: COLORS.active[0], icon: "✅" },
    { title: "Total Revenue", value: 0, fill: COLORS.amount[0], icon: "💰" },
  ]);

  useEffect(() => {
    if (statData) {
      setChartData([
        {
          title: "Total Users",
          value: statData.totalUsers || 0,
          fill: COLORS.users[0],
          icon: "👥",
        },
        {
          title: "Active Users",
          value: statData.activeUsers || 0,
          fill: COLORS.active[0],
          icon: "✅",
        },
        {
          title: "Total Revenue",
          value: statData.totalAmount || 0,
          fill: COLORS.amount[0],
          icon: "💰",
          isCurrency: true,
        },
      ]);
    }
  }, [statData]);

  return (
    <div className="w-full h-full p-4">
      {/* Info Cards Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {chartData.map((item, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="text-gray-400 text-sm font-medium">{item.title}</div>
            <div className="text-2xl font-bold text-white mt-1">
              {item.isCurrency ? "₹" : ""}
              <AnimatedCounter value={item.value} />
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            barSize={40}
          >
            <defs>
              {chartData.map((entry, index) => (
                <linearGradient
                  key={`gradient-${index}`}
                  id={`color${index}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                  <stop offset="100%" stopColor={entry.fill} stopOpacity={0.7} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1E293B"
              horizontal={false}
            />
            <XAxis
              type="number"
              stroke="#64748B"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="title"
              type="category"
              stroke="#64748B"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
            <Bar
              dataKey="value"
              radius={[0, 8, 8, 0]}
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`url(#color${index})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsChart;
