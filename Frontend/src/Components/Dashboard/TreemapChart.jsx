import { useState, useRef, useEffect } from "react";

// Arrange data into pyramid rows
const buildPyramidRows = (data) => {
  const rows = [];
  let idx = 0;
  let rowLen = 1;
  while (idx < data.length) {
    rows.push(data.slice(idx, idx + rowLen));
    idx += rowLen;
    rowLen += 1;
  }
  return rows;
};

const getColor = (change) => {
  if (change > 0) return `rgba(34, 177, 76, ${Math.min(change / 10 + 0.3, 1)})`;
  if (change < 0)
    return `rgba(220, 50, 50, ${Math.min(Math.abs(change) / 10 + 0.3, 1)})`;
  return "rgba(169, 169, 169, 0.8)";
};

const TreemapPyramid = ({ data }) => {
  const fixedRowHeight = 60; // px (box height)
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(400);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const transformedData = data.map((item) => ({
    name: item.UNDERLYING_SYMBOL,
    volume: item.xelement,
    change: item.percentageChange ?? 0,
  }));
  const pyramidRows = buildPyramidRows(transformedData);

  // Chart and parent height are both exactly number of rows * fixed height
  const chartHeight = pyramidRows.length * fixedRowHeight;

  const calculateTooltipPosition = (x, y) => {
    const tooltipWidth = 150;
    const tooltipHeight = 80;
    const padding = 10;

    let adjustedX = x + padding;
    let adjustedY = y - tooltipHeight / 2;

    if (adjustedX + tooltipWidth > containerWidth) {
      adjustedX = x - tooltipWidth - padding;
    }
    if (adjustedX < 0) {
      adjustedX = padding;
    }
    if (adjustedY + tooltipHeight > chartHeight) {
      adjustedY = chartHeight - tooltipHeight - padding;
    }
    if (adjustedY < 0) {
      adjustedY = padding;
    }
    return { x: adjustedX, y: adjustedY };
  };

  return (
    <div
      ref={containerRef}
      className="w-full bg-[#01071C] rounded-lg relative"
      style={{
        height: `${chartHeight}px`,
        overflow: "hidden",
      }}
    >
      <svg
        width={containerWidth}
        height={chartHeight}
        style={{ display: "block" }}
      >
        {pyramidRows.map((row, i) => {
          const boxWidth = containerWidth / row.length;
          return row.map((stock, j) => {
            const x = j * boxWidth;
            const y = i * fixedRowHeight;
            return (
              <a
                key={stock.name}
                target="_blank"
                href={`https://in.tradingview.com/chart/?symbol=NSE%3A${stock.name}&interval=5`}
                rel="noopener noreferrer"
              >
                <g
                  onMouseEnter={() =>
                    setTooltip({
                      x: x + boxWidth / 2,
                      y: y + fixedRowHeight / 2,
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
                    width={boxWidth}
                    height={fixedRowHeight}
                    fill={getColor(stock.change)}
                    stroke="#fff"
                    strokeWidth="1"
                  />
                  <text
                    x={x + boxWidth / 2}
                    y={y + fixedRowHeight / 2}
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fill="white"
                    fontSize={boxWidth < 40 ? "10" : "12"}
                    fontWeight="bold"
                  >
                    {boxWidth < 70 ? stock.name.charAt(0) : stock.name}
                  </text>
                </g>
              </a>
            );
          });
        })}
      </svg>
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
            transform: "translate(-50%, -50%)",
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

export default TreemapPyramid;
