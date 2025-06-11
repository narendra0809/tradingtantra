/* eslint-disable react/prop-types */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Total User", value: 10, fill: "#E56A54" },
  { name: "Total Active User", value: 20, fill: "#DEB250" },
  { name: "Total Amount", value: 1600, fill: "#EA4D2D" },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1c1f3a] text-white text-sm px-3 py-1 rounded shadow-md">
        <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const HorizontalBarChart = () => {
  return (
    <div className="rounded-2xl w-full max-w-full overflow-x-auto">
      <div className="min-w-[300px] sm:min-w-full h-64 sm:h-72 md:h-80 lg:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            barSize={30}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2E334B" />
            <XAxis
              type="number"
              stroke="#B0B3C2"
              tick={{ fontSize: 10 }}
              domain={["auto", "auto"]}
            />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#B0B3C2"
              tick={{ fontSize: 10 }}
              width={130}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: "10px",
                fontSize: "12px",
                textAlign: "center",
              }}
              payload={[
                {
                  value: "2025",
                  type: "square",
                  color: "#66ffcc",
                },
              ]}
            />
            <Bar dataKey="value" radius={[0, 2, 2, 0]}>
              <LabelList
                dataKey="value"
                position="right"
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

export default HorizontalBarChart;
