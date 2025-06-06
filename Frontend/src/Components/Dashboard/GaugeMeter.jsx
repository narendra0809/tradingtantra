/* eslint-disable react/prop-types */
import { PieChart, Pie, Cell } from "recharts";

const RADIAN = Math.PI / 180;

const GaugeMeter = ({ title, totalOI }) => {
  // Determine the sentiment based on PCR value
  let sentiment, color, needleValue;

  const pcrValue = totalOI.totalPE / totalOI.totalCE;

  if (pcrValue < 0.7) {
    sentiment = "Bullish (BUY)";
    color = "#32CD32"; // Green
    needleValue = 20; // Far left (Buy side)
  } else if (pcrValue >= 0.7 && pcrValue <= 1.0) {
    sentiment = "Neutral";
    color = "#FFD700"; // Yellow
    needleValue = 50; // Middle
  } else if (pcrValue > 1.0 && pcrValue <= 1.3) {
    sentiment = "Bearish (SELL)";
    color = "#FF8000"; // Orange
    needleValue = 80; // Right side (Sell)
  } else {
    sentiment = "Strong Bearish (SELLY)";
    color = "#FF0000"; // Red
    needleValue = 100; // Far right (Strong Sell)
  }

  const data = [
    { name: "Bullish (BUY)", value: 25, color: "#008000" }, // Strong Green
    { name: "Slightly Bullish", value: 25, color: "#32CD32" }, // Green
    { name: "Neutral", value: 20, color: "#FFD700" }, // Yellow
    { name: "Bearish (SELL)", value: 25, color: "#FF8000" }, // Orange
    { name: "Strong Bearish (SELLY)", value: 25, color: "#FF0000" }, // Red
  ];

  const cx = 75;
  const cy = 100;
  const iR = 25;
  const oR = 50;

  const needle = (value, data, cx, cy, iR, oR, color) => {
    let total = 0;
    data.forEach((v) => {
      total += v.value;
    });

    const ang = 180.0 * (1 - value / total);
    const length = (iR + 2 * oR) / 3;
    const sin = Math.sin(-RADIAN * ang);
    const cos = Math.cos(-RADIAN * ang);
    const r = 3;
    const x0 = cx;
    const y0 = cy;
    const xba = x0 + r * sin;
    const yba = y0 - r * cos;
    const xbb = x0 - r * sin;
    const ybb = y0 + r * cos;
    const xp = x0 + length * cos;
    const yp = y0 + length * sin;

    return [
      <circle
        key="needle-base"
        cx={x0}
        cy={y0}
        r={r}
        fill={color}
        stroke="none"
      />,
      <path
        key="needle"
        d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
        fill={color}
      />,
    ];
  };

  return (
    <div className="scale-150 flex flex-col items-center w-full h-full">
      <PieChart width={150} height={100}>
        <Pie
          dataKey="value"
          startAngle={180}
          endAngle={0}
          data={data}
          cx={cx}
          cy={cy}
          innerRadius={iR}
          outerRadius={oR}
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        {needle(needleValue, data, cx, cy, iR, oR, color)}
      </PieChart>

      {/* Display PCR value and sentiment */}
      <p className="text-white font-bold text-sm mt-1">{title}</p>
      <p className="text-white text-xs">PCR: {pcrValue.toFixed(2)}</p>
      <p className="text-white text-xs font-bold" style={{ color }}>
        {sentiment}
      </p>
    </div>
  );
};

export default GaugeMeter;
