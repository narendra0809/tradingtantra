import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Plugin to display text inside the doughnut segments
const textInsidePlugin = {
  id: 'textInside',
  afterDatasetsDraw(chart, args, options) {
    const { ctx, data } = chart;
    ctx.save();
    data.datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);
      if (!meta.hidden) {
        meta.data.forEach((element, index) => {
          const arc = element;
          const { x, y, startAngle, endAngle, innerRadius, outerRadius } = arc;
          const centerAngle = (startAngle + endAngle) / 2;
          const labelPos = innerRadius + (outerRadius - innerRadius) / 2;
          const labelX = x + Math.cos(centerAngle) * labelPos;
          const labelY = y + Math.sin(centerAngle) * labelPos;

          const total = dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((dataset.data[index] / total) * 100).toFixed(2);

          ctx.fillStyle = '#ffffff';  // white color
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '12px sans-serif';
          ctx.fillText(`${percentage}%`, labelX, labelY);
        });
      }
    });
    ctx.restore();
  }
};

ChartJS.register(ArcElement, Tooltip, Legend, textInsidePlugin);

const SIPCalculator = ({ calculator }) => {
  const [initialAmount, setInitialAmount] = useState(500);
  const [expectedReturn, setExpectedReturn] = useState(1);
  const [duration, setDuration] = useState(1);
  const [calculatedValues, setCalculatedValues] = useState({
    investedAmount: 1,
    estimatedReturns: 1,
    totalValue: 1,
  });

  const calculateSIP = (monthlyInvestment, annualReturn, years) => {
    const r = annualReturn / 12 / 100;
    const n = years * 12;
    const investedAmount = monthlyInvestment * n;
    const futureValue =
      monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const estimatedReturns = futureValue - investedAmount;
    return { investedAmount, estimatedReturns, totalValue: futureValue };
  };

  const calculateLumpSum = (principal, annualReturn, years) => {
    const r = annualReturn / 100;
    const futureValue = principal * Math.pow(1 + r, years);
    const estimatedReturns = futureValue - principal;
    return {
      investedAmount: principal,
      estimatedReturns,
      totalValue: futureValue,
    };
  };

  const handleCalculate = () => {
    let result;
    if (calculator === "SIP") {
      result = calculateSIP(initialAmount, expectedReturn, duration);
    } else {
      result = calculateLumpSum(initialAmount, expectedReturn, duration);
    }
    setCalculatedValues(result);
  };

  const chartData = {
    labels:
      calculator === "SIP"
        ? ["Invested Amount", "Estimated Returns"]
        : ["Initial Amount", "Final Amount"],
    datasets: [
      {
        data:
          calculator === "SIP"
            ? [
                calculatedValues.investedAmount,
                calculatedValues.estimatedReturns,
              ]
            : [calculatedValues.investedAmount, calculatedValues.totalValue],
        backgroundColor: ["#95025A", "#0659F4"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB"],
        borderColor: ["#fff", "#fff"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#fff",
          boxWidth: 20,
          padding: 20,
        },
        align: "center",
        display: true,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            if (context.raw !== null) {
              const total = context.chart.data.datasets[0].data.reduce(
                (acc, value) => acc + value,
                0
              );
              const percentage = ((context.raw / total) * 100).toFixed(2);
              label += percentage + "%";
            }
            return label;
          },
        },
      },
    },
    layout: {
      padding: {
        bottom: 0,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div>
      <div className="py-11 px-5 dark:bg-[#00114E] bg-light-b2  rounded-md mt-10">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className=" w-full grid grid-cols-2 gap-x-10 gap-y-8">
            <div className="flex flex-col space-y-[50px]">
              {/* Investment Input */}
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-abcRepro font-light  ">
                    {calculator === "SIP"
                      ? "Monthly Investment*"
                      : "Total Investment*"}
                  </label>
                  <div className="flex gap-2 p-2 rounded-sm dark:bg-db-primary bg-db-primary-light  w-20 text-center">
                    <span>₹</span>
                    <input
                      type="number"
                      className="text-xs w-full outline-none"
                      value={initialAmount}
                      onChange={(e) => setInitialAmount(Number(e.target.value))}
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="100"
                  max="100000"
                  step="100"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(Number(e.target.value))}
                  className="w-full h-1 cursor-pointer"
                />
              </div>

              {/* Expected Return Input */}
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-abcRepro font-light ">
                    Expected Return p.a. (%)*
                  </label>
                  <div className="flex gap-2 p-2 rounded-sm dark:bg-db-primary bg-db-primary-light w-20 text-center">
                    <input
                      type="number"
                      className="text-xs outline-none w-full"
                      value={expectedReturn}
                      onChange={(e) =>
                        setExpectedReturn(Number(e.target.value))
                      }
                    />
                    <span>%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="0.1"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="w-full h-1 cursor-pointer"
                />
              </div>

              {/* Duration Input */}
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-abcRepro font-light  ">
                    Time Period (Years)*
                  </label>
                  <div className="flex gap-2 p-2 rounded-sm dark:bg-db-primary bg-db-primary-light w-20 text-center">
                    <input
                      type="number"
                      className="text-xs w-full outline-none"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                    />
                    <span>Yr</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-1 cursor-pointer"
                />
              </div>
            </div>
            <div className="w-full">
              <Doughnut
                data={chartData}
                options={chartOptions}
                plugins={[textInsidePlugin]}
                width={"324px"}
                height={"324px"}
              />
          
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center gap-10 mt-[82px] ">
            <button
              className="dark:bg-[#72A2FE] bg-white py-2 rounded-md w-4/5"
              onClick={() => {
                setInitialAmount(500);
                setExpectedReturn(1);
                setDuration(1);
                setCalculatedValues({
                  investedAmount: 0,
                  estimatedReturns: 0,
                  totalValue: 0,
                });
              }}
            >
              Clear
            </button>
            <button
              className="bg-primary py-2 rounded-md w-4/5"
              type="button"
              onClick={handleCalculate}
            >
              Calculate
            </button>
          </div>
        </form>
      </div>

      {/* Result Display */}
      <div className="py-5 px-7 dark:bg-[#00114E] bg-light-b2   rounded-md mt-5">
        <div className="flex justify-between items-center">
          <h4 className="text-3xl font-abcRepro font-light">Result:</h4>
          <button
            className="text-base font-abcRepro px-5 py-2 rounded-md bg-primary"
            onClick={() =>
              setCalculatedValues({
                investedAmount: 0,
                estimatedReturns: 0,
                totalValue: 0,
              })
            }
          >
            Reset
          </button>
        </div>
        <div className="mt-[30px] flex flex-col space-y-5 text-2xl font-light font-abcRepro">
          <div className="flex justify-between">
            <p>Invested Amount:</p>
            <p>₹ {calculatedValues.investedAmount.toFixed(2)}</p>
          </div>
          <div className="flex justify-between">
            <p>Estimated Returns:</p>
            <p>₹ {calculatedValues.estimatedReturns.toFixed(2)}</p>
          </div>
          <div className="flex justify-between">
            <p>Total Value:</p>
            <p>₹ {calculatedValues.totalValue.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SIPCalculator;