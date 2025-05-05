import React, { useState } from "react";

const OptionCalculator = () => {
  const [tradingCapital, setTradingCapital] = useState("");
  const [riskPerTrade, setRiskPerTrade] = useState("");
  const [stoploss, setStoploss] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(0);

  const calculateQuantity = (e) => {
    e.preventDefault();
    const capital = parseFloat(tradingCapital);
    const risk = parseFloat(riskPerTrade) / 100;
    const sl = parseFloat(stoploss);
    const entryPrice = parseFloat(price);

    if (!capital || !risk || !sl || !entryPrice) {
      alert("Please fill all fields correctly.");
      return;
    }

    const riskAmount = capital * risk;
    const calculatedQuantity = Math.floor(riskAmount / sl);
    setQuantity(calculatedQuantity);
  };

  const clearFields = () => {
    setTradingCapital("");
    setRiskPerTrade("");
    setStoploss("");
    setPrice("");
    setQuantity(0);
  };

  return (
    <div>
      <div className="py-11 px-5 dark:bg-[#00114E] bg-light-b2 rounded-md mt-10">
        <form className="space-y-6" onSubmit={calculateQuantity}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8">
            <div className="flex flex-col space-y-3">
              <label className="text-lg font-light">Index</label>
              <select className="pb-3 w-full bg-transparent outline-none border-b dark:border-white border-black">
                <option>Nifty</option>
                <option>Bank Nifty</option>
                <option>Sensex</option>
              </select>
            </div>
            <div className="flex flex-col space-y-3">
              <label className="text-lg font-light">Trading Capital</label>
              <input
                type="number"
                value={tradingCapital}
                onChange={(e) => setTradingCapital(e.target.value)}
                placeholder="Enter Trading Capital"
                className="pb-3 w-full bg-transparent outline-none border-b dark:border-white border-black"
              />
            </div>
            {[  
              { label: "Risk Per Trade %", state: riskPerTrade, setter: setRiskPerTrade },
              { label: "Stoploss Per Trade (Points)", state: stoploss, setter: setStoploss },
              { label: "Price", state: price, setter: setPrice },
            ].map(({ label, state, setter }, index) => (
              <div key={index} className="flex flex-col space-y-3">
                <label className="text-lg font-light">{label}</label>
                <input
                  type="number"
                  value={state}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={`Enter ${label}`}
                  className="pb-3 w-full bg-transparent outline-none border-b dark:border-white border-black"
                />
              </div>
            ))}
            <div className="flex flex-col space-y-3">
              <label className="text-lg font-light">Strike Condition</label>
              <select className="pb-3 w-full bg-transparent outline-none border-b dark:border-white border-black">
                <option>Less Than</option>
                <option>Greater Than</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center gap-10">
            <button
              type="button"
              onClick={clearFields}
              className="dark:bg-[#72A2FE] bg-white py-2 rounded-md w-4/5"
            >
              Clear
            </button>
            <button
              type="submit"
              className="bg-primary py-2 rounded-md w-4/5"
            >
              Calculate
            </button>
          </div>
        </form>
      </div>
      <div className="py-5 px-7 dark:bg-[#00114E] bg-light-b2  rounded-md mt-5">
        <h4 className="text-3xl font-light">Result:</h4>
        <div className="mt-[30px] flex w-full justify-between items-center text-2xl font-light">
          <p>Quantity:</p>
          <p>{quantity}</p>
        </div>
      </div>
    </div>
  );
};

export default OptionCalculator;