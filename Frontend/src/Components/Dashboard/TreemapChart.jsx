import React, { useState } from "react";
import { Treemap, ResponsiveContainer } from "recharts";

// Example data (Replace with real stock data)
const stockData = [
  { name: "Stock A", volume: 10000, change: 2.5 },
  { name: "Stock B", volume: 3000, change: -1.2 },
  { name: "Stock C", volume: 8000, change: 4.8 },
  { name: "Stock D", volume: 6000, change: -3.0 },
  { name: "Stock E", volume: 8000, change: 3.0 },
  { name: "Stock F", volume: 9000, change: -6.0 },
  { name: "Stock G", volume: 3000, change: 8.0 },
  { name: "Stock H", volume: 1000, change: 3.0 },
  { name: "Stock I", volume: 2000, change: 3.0 },
  { name: "Stock J", volume: 8000, change: 1.0 },
  { name: "Stock K", volume: 4000, change: 9.0 },
  { name: "Stock L", volume: 2000, change: 1.0 },
  { name: "Stock M", volume: 1000, change: 4.0 },
  { name: "Stock N", volume: 4000, change: 1.0 },
];

// Function to determine color based on change percentage
const getColor = (change) => {
  if (change > 0) return `rgba(34, 177, 76, ${Math.min(change / 10 + 0.3, 1)})`; // Slightly darker green
  if (change < 0) return `rgba(220, 50, 50, ${Math.min(Math.abs(change) / 10 + 0.3, 1)})`; // Slightly darker red
  return "rgba(169, 169, 169, 0.8)"; // Dark gray for neutral
};

const TreemapChart = ({data}) => {
  const [tooltip, setTooltip] = useState(null);
  

  const transformedData = data.map((item) => ({
    name: item.UNDERLYING_SYMBOL, // Assigning stock name from `securityId`
    volume: item.xelement, // Assigning volume from `xelement`
    change: item.percentageChange ?? 0, // Handling `null` values in `percentageChange`
  }));

  return (
    <div className="w-full h-full bg-[#01071C] rounded-lg relative">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={transformedData}
          dataKey="volume"
          animationDuration={0} 
           
          content={({ root, depth, x, y, width, height, index }) => {
            if (!root || depth === 0 ) return null;
            const stock = transformedData[index];
            if(!stock) return null;

            return (
              <g
                onMouseEnter={() =>
                  setTooltip({ x, y, name: stock.name, volume: stock.volume, change: stock.change })
                }
                onMouseLeave={() => setTooltip(null)}
              >
                {/* Stock Bar */}
                <rect x={x} y={y} width={width} height={height} fill={getColor(stock.change)} stroke="#01071C" strokeWidth="1" />
                
                {/* Stock Label (Adaptive) */}
                <text
                  x={x + width / 2}
                  y={y + height / 2}
                  textAnchor="middle"
                  fill="white"
                  fontSize={width < 40 ? "10" : "12"} // Smaller font for small bars
                  fontWeight="bold"
                >
                  {width < 70 ? stock.name.charAt(0) : stock.name}
                </text>
              </g>
            );
          }}
        />
      </ResponsiveContainer>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            fontSize: "12px",
            pointerEvents: "none",
            transform: "translate(10px, -20px)",
          }}
        >
          <strong>{tooltip.name}</strong>
          <br />
          Volume: {tooltip.volume}
          <br />
          Change: {tooltip.change}%
        </div>
      )}
    </div>
  );
};

export default TreemapChart;
