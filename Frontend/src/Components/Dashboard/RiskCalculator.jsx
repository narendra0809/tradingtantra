import React, { useEffect, useState } from "react";
import GaugeChart from "react-gauge-chart";
import { useRisk } from "../../contexts/RiskContext";

const RiskCalculator = ({ calculator }) => {
  const [formData, setFormData] = useState({
    ACcapital: "",
    RPTrade: "",
    stoploss: "",
    lotSize: "",
  });
  const [result, setResult] = useState({
    amountAtRisk: 0,
    totalQuantity: 0,
  });
  const { updateRisk } = useRisk();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const determineRiskLevel = (riskPercentage) => {
    if (riskPercentage < 1) return "Low";
    if (riskPercentage >= 1 && riskPercentage <= 3) return "Medium";
    return "High";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { ACcapital, RPTrade, stoploss, lotSize } = formData;
  
    if (!ACcapital || !RPTrade || !stoploss || (calculator !== "Equity" && !lotSize)) {
      alert("Please fill in all required fields.");
      return;
    }
  
    const riskPerTrade = (parseFloat(ACcapital) * parseFloat(RPTrade)) / 100;
    let totalQuantity, amountAtRisk;
  
    if (calculator === "Equity") {
      totalQuantity = Math.floor(riskPerTrade / parseFloat(stoploss));
      amountAtRisk = totalQuantity * parseFloat(stoploss);
    } else {
      const riskPerLot = parseFloat(lotSize) * parseFloat(stoploss);
      const noOfLots = Math.floor(riskPerTrade / riskPerLot);
      totalQuantity = noOfLots * parseFloat(lotSize);
      amountAtRisk = noOfLots * riskPerLot;
    }
  
    const riskLevel = determineRiskLevel(parseFloat(RPTrade));
    updateRisk(riskLevel);
  
    setResult({
      amountAtRisk: amountAtRisk.toFixed(2),
      totalQuantity,
    });
  };

  const handleClear = () => {
    setFormData({ ACcapital: "", RPTrade: "", stoploss: "", lotSize: "" });
    setResult({ amountAtRisk: 0, totalQuantity: 0 });
  };

  return (
    <div>
      <div className="py-11 px-5 dark:bg-[#00114E] bg-light-b2  rounded-md mt-10">
        <form className="space-y-6" onSubmit={handleSubmit}> 
          <div className="grid grid-cols-2 gap-x-6 gap-y-8">
            {[{
                label: "Account Capital*",
                name: "ACcapital",
                placeholder: "Enter Capital Amount",
              },
              {
                label: "Risk Per Trade (%)*",
                name: "RPTrade",
                placeholder: "Enter Risk per Trade",
              },
              {
                label: "Stoploss (in Rupees)*",
                name: "stoploss",
                placeholder: "Enter Stoploss",
              },
              ...(calculator !== "Equity"
                ? [{
                    label: "Lot Size*",
                    name: "lotSize",
                    placeholder: "Enter Lot Size",
                  }]
                : []),
            ].map(({ label, name, placeholder }) => (
              <div key={name} className="flex flex-col items-start space-y-3">
                <label className="text-lg font-abcRepro font-light" htmlFor={name}>
                  {label}
                </label>
                <input
                  type="number"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  className="pb-3 w-full bg-transparent outline-none border-b border-white"
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center gap-10 mt-[50px]">
            <button type="button" className="dark:bg-[#72A2FE] bg-white py-2 rounded-md w-4/5" onClick={handleClear}>
              Clear
            </button>
            <button type="submit" className="bg-primary py-2 rounded-md w-4/5">
              Calculate
            </button>
          </div>
        </form>
      </div>
      <div className="py-5 px-7 dark:bg-[#00114E] bg-light-b2 rounded-md mt-5">
        <h4 className="text-3xl font-abcRepro font-light">Result:</h4>
        <div className="mt-[30px] space-y-5">
          <div className="flex w-full justify-between items-center font-abcRepro text-2xl font-light">
            <p>Amount at Risk:</p>
            <p>{result.amountAtRisk}</p>
          </div>
          <div className="flex w-full justify-between items-center font-abcRepro text-2xl font-light">
            <p>Total Quantity:</p>
            <p>{result.totalQuantity}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const RiskCalculatorRight = () => {
  const { riskLevel } = useRisk();
  const riskPercent = riskLevel === "Low" ? 0.2 : riskLevel === "Medium" ? 0.4 : 0.6;
  const [riskLabel, setRiskLabel] = useState("");

  useEffect(() => {
    if (riskLevel <= 0.2) setRiskLabel("LOW");
    else if (riskLevel <= 0.4) setRiskLabel("MEDIUM");
    else if (riskLevel <= 0.6) setRiskLabel("MEDIUM");
    else setRiskLabel("HIGH");
  }, [riskLevel]);

  return (
    <>
       <h1 className="text-2xl font-medium text-wrap">Risk/Position Size Calculator</h1>
       <div className="relative flex flex-col items-center">
      
      {/* Gauge Chart */}
      <GaugeChart
        id="gauge-chart"
        nrOfLevels={5}
        colors={["green", "orange", "red"]}
        arcWidth={1}
        percent={riskPercent}
        animate={true} 
        needleColor="#1b3a4b"
        needleBaseColor="#1b3a4b"
        hideText={true}
        
      />  

      {/* "RISK" text at the bottom */}
      <div className="absolute -top-5 transform -translate-y-1/2 text-[#12314b] font-bold text-xl">
        {riskLevel}
      </div>
      <h2 className="text-center text-5xl font-extrabold  text-[#12314b]">RISK</h2>
    </div>
    <p className="text-2xl font-normal text-wrap">
      Calculating risk before entering a trade is important to ensure traders' capital safety.
    </p>
    <p className="text-wrap text-lg font-light">
      To use this risk calculator, enter your account capital and the percentage of your account you
      wish to risk. Our calculator will suggest position sizes based on the information you provide.
    </p>
    </>
  );
};

export {RiskCalculator, RiskCalculatorRight };