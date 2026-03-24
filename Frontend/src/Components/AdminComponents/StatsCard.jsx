/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

// Animated Stats Card Component for dashboard infographics
const StatsCard = ({ 
  title,
  value,
  prefix = "",
  suffix = "",
  icon,
  trend = null, // "up", "down", or null
  trendValue = "",
  color = "blue", // blue, green, red, purple, amber
  animated = true,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;

  // Animate counter on load
  useEffect(() => {
    if (!animated || numericValue === 0) {
      setDisplayValue(numericValue);
      return;
    }

    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [numericValue, animated]);

  const colorStyles = {
    blue: {
      bg: "bg-blue-500/10",
      icon: "from-blue-500 to-blue-600",
      text: "text-blue-400",
      trendUp: "text-green-400",
      trendDown: "text-red-400",
    },
    green: {
      bg: "bg-green-500/10",
      icon: "from-green-500 to-emerald-600",
      text: "text-green-400",
      trendUp: "text-green-400",
      trendDown: "text-red-400",
    },
    red: {
      bg: "bg-red-500/10",
      icon: "from-red-500 to-red-600",
      text: "text-red-400",
      trendUp: "text-green-400",
      trendDown: "text-red-400",
    },
    purple: {
      bg: "bg-purple-500/10",
      icon: "from-purple-500 to-purple-600",
      text: "text-purple-400",
      trendUp: "text-green-400",
      trendDown: "text-red-400",
    },
    amber: {
      bg: "bg-amber-500/10",
      icon: "from-amber-500 to-orange-600",
      text: "text-amber-400",
      trendUp: "text-green-400",
      trendDown: "text-red-400",
    },
  };

  const colors = colorStyles[color] || colorStyles.blue;

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl p-5 border border-white/5 hover:border-white/10 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.icon} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <span className="text-xl">{icon}</span>
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? colors.trendUp : colors.trendDown}`}>
            {trend === 'up' ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <div className="flex items-baseline gap-1 mt-1">
          {prefix && <span className={`text-2xl font-bold ${colors.text}`}>{prefix}</span>}
          <span className={`text-3xl font-bold ${colors.text} tabular-nums`}>
            {formatNumber(Math.round(displayValue))}
          </span>
          {suffix && <span className={`text-lg ${colors.text}`}>{suffix}</span>}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
