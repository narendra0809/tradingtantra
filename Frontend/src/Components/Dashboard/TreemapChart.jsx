/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { Treemap, ResponsiveContainer } from "recharts";

const getColor = (change) => {
  if (change > 0) return `rgba(34, 177, 76, ${Math.min(change / 10 + 0.3, 1)})`;
  if (change < 0)
    return `rgba(220, 50, 50, ${Math.min(Math.abs(change) / 10 + 0.3, 1)})`;
  return "rgba(169, 169, 169, 0.8)";
};

const TreemapChart = ({ data }) => {
  const [tooltip, setTooltip] = useState(null);
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Update container dimensions on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const transformedData = data.map((item) => ({
    name: item.UNDERLYING_SYMBOL,
    volume: item.xelement,
    change: item.percentageChange ?? 0,
  }));

  // Calculate tooltip position with boundary checks
  const calculateTooltipPosition = (x, y) => {
    if (!containerRef.current) return { x, y };

    const tooltipWidth = 150; // Estimated tooltip width
    const tooltipHeight = 80; // Estimated tooltip height
    const padding = 10;

    let adjustedX = x + padding;
    let adjustedY = y - tooltipHeight / 2;

    // Check right edge
    if (adjustedX + tooltipWidth > containerSize.width) {
      adjustedX = x - tooltipWidth - padding;
    }

    // Check left edge
    if (adjustedX < 0) {
      adjustedX = padding;
    }

    // Check bottom edge
    if (adjustedY + tooltipHeight > containerSize.height) {
      adjustedY = containerSize.height - tooltipHeight - padding;
    }

    // Check top edge
    if (adjustedY < 0) {
      adjustedY = padding;
    }

    return { x: adjustedX, y: adjustedY };
  };

  return (
    <div
      className="w-full h-full bg-[#01071C] rounded-lg relative"
      ref={containerRef}
    >
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={transformedData}
          dataKey="volume"
          animationDuration={0}
          content={({ root, depth, x, y, width, height, index }) => {
            if (!root || depth === 0) return null;
            const stock = transformedData[index];
            if (!stock) return null;

            return (
              <g
                onMouseEnter={() =>
                  setTooltip({
                    x,
                    y,
                    name: stock.name,
                    volume: stock.volume,
                    change: stock.change,
                  })
                }
                onMouseLeave={() => setTooltip(null)}
              >
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={getColor(stock.change)}
                  stroke="#01071C"
                  strokeWidth="1"
                />
                <text
                  x={x + width / 2}
                  y={y + height / 2}
                  textAnchor="middle"
                  fill="white"
                  fontSize={width < 40 ? "10" : "12"}
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
            left: `${calculateTooltipPosition(tooltip.x, tooltip.y).x}px`,
            top: `${calculateTooltipPosition(tooltip.x, tooltip.y).y}px`,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            pointerEvents: "none",
            zIndex: 100,
            maxWidth: "200px",
            wordWrap: "break-word",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <strong>{tooltip.name}</strong>
          <br />
          Volume: {tooltip.volume?.toFixed(2)}
          <br />
          Change: {tooltip.change?.toFixed(2)}%
        </div>
      )}
    </div>
  );
};

export default TreemapChart;
