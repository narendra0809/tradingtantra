import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const EMICalculator = ({ calculator }) => {
  const [loanAmount, setLoanAmount] = useState(500);
  const [interest, setInterest] = useState(1);
  const [duration, setDuration] = useState(1);
  const [monthlyEMI, setMonthlyEMI] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const handleClear = (e) => {
    e.preventDefault();
    setLoanAmount(500);
    setInterest(1);
    setDuration(1);
    setMonthlyEMI(0);
    setTotalInterest(0);
    setTotalAmount(0);
  };

  const handleCalculate = (e) => {
    e.preventDefault();

    const monthlyInterestRate = interest / 12 / 100;
    const numberOfPayments = duration * 12;
    const EMI = 
      (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    const total = EMI * numberOfPayments;
    const interestAmount = total - loanAmount;

    setMonthlyEMI(EMI.toFixed(2));
    setTotalInterest(interestAmount.toFixed(2));
    setTotalAmount(total.toFixed(2));
  };

  const chartData = {
    datasets: [
      {
        data: [parseFloat(loanAmount) || 1, parseFloat(totalInterest) || 1],
        backgroundColor: ["#0659F4", "#95025A"],
        hoverBackgroundColor: ["#36A2EB", "#FF6384"],
        borderColor: ["#fff", "#fff"],
        borderWidth: 1,
      },
    ],
    labels: ["Principal Amount", "Interest Amount"],
  };

  const chartOptions = {
    cutout: "70%",
    responsive: true,
    maintainAspectRatio: false,
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
    },
  };
  return (
    <div>
      <div className="py-11 px-5 dark:bg-[#00114E] bg-light-b2 rounded-md mt-10">
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-y-8">
              <div className="flex flex-col space-y-[50px]">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-lg font-abcRepro font-light  ">
                      Loan Amount*
                    </label>
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="text-xs p-2 rounded-sm dark:bg-[#00114E] bg-db-primary-light "
                      min="100"
                      max="10000"
                      step="100"
                    />
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-1 cursor-pointer"
                  />
                </div>

                {/* Expected Return Slider */}
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-lg font-abcRepro font-light ">
                      Rate Of Interest (p.a.) (%)*
                    </label>
                    <input
                      type="number"
                      value={interest}
                      onChange={(e) => setInterest(Number(e.target.value))}
                      className="text-xs p-2 rounded-sm dark:bg-[#00114E] bg-db-primary-light"
                      min="1"
                      max="40"
                      step="0.1"
                    />
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    step="0.1"
                    value={interest}
                    onChange={(e) => setInterest(Number(e.target.value))}
                    className="w-full h-1 cursor-pointer"
                  />
                </div>

                {/* Duration Slider */}
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-lg font-abcRepro font-light ">
                      Loan Tenure (Years) *
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="text-xs p-2 rounded-sm dark:bg-[#00114E] bg-db-primary-light"
                      min="1"
                      max="30"
                      step="1"
                    />
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
              
            <div className="w-full"> <Doughnut data={chartData} options={chartOptions} width={"324px"}
                height={"324px"}/></div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center gap-10 mt-[82px]">
            <button onClick={handleClear} className="dark:bg-[#72A2FE] bg-white py-2 rounded-md w-4/5">
              Clear
            </button>
            <button onClick={handleCalculate} className="bg-primary py-2 rounded-md w-4/5">
              Calculate
            </button>
          </div>
        </form>
      </div>
      <div className="py-5 px-7 dark:bg-[#00114E] bg-light-b2  rounded-md mt-5">
        <div className="flex justify-between items-center">
          <h4 className="text-3xl font-abcRepro font-light">Result:</h4>
          <button onClick={handleClear} className="text-base font-abcRepro px-3 py-2 rounded-md bg-primary">
            Reset
          </button>
        </div>
        <div className="mt-[30px] grid grid-cols-2 gap-x-10  space-y-5 text-xl font-light font-abcRepro">
          <div className="flex justify-between">
            <p>Monthly EMI:</p>
            <p>&#8377; {monthlyEMI}</p>
          </div>
          <div className="flex justify-between">
            <p>Total Interest:</p>
            <p>&#8377; {totalInterest}</p>
          </div>
          <div className="flex justify-between">
            <p>Principal Amount:</p>
            <p>&#8377; {loanAmount}</p>
          </div>
          <div className="flex justify-between">
            <p>Total Amount:</p>
            <p>&#8377; {totalAmount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EMICalculator