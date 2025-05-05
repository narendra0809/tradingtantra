import React, { useState } from "react";
import { BsStars } from "react-icons/bs";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const CAGRCalculator = ({ calculator }) => {
  const [inputs, setInputs] = useState({
    initialAmount: "",
    finalAmount: "",
    duration: "",
    CAGR: "",
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const calculateCAGR = () => {
    const { initialAmount, finalAmount, duration } = inputs;
    if (!initialAmount || !finalAmount || !duration) return;
    const CAGR = (
      (Math.pow(parseFloat(finalAmount) / parseFloat(initialAmount), 1 / parseFloat(duration)) - 1) *
      100
    ).toFixed(2);
    setResult(`${CAGR} %`);
  };

  const calculateFinalAmount = () => {
    const { initialAmount, CAGR, duration } = inputs;
    if (!initialAmount || !CAGR || !duration) return;
    const finalAmount = (
      parseFloat(initialAmount) * Math.pow(1 + parseFloat(CAGR) / 100, parseFloat(duration))
    ).toFixed(2);
    setResult(finalAmount);
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (calculator === "CAGR") {
      calculateCAGR();
    } else {
      calculateFinalAmount();
    }
  };

  const handleClear = () => {
    setInputs({
      initialAmount: "",
      finalAmount: "",
      duration: "",
      CAGR: "",
    });
    setResult(null);
  };

  // Chart data
  const chartData = {
    datasets: [
      {
        data: [
          parseFloat(inputs.initialAmount) || 1,
          parseFloat(calculator === "CAGR" ? inputs.finalAmount : result) || 1,
        ],
        backgroundColor: ["#95025A", "#0659F4"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB"],
        borderColor: ["#fff", "#fff"],
        borderWidth: 1,
      },
    ],
    labels: ["Initial Amount", "Final Amount"],
  };

  // Chart options with center text
  const chartOptions = {
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#fff",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            if (context.raw !== null) {
              label += context.raw;
            }
            return label;
          },
        },
      },
      // Custom plugin for center text
      centerTextPlugin: {
        text: result || calculator==="CAGR" ? "0 X" : "CAGR 0",
      },
    },
  };

  // Custom plugin for center text
  const centerTextPlugin = {
    id: "centerTextPlugin",
    beforeDraw: (chart) => {
      const { width, height } = chart;
      const ctx = chart.ctx;
      ctx.restore();
      const fontSize = (height / 150).toFixed(2);
      ctx.font = `${fontSize}em sans-serif`;
      ctx.textBaseline = "middle";

      const text = chart.config.options.plugins.centerTextPlugin.text;
      const textX = Math.round((width - ctx.measureText(text).width) / 2);
      const textY = height / 2;

      ctx.fillStyle = "#fff"; // White text color
      ctx.fillText(text, textX, textY);
      ctx.save();
    },
  };

  return (
    <div>
      <div className="py-11 px-5 dark:bg-[#00114E] bg-light-b2   rounded-md mt-10">
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8">
            <div className="flex flex-col space-y-[30px]">
              {calculator === "CAGR"
                ? [
                    {
                      label: "Initial Amount*",
                      name: "initialAmount",
                      placeholder: "Enter Initial Capital Amount",
                    },
                    {
                      label: "Final Amount*",
                      name: "finalAmount",
                      placeholder: "Enter Final Capital Amount",
                    },
                    {
                      label: "Duration*",
                      name: "duration",
                      placeholder: "Enter Duration in Years",
                    },
                  ].map(({ label, name, placeholder }) => (
                    <div key={name} className="flex flex-col items-start space-y-3">
                      <label className="text-lg font-abcRepro font-light" htmlFor={name}>
                        {label}
                      </label>
                      <input
                        type="number"
                        name={name}
                        value={inputs[name]}
                        onChange={handleChange}
                        required
                        className="pb-3 w-full bg-transparent outline-none border-b border-white"
                        placeholder={placeholder}
                      />
                    </div>
                  ))
                : [
                    {
                      label: "Initial Amount*",
                      name: "initialAmount",
                      placeholder: "Enter Initial Capital Amount",
                    },
                    {
                      label: "CAGR (%)*",
                      name: "CAGR",
                      placeholder: "Enter CAGR",
                    },
                    {
                      label: "Duration*",
                      name: "duration",
                      placeholder: "Enter Duration in Years",
                    },
                  ].map(({ label, name, placeholder }) => (
                    <div key={name} className="flex flex-col items-start space-y-3">
                      <label className="text-lg font-abcRepro font-light" htmlFor={name}>
                        {label}
                      </label>
                      <input
                        type="number"
                        name={name}
                        value={inputs[name]}
                        onChange={handleChange}
                        required
                        className="pb-3 w-full bg-transparent outline-none border-b border-white"
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
            </div>
            <div>
              <Doughnut data={chartData} options={chartOptions} plugins={[centerTextPlugin]} />
            </div>
          </div>

          <div className="flex justify-between items-center gap-10">
            <button type="button" onClick={handleClear} className="dark:bg-[#72A2FE] bg-white py-2 rounded-md w-4/5">
              Clear
            </button>
            <button type="submit" onClick={handleCalculate} className="bg-primary py-2 rounded-md w-4/5">
              Calculate
            </button>
          </div>
        </form>
      </div>

      <div className="py-5 px-7 dark:bg-[#00114E] bg-light-b2 rounded-md mt-5">
        <h4 className="text-3xl font-abcRepro font-light">Result:</h4>
        {calculator === "CAGR" ? (
          <div className="mt-[30px] flex w-full justify-between items-center font-abcRepro text-2xl font-light">
            <p>CAGR:</p>
            <div className="flex justify-center gap-10">
              <BsStars />
              <p>{result || "0 %"}</p>
            </div>
          </div>
        ) : (
          <div className="mt-[30px] flex w-full justify-between items-center font-abcRepro text-2xl font-light">
            <p>Final Amount:</p>
            <p>{result || "0"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CAGRCalculator;
