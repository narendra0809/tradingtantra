import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { price: 29300, value: 120000 },
  { price: 29290, value: 100000 },
  { price: 29280, value: 90000 },
  { price: 29270, value: -70000 },
  { price: 29260, value: 80000 },
  { price: 29050, value: -60000 },
  { price: 29000, value: 50000 },
  { price: 28950, value: -50000 },
  { price: 28900, value: 30000 },
  { price: 28850, value: -40000 },
  { price: 28800, value: 20000 },
  { price: 28750, value: -30000 },
  { price: 28700, value: 10000 },
  { price: 28650, value: -20000 },
  { price: 29002, value: 50000 },
  { price: 28953, value: -50000 },
  { price: 28904, value: 30000 },
  { price: 28855, value: -40000 },
  { price: 28806, value: 20000 },
  { price: 28750, value: -30000 },
  { price: 28700, value: 10000 },
  { price: 28650, value: -20000 },
  { price: 28600, value: 5000 },
  { price: 28550, value: -10000 },
];
const  CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white p-2 rounded shadow-lg">
        <p>Price: {payload[0].payload.price}</p>
        <p>Value: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};
const  OiClockChart  = () => {
  return (
    <div className="w-full h-[500px] dark:bg-db-secondary  bg-db-secondary-light p-5 rounded-lg shadow-lg">
       
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={0} barSize={10}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1B263B" />
          <XAxis dataKey="price" tick={{ fill: "white" }} />
          <YAxis tick={{ fill: "white" }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
          <Bar dataKey="value" fill="#007BFF" stroke="#0056b3" radius={[50, 50, 0, 0]} width={40}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OiClockChart;