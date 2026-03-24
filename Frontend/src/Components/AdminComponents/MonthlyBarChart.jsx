/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from "recharts";

// Gradient colors for bars
const GRADIENT_COLORS = [
  ["#3B82F6", "#60A5FA"],
  ["#10B981", "#34D399"],
  ["#8B5CF6", "#A78BFA"],
  ["#F59E0B", "#FBBF24"],
  ["#EF4444", "#F87171"],
  ["#EC4899", "#F472B6"],
  ["#06B6D4", "#22D3EE"],
  ["#84CC16", "#A3E635"],
  ["#F97316", "#FB923C"],
  ["#6366F1", "#818CF8"],
  ["#14B8A6", "#2DD4BF"],
  ["#A855F7", "#C084FC"],
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-blue-500/30 text-white px-4 py-3 rounded-xl shadow-2xl">
        <p className="font-bold text-sm text-gray-300 mb-1">{label}</p>
        <p className="text-2xl font-bold text-blue-400">
          {payload[0].value.toLocaleString()} Users
        </p>
      </div>
    );
  }
  return null;
};

// Animated counter
const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);
  
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <>{display.toLocaleString()}</>;
};

const MonthlyBarChart = ({ activeUsersByMonth: data }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate stats
  const totalAnnualUsers = data?.reduce((sum, item) => sum + item.value, 0) || 0;
  const maxMonth = data?.reduce((max, item) => item.value > max.value ? item : max, { value: 0 }) || {};
  const avgUsers = data?.length ? Math.round(totalAnnualUsers / data.length) : 0;

  return (
    <div className="w-full rounded-xl p-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 rounded-xl p-4 border border-blue-500/20">
          <div className="text-gray-400 text-xs mb-1">Annual Total</div>
          <div className="text-2xl font-bold text-white">
            <AnimatedNumber value={totalAnnualUsers} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-600/20 to-green-600/5 rounded-xl p-4 border border-green-500/20">
          <div className="text-gray-400 text-xs mb-1">Peak Month</div>
          <div className="text-lg font-bold text-white">{maxMonth.name || "N/A"}</div>
          <div className="text-green-400 text-sm">{maxMonth.value?.toLocaleString() || 0}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-600/5 rounded-xl p-4 border border-purple-500/20">
          <div className="text-gray-400 text-xs mb-1">Monthly Average</div>
          <div className="text-2xl font-bold text-white">
            <AnimatedNumber value={avgUsers} />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 sm:h-80 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#1E293B" 
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="#64748B"
              tick={{ fontSize: isMobile ? 9 : 11 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 60 : 30}
            />
            <YAxis
              stroke="#64748B"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Month indicators */}
      <div className="flex justify-between mt-2 px-2">
        {data?.slice(0, isMobile ? 6 : 12).map((item, index) => (
          <div 
            key={index}
            className={`text-xs ${item.value > 0 ? 'text-blue-400' : 'text-gray-600'}`}
          >
            {item.name?.substring(0, 3)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyBarChart;
