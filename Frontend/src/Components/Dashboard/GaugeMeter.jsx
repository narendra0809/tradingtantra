/* eslint-disable no-shadow */
import React from "react";
import { PieChart, Pie, Cell } from "recharts";

const RADIAN = Math.PI / 180;

const GaugeMeter = ({ title, value }) => {
  const data = [
    { name: "Strong Sell", value: 20, color: "#FF0000" },
    { name: "Sell", value: 20, color: "#FF8000" },
    { name: "Neutral", value: 20, color: "#FFD700" },
    { name: "Buy", value: 20, color: "#32CD32" },
    { name: "Strong Buy", value: 20, color: "#008000" },
  ];

  const cx = 75; // Reduced center x
  const cy = 100; // Reduced center y
  const iR = 25; // Smaller inner radius
  const oR = 50; // Smaller outer radius

  const needle = (value, data, cx, cy, iR, oR, color) => {
    let total = 0;
    data.forEach((v) => {
      total += v.value;
    });

    const ang = 180.0 * (1 - value / total);
    const length = (iR + 2 * oR) / 3;
    const sin = Math.sin(-RADIAN * ang);
    const cos = Math.cos(-RADIAN * ang);
    const r = 3; // Smaller needle base
    const x0 = cx;
    const y0 = cy;
    const xba = x0 + r * sin;
    const yba = y0 - r * cos;
    const xbb = x0 - r * sin;
    const ybb = y0 + r * cos;
    const xp = x0 + length * cos;
    const yp = y0 + length * sin;

    return [
      <circle key="needle-base" cx={x0} cy={y0} r={r} fill={color} stroke="none" />,
      <path key="needle" d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`} fill={color} />,
    ];
  };

  return (
    <div className="flex flex-col items-center w-fit h-fit">
      <PieChart width={150} height={100}> {/* Smaller size */}
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
        {needle(value, data, cx, cy, iR, oR, "#d0d000")}
      </PieChart>

      {/* Labels */}
      {/* <div className="flex justify-between w-[180px] text-white text-xs font-medium mt-[-10px]">
        <span>Sell</span>
        <span>Neutral</span>
        <span>Buy</span>
      </div> */}

      {/* Title */}
      <p className="text-white font-bold text-sm mt-1">{title}</p>
    </div>
  );
};

export default GaugeMeter;
