import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts";

 

const AISectorChart = ({data}) => {
  const theme = useSelector((state) => state.theme.theme);

const [sectorWisePercentageChange, setSectorWisePercentageChange] = useState([]);

useEffect(() => {
  const updatedData = Object.entries(data)
    .filter(([sector]) => sector !== "Uncategorized")
    .map(([sector, values]) => {
      let totalPercentage = values.reduce((sum, element) => sum + element.percentageChange, 0);
      const averagePercentageChange = totalPercentage / values.length;
      return { name: sector, value: averagePercentageChange };
    });

  setSectorWisePercentageChange(updatedData); // Set state once with the entire array

}, [data]); // Runs when `data` changes


    console.log('sectorWise dtaa',sectorWisePercentageChange)

 
  
  return (
    <div className="p-4 dark:bg-db-secondary bg-db-secondary-light  rounded-lg shadow-md w-full">
    
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={sectorWisePercentageChange} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="name" stroke={theme==="dark"?"#fff":"#000"} />
          <YAxis stroke={theme==="dark"?"#fff":"#000"} />
          <Tooltip cursor={{ fill: "rgba(255,255,255,0.1)" }}
           contentStyle={{ backgroundColor: "#000A2D", borderRadius: "5px", borderColor: theme==="dark"?"#fff":"#000" }} 
           itemStyle={{ color: "#fff" }} 
          />
          <ReferenceLine y={0} stroke={theme==="dark"?"#fff":"#000"} strokeWidth={2} />
          <Bar dataKey="value" barSize={30} radius={[5, 5, 0, 0]}>
            {sectorWisePercentageChange?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.value >= 0 ? "#0256F5" : "#95025A"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AISectorChart;
