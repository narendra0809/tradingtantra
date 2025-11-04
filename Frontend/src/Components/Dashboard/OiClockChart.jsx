/* eslint-disable react/prop-types */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { useMediaQuery } from "react-responsive";
import { useSelector } from "react-redux";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-gray-800 text-white p-3 rounded shadow-lg">
        <p className="font-bold">Strike: {data.strikePrice}</p>
        <p>
          <span className="font-semibold text-yellow-300">
            OI Change (CE):{" "}
          </span>
          <span
            className={
              data.oiChangeCE > 0 ? "text-[#007BFF]" : "text-[#95025A]"
            }
          >
            {data.oiChangeCE.toLocaleString()}
          </span>
          <br />
          Price Change: {data.priceChangeCE?.toFixed(2)}
        </p>
        <hr className="my-2 border-gray-600" />
        <p>
          <span className="font-semibold text-blue-300"> OI Change (PE): </span>
          <span
            className={
              data.oiChangePE > 0 ? "text-[#007BFF]" : "text-[#95025A]"
            }
          >
            {data.oiChangePE.toLocaleString()}
          </span>
          <br />
          Price Change: {data.priceChangePE?.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const CustomXAxisTick = ({ x, y, payload, currentStrike ,theme}) => (
  <g>
    <text
      x={x}
      y={y}
      dy={16}
      textAnchor="middle"
       fill={theme === "dark" ? "#FFFFFF" : "#000000"}
      // fill="#fff"
      fontSize={12}
      fontWeight="bold"
    >
      {payload.value}
    </text>
    {payload.value === currentStrike && (
      <text
        x={x}
        y={y + 40} // was 25, now 40 for increased gap
        textAnchor="middle"
        fill="#007BFF"
        fontSize={10}
        fontWeight="bold"
      >
        Current Strike
      </text>
    )}
  </g>
);

const OiClockChart = ({ data: chartData, currentStrike }) => {
   const theme = useSelector((state) => state.theme.theme);

  const isMobile = useMediaQuery({ maxWidth: 768 });
  if (chartData.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center dark:bg-db-secondary bg-primary-light p-5 rounded-lg shadow-lg">
        <p>Loading or missing data...</p>
      </div>
    );
  }

  const barSize = isMobile ? 20 : 30;
  const barGap = isMobile ? 0 : "20%";
  const xAxisHeight = isMobile ? 80 : 70;
  const xAxisAngle = isMobile ? -90 : -45;
  const marginBottom = isMobile ? 80 : 60;

  return (
    <div
      className={`w-full overflow-x-auto overflow-y-hidden ${
        isMobile && "h-[350px]"
      }`}
    >
      <div className="min-w-[600px] md:min-w-full h-[400px] md:h-[500px] dark:bg-db-secondary bg-primary-light lg:p-3 md:p-5 rounded-lg">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            barCategoryGap={barGap}
            margin={{
              top: 20,
              right: 20,
              left: 20,
              bottom: marginBottom,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1B263B" />
            <XAxis
              dataKey="strikePrice"
              tick={<CustomXAxisTick currentStrike={currentStrike} theme={theme} />}
              angle={xAxisAngle}
              textAnchor="end"
              height={xAxisHeight}
            />
            <YAxis
              tick={{ fill: theme==="dark" ? "white":"black", fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 30 : 40}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#fff" strokeWidth={1} />

            <Bar
              minPointSize={isMobile ? 10 : 20}
              barSize={barSize}
              dataKey="oiChangeCE"
              name="Call OI Change"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`ce-${index}`}
                  fill={entry.oiChangeCE > 0 ? "#007BFF" : "#95025A"}
                />
              ))}
            </Bar>

            <Bar
              barSize={barSize}
              minPointSize={isMobile ? 10 : 20}
              dataKey="oiChangePE"
              name="Put OI Change"
            >
              {chartData.map((entry, index) => (
                <Cell
                  radius={[4, 4, 4, 4]}
                  key={`pe-${index}`}
                  fill={entry.oiChangePE > 0 ? "#95025A" : "#007BFF"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OiClockChart;
