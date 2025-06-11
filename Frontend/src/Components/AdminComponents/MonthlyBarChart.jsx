import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const data = [
  { name: "January", value: 16 },
  { name: "February", value: 58 },
  { name: "March", value: 36 },
  { name: "April", value: 33 },
  { name: "May", value: 79 },
  { name: "June", value: 86 },
  { name: "July", value: 54 },
  { name: "August", value: 27 },
  { name: "September", value: 80 },
  { name: "October", value: 78 },
  { name: "November", value: 97 },
  { name: "December", value: 76 },
];

const MonthlyBarChart = () => {
  return (
    <div className="w-full overflow-x-auto rounded-xl p-4">
      {/* Minimum width to allow all months to display on small screens */}
      <div className="min-w-[600px] h-64 sm:h-80 md:h-[400px] lg:h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 10, bottom: 30 }}
          >
            <CartesianGrid stroke="#1E2337" strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              stroke="#B0B3C0"
              tick={{ fontSize: 10 }}
              interval={0} // Ensure all months display even on small screens
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="#B0B3C0" tick={{ fontSize: 10 }} />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{ backgroundColor: "#1C1F36", border: "none" }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#fff" }}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ color: "#b0b3c0", paddingTop: "10px" }}
            />
            <Bar
              dataKey="value"
              fill="#2F6FED"
              radius={[2, 2, 0, 0]}
              name="2025"
              maxBarSize={40} // limits candle width for small screens
            >
              <LabelList
                dataKey="value"
                position="top"
                fill="#fff"
                style={{ fontSize: 10, fontWeight: 500 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyBarChart;
