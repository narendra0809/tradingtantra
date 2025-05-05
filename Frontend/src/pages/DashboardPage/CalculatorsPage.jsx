import React, { useState } from "react";
import CAGRImg from "../../assets/Images/Dashboard/calculators/CRGRImg.png";
import EMIImg from "../../assets/Images/Dashboard/calculators/EMIImg.png";
import OptionImg from "../../assets/Images/Dashboard/calculators/OptionImg.png";
import SIPImg from "../../assets/Images/Dashboard/calculators/SIPImg.png";
import {
  RiskCalculator,
  RiskCalculatorRight,
} from "../../Components/Dashboard/RiskCalculator";
import CAGRCalculator from "../../Components/Dashboard/CAGRCalculator";
import SIPCalculator from "../../Components/Dashboard/SIPCalculator";
import EMICalculator from "../../Components/Dashboard/EMICalculator";
import OptionCalculator from "../../Components/Dashboard/OptionCalculator";
const CalculatorsPage = () => {
  const [calculator, setCalculator] = useState("Equity");
  const [selectedCalculator, setSelectedCalculator] = useState("Risk");
  const [riskLevel, setRiskLevel] = useState(
    localStorage.getItem("riskLevel") || "Low"
  );
  const handleToggle = () => {
    if (selectedCalculator === "Risk") {
      setCalculator((prev) => (prev === "Equity" ? "F&O" : "Equity"));
    } else if (selectedCalculator === "CAGR") {
      setCalculator((prev) => (prev === "CAGR" ? "Reverse CAGR" : "CAGR"));
    } else if (selectedCalculator === "SIP") {
      setCalculator((prev) => (prev === "SIP" ? "LUMPSUM" : "SIP"));
    }
  };

  const handelCalculatorChange = (calc) => {
    setSelectedCalculator(calc);
    if (calc === "Risk") {
      setCalculator("Equity");
    } else if (calc === "CAGR") {
      setCalculator("CAGR");
    } else if (calc === "SIP") {
      setCalculator("SIP");
    } else {
      setCalculator("");
    }
  };

  const calculators = ["Risk", "CAGR", "SIP", "EMI", "Option"];

  return (
    <>
      <div className="grid lg:grid-cols-3 grid-cols-1 gap-10 mt-10  ">
        {/* Left Section */}
        <div className="lg:col-span-2 dark:bg-db-primary bg-db-secondary-light border border-[#0256f550] p-5 rounded-md">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            {selectedCalculator === "Risk" ? (
              <h5 className="font-abcRepro text-3xl font-medium">
                Risk Calculator
              </h5>
            ) : selectedCalculator === "CAGR" ? (
              <h5 className="font-abcRepro text-3xl font-medium">
                CAGR Calculator
              </h5>
            ) : selectedCalculator === "SIP" ? (
              <h5 className="font-abcRepro text-3xl font-medium">
                SIP Calculator
              </h5>
            ) : selectedCalculator === "EMI" ? (
              <h5 className="font-abcRepro text-3xl font-medium">
                EMI Calculator
              </h5>
            ) : (
              <h5 className="font-abcRepro text-3xl font-medium">
                Option Calculator
              </h5>
            )}
            {(selectedCalculator === "Risk" ||
              selectedCalculator === "CAGR" ||
              selectedCalculator === "SIP") && (
              <div className="flex items-center gap-2.5">
                {/* Calculator Toggle */}
                {selectedCalculator === "Risk" && (
                  <p
                    className="cursor-pointer"
                    onClick={() => setCalculator("Equity")}
                  >
                    Equity
                  </p>
                )}
                {selectedCalculator === "CAGR" && (
                  <p
                    className="cursor-pointer"
                    onClick={() => setCalculator("CAGR")}
                  >
                    CAGR
                  </p>
                )}
                {selectedCalculator === "SIP" && (
                  <p
                    className="cursor-pointer"
                    onClick={() => setCalculator("SIP")}
                  >
                    SIP
                  </p>
                )}

                {/* Toggle Slider */}
                <div
                  onClick={handleToggle}
                  className="w-14 h-7 bg-white rounded-full flex items-center p-1 cursor-pointer transition-all"
                >
                  <div
                    className={`w-6 h-6 bg-primary rounded-full shadow-md transform transition-all ${
                      (selectedCalculator === "Risk" && calculator === "F&O") ||
                      (selectedCalculator === "CAGR" &&
                        calculator === "Reverse CAGR") ||
                      (selectedCalculator === "SIP" && calculator === "LUMPSUM")
                        ? "translate-x-6"
                        : ""
                    }`}
                  />
                </div>

                {/* Option Toggle */}
                {selectedCalculator === "Risk" && (
                  <p
                    className="cursor-pointer"
                    onClick={() => setCalculator("F&O")}
                  >
                    F&O
                  </p>
                )}
                {selectedCalculator === "CAGR" && (
                  <p
                    className="cursor-pointer"
                    onClick={() => setCalculator("Reverse CAGR")}
                  >
                    Reverse CAGR
                  </p>
                )}
                {selectedCalculator === "SIP" && (
                  <p
                    className="cursor-pointer"
                    onClick={() => setCalculator("LUMPSUM")}
                  >
                    LUMPSUM
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Calculator Selection Buttons */}
          <div className="w-full overflow-x-auto whitespace-nowrap scrollbar-hide mt-8">
            <div className="flex space-x-4 w-max">
              {calculators.map((calc) => (
                <button
                  key={calc}
                  className={`p-2.5 rounded-sm dark:hover:bg-primary hover:bg-primary-light   transition-all ${
                    selectedCalculator === calc
                      ? "dark:bg-primary bg-primary-light"
                      : ""
                  }`}
                  onClick={() => handelCalculatorChange(calc)}
                >
                  {calc} Calculator
                </button>
              ))}
            </div>
          </div>

          {/* Calculator Form */}
          {selectedCalculator === "Risk" ? (
            <RiskCalculator calculator={calculator} />
          ) : selectedCalculator === "CAGR" ? (
            <CAGRCalculator calculator={calculator} />
          ) : selectedCalculator === "SIP" ? (
            <SIPCalculator calculator={calculator} />
          ) : selectedCalculator === "EMI" ? (
            <EMICalculator />
          ) : (
            selectedCalculator === "Option" && <OptionCalculator />
          )}
        </div>

        {/* Right Section  */}
        <div className=" flex flex-col items-center px-5 py-12 font-abcRepro  dark:bg-db-primary bg-db-secondary-light border border-[#0256f550]  space-y-[45px]">
          {selectedCalculator === "Risk" ? (
            <RiskCalculatorRight />
          ) : selectedCalculator === "CAGR" ? (
            <>
              <h1 className="text-2xl font-medium text-wrap">
                CAGR / Reverse CAGR Calculator
              </h1>
              <img src={CAGRImg} />
              <p className="text-2xl font-normal text-wrap">
                Compound annual growth rate (CAGR) is the mean annual growth
                rate over a specified time.
              </p>
              <p className="text-wrap text-lg font-light">
                CAGR tells you the average rate of return you have earned on
                your investments every year. CAGR is very useful for investors
                because it is an accurate measure of investment growth (or fall)
                over time.
              </p>
            </>
          ) : selectedCalculator === "SIP" ? (
            <>
              <h1 className="text-2xl font-medium text-wrap">SIP Calculator</h1>
              <img src={SIPImg} />
              <p className="text-2xl font-normal text-wrap">
                Calculating risk before enter a trade is important to ensure
                traders capital safety.
              </p>
              <p className="text-wrap text-lg font-light">
                To use this risk calculator, enter your account capital, and the
                percentage of your account you wish to risk. Our calculator will
                suggest position sizes based on the information you provide.
              </p>
            </>
          ) : selectedCalculator === "EMI" ? (
            <>
              <h1 className="text-2xl font-medium text-wrap">EMI Calculator</h1>
              <img src={EMIImg} />
              <p className="text-2xl font-normal text-wrap">
                Calculate your monthly Installment for your Loan with This EMI
                calculator.
              </p>
              <p className="text-wrap text-lg font-light">
                To use this Calculator, Enter the Loan Amount, The Loan tenure
                and the rate of interest. After filling the below fields you
                will get the amount you will have to pay per month.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-medium text-wrap">
                Option Calculator
              </h1>
              <p className="text-2xl font-normal text-wrap">
                Compound annual growth rate (CAGR) is the mean annual growth
                rate over a specified time.
              </p>
              <img src={OptionImg} />
              <p className="text-wrap text-lg font-light">
                CAGR tells you the average rate of return you have earned on
                your investments every year. CAGR is very useful for investors
                because it is an accurate measure of investment growth (or fall)
                over time.
              </p>
            </>
          )}
        </div>
      </div>
      <>
        {selectedCalculator === "Risk" ? (
          <>
            <section className="bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px my-[30px] rounded-md mr-2">
              <div className="font-abcRepro dark:bg-db-primary  bg-db-primary-light p-[30px] rounded-md  ">
                <h2 className="text-2xl font-semibold mb-5">
                  What is Risk calculator?
                </h2>
                <div className="space-y-6">
                  <p className="text-base font-light">
                    One of the most important tools in a trader's bag is risk
                    management. Proper position sizing is key to managing risk
                    and to avoid blowing out your account on a single trade. If
                    your position size is too limited or too wide, you may end
                    up taking a lot of risks or end up taking not enough for you
                    to profit from a trade.
                  </p>
                  <p className="text-base font-light">
                    Knowing your risk position is critical to establishing a
                    winning strategy. Our calculator helps you make trading
                    decisions based on intellect and not emotion. That's how you
                    trade like a pro.
                  </p>
                  <p className="text-base font-light">
                    With a few simple inputs, our calculator will help you find
                    the approximate units to buy or sell to control your maximum
                    risk per position.
                  </p>
                </div>
                <h2 className="text-2xl font-semibold my-[30px]">
                  Important terms to understand
                </h2>
                <div className="space-y-6">
                  <p className="text-base font-light">
                    Account capital : Pretty straightforward, traders just need
                    to input their account capital.
                  </p>
                  <p className="text-base font-light">
                    Risk per trade (%) : This is a crucial field. Here you have
                    to put the risk you are wiling to take on that trade in
                    terms of % of your account capital.
                    <br />
                    All Pro traders take risk in a range of 1-5% per trade.
                  </p>
                  <p className="text-base font-light">
                    Stoploss in rupee : Here, traders should input the maximum
                    number of points they are willing to risk, or lose, in a
                    trade, to protect the account capital in case the market
                    goes against their position.
                  </p>
                  <p className="text-base font-light">
                    For eg: You bought in BankNifty CE at 250 Rs and as per your
                    analysis you should exit that trade if price goes below 200
                    Rs. So here you are stoploss is (250 - 200) = Rs. 50
                  </p>
                  <p className="text-base font-light">
                    Lot size : If you are trading in F&O enter the lot size of
                    instrument you are taking trade in.
                  </p>
                </div>
              </div>{" "}
            </section>
            <section className="bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px my-[30px] rounded-md mr-2">
              <div className="font-abcRepro dark:bg-db-primary bg-db-primary-light  p-[30px] rounded-md  ">
                <h2 className="text-2xl font-semibold mb-[25px]">
                  How to use this Calculator?
                </h2>
                <h2 className="text-base font-semibold mb-5">For Equity:</h2>
                <ul>
                  <li className="text-base font-light ">
                    Let's say you have purchased Reliance at 2500.
                  </li>
                  <li className="text-base font-light ">
                    Your Account Capital is 1,00,000
                  </li>
                  <li className="text-base font-light ">
                    You are willing to take Risk per trade is 2%
                  </li>
                  <li className="text-base font-light mb-6">
                    You are planning to exit Reliance if it goes down below
                    2430, so stoploss in rupees is 70
                  </li>
                  <li className="text-base font-light ">
                    Total quantity you can enter with =
                  </li>
                  <li className="text-base font-light mb-6 ">
                    Account capital × Risk per trade (%) / 100 / Stoploss in
                    rupees = (1,00,000) × (2) / 100 / 70 = 28.57 ≈ 28
                  </li>
                  <li className="text-base font-light ">
                    Now amount at risk = Total quantity × stoploss = 28 × 70 =
                    1960
                  </li>
                </ul>
                <h2 className="text-lg font-sebasebold my-[30px]">For F&O:</h2>
                <ul>
                  <li className="text-base font-light ">
                    Let's say you have a capital of 1,00,000
                  </li>
                  <li className="text-base font-light mb-6 ">
                    Account Capital = 1,00,000
                  </li>
                  <li className="text-base font-light ">
                    Now you are willing to take 2% risk per trade. That is the
                    maximum you are willing to lose if trade goes wrong is 2% of
                    account capital
                  </li>
                  <li className="text-base font-light mb-6">
                    = 2% of 1,00,000 = 2000
                  </li>
                  <li className="text-base font-light ">
                    So, Risk Per Trade (%) = 2%
                  </li>
                  <li className="text-base font-light ">
                    You are trading in BankNifty CE
                  </li>
                  <li className="text-base font-light ">
                    Lot size of BankNIfty is 25
                  </li>
                  <li className="text-base font-light mb-6">Lot size = 25</li>
                  <li className="text-base font-light ">
                    Now you have bought the BankNIfty CE at 250 rupees and as
                    per your analysis if BankNifty CE goes below 215 level, you
                    should exit the trade. So here your risk is (250-215) = Rs.
                    35
                  </li>
                  <li className="text-base font-light mb-6 ">
                    So, Stoploss in rupee = 35
                  </li>
                  <li className="text-base font-light ">
                    Here as you are trading in Derivative, you have to buy/sell
                    minimum 1 lot.
                  </li>
                  <li className="text-base font-light ">
                    So. first we will find risk per lot
                  </li>
                  <li className="text-base font-light mb-6">
                    Risk per Lot = Lot Size × Stoploss in Rupee = 25 × 35 = 875
                  </li>
                  <li className="text-base font-light ">
                    Now, No of lots you can trade = Risk per trade in rupee /
                    Risk per Lot
                  </li>
                  <li className="text-base font-light mb-6 ">
                    = 2% of capital / (25 × 35) = 2000 / 875 = 2.28 ≈ 2 lots
                  </li>
                  <li className="text-base font-light mb-6">
                    Total Quantity = No. of lots × Lot Size = 2 × 25 = 50
                  </li>
                  <li className="text-base font-light ">
                    Amount at risk = No. of Lots × Risk per Lot = 2 × 875 = 1750
                  </li>
                </ul>
              </div>
            </section>
          </>
        ) : selectedCalculator === "CAGR" ? (
          <>
            <section className="bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px my-[30px] rounded-md mr-2">
              <div className="font-abcRepro dark:bg-db-primary  bg-db-primary-light p-[30px] rounded-md  ">
                <h2 className="text-2xl font-semibold mb-5">
                  What is Compound Annual Growth Rate (CAGR)?
                </h2>
                <div className="space-y-6">
                  <p className="text-base font-light">
                    Compound Annual Growth Rate (CAGR) is the annual growth of
                    your investments over a specific period of time. In other
                    words, it is a measure of how much you have earned on your
                    investments every year during a given interval. This is one
                    of the most accurate methods of calculating the rise or fall
                    of your investment returns over time.
                  </p>
                </div>
              </div>{" "}
            </section>

            <section className="bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px my-[30px] rounded-md mr-2">
              <div className="font-abcRepro dark:bg-db-primary bg-db-primary-light  p-[30px] rounded-md  ">
                <h2 className="text-2xl font-semibold mb-[25px]">
                  How to calculate CAGR?
                </h2>

                <ul>
                  <li className="text-base font-light ">
                    1st Divide the investment value at the end of the period by
                    the initial value.
                  </li>
                  <li className="text-base font-light ">
                    Then increase the result to the power of one divided by the
                    time period of the investment in years.
                  </li>
                  <li className="text-base font-light ">
                    Subtract one from the total.
                  </li>
                  <li className="text-base font-light mb-6">
                    Mathematically, CAGR formula is given by the following
                    equation-
                  </li>
                </ul>
                <h2 className="text-lg font-sebasebold my-[30px]">
                  CAGR = (FA / IA) 1 / n - 1
                </h2>

                <p className="text-base font-light ">
                  In the above formula, FA stands for the final amount of the
                  investment, IA stands for the present value of the investment,
                  and n stands for the number of years of investment.
                </p>
                <p className="text-lg font-light ">Let's take an example:</p>
                <p className="text-base font-light ">
                  Imagine you invested Rs.20000 in a mutual fund in 2015. The
                  investment will be worth Rs.35000 in 2020. Using the formula,
                  the CAGR of this mutual fund investment will be-
                </p>
                <h2 className="text-lg font-sebasebold my-[30px]">
                  CAGR = (35000 / 20000)(1/5) - 1 = 11.84%
                </h2>
                <p className="text-base font-light ">
                  Here, that means the mutual fund investment gave you an
                  average return of 11.84% per annum. You can also calculate the
                  absolute returns on investment using the CAGR calculator. The
                  calculation will be-
                </p>
                <h2 className="text-lg font-sebasebold my-[30px]">
                  Absolute returns = (FA - IA) / PV * 100 = (35000 - 20000) /
                  20000 * 100 = 75%
                </h2>
                <p className="text-base font-light ">
                  This means your mutual fund investment gave you an absolute
                  return of 75% over its tenure.
                </p>
              </div>
            </section>

            <section className="bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px my-[30px] rounded-md mr-2">
              <div className="font-abcRepro dark:bg-db-primary  bg-db-primary-light p-[30px] rounded-md  ">
                <h2 className="text-2xl font-semibold mb-5">
                  Advantages of using CAGR
                </h2>
                <div className="space-y-6">
                  <ul className="list-disc pl-10">
                    <li className="text-base font-light">
                      It will enable you to evaluate your investment options.
                      For example, if stock A is not working as well as Stock B
                      based on their respective CAGR indices, you can invest in
                      Stock B instead.
                    </li>
                    <li className="text-base font-light">
                      The relative growth of your organization with respect to
                      the market leaders in your business segment.
                    </li>
                    <li className="text-base font-light">
                      CAGR is a more accurate way of calculating and determining
                      returns of an investment the value of which changes over
                      time. Investors can compare the 2 investment options of
                      the same category or a market index using CAGR. How is one
                      investment performing compared to the other of the same
                      category and same time period?
                    </li>
                  </ul>
                </div>
              </div>{" "}
            </section>
          </>
        ) : selectedCalculator === "SIP" ? (
          <>
            <section className="bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px my-[30px] rounded-md mr-2">
              <div className="font-abcRepro dark:bg-db-primary  bg-db-primary-light p-[30px] rounded-md  ">
                <h2 className="text-2xl font-semibold mb-5">
                  What is SIP calculator?
                </h2>
                <div className="space-y-6">
                  <p className="text-base font-light">
                    A Systematic Investment Plan (SIP) calculator is an online
                    financial tool that can help to calculate the returns you
                    would earn on your SIP investments. The calculator also
                    tells you how much you would need to invest every month to
                    earn a target corpus. Simply put, it provides a roadmap to
                    achieve your various financial goals.
                  </p>
                </div>
                <div className="my-5">
                  <p className="text-base font-light">
                    Formula to Calculate your SIP:
                  </p>
                  <p className="text-base font-light">
                    Our SIP Calculator uses the following formula –
                  </p>
                  <p className="text-base font-light">
                    {" M = P × ({[1 + i]^n – 1} / i) × (1 + i)"}
                  </p>
                </div>
                <div className="my-5">
                  <p className="text-base font-light">In this formula –</p>
                  <p className="text-base font-light">
                    M is the amount you receive on maturity
                  </p>
                  <p className="text-base font-light">
                    P is the amount you invest at regular intervals
                  </p>
                  <p className="text-base font-light">
                    n is the number of payments you have made so far
                  </p>
                  <p className="text-base font-light">
                    i is the periodic rate of interest
                  </p>
                </div>
              </div>{" "}
            </section>

            <section className="bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px my-[30px] rounded-md mr-2">
              <div className="font-abcRepro dark:bg-db-primary bg-db-primary-light  p-[30px] rounded-md  ">
                <h2 className="text-2xl font-semibold mb-5">
                  How to calculate SIP investments?
                </h2>

                <ul>
                  <li className="text-base font-light ">
                    Here, as you can see the SIP calculator has three input
                    boxes.
                  </li>
                  <li className="text-base font-light ">
                    -Monthly investment amount
                  </li>
                  <li className="text-base font-light ">
                    -Expected returns(p.a)
                  </li>
                  <li className="text-base font-light mb-6">
                    -Investment period(in years)
                  </li>
                </ul>

                <p className="text-base font-light my-5 ">
                  Suppose you wish to invest Rs. 4,000 per month for 10 years.
                  The expected rate of return is 10%. You need to input these
                  values in the specified boxes, and the calculator gives you
                  the corpus you would earn
                </p>
                <ul>
                  <li className="text-base font-light ">So here,</li>
                  <li className="text-base font-light ">
                    Monthly investment amount = 4,000
                  </li>
                  <li className="text-base font-light ">
                    Expected returns(p.a) = 10%
                  </li>
                  <li className="text-base font-light mb-6">
                    Investment period(in years) = 10 years
                  </li>
                </ul>
                <p className="text-base font-light my-5 ">
                  If you fill the above parameters you will get the result as,
                </p>
                <ul>
                  <li className="text-base font-light ">
                    Invested Amount : ₹4,80,000.00
                  </li>
                  <li className="text-base font-light ">
                    Estimate Returns : ₹3,46,208.08
                  </li>
                  <li className="text-base font-light ">
                    Total Value : ₹8,26,208.08
                  </li>
                </ul>
              </div>
            </section>
          </>
        ) : (
          selectedCalculator === "EMI" && (
            <>
              <section className="bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px my-[30px] rounded-md mr-2">
                <div className="font-abcRepro dark:bg-db-primary  bg-db-primary-light p-[30px] rounded-md  ">
                  <h2 className="text-2xl font-semibold mb-5">
                    What is EMI calculator?
                  </h2>
                  <div className="space-y-6">
                    <p className="text-base font-light">
                      Equated Monthly Installment - EMI for short - is the
                      amount payable every month to the bank or any other
                      financial institution until the loan amount is fully paid
                      off. It consists of the interest on loan as well as part
                      of the principal amount to be repaid. The sum of principal
                      amount and interest is divided by the tenure, i.e., number
                      of months, in which the loan has to be repaid. This amount
                      has to be paid monthly. The interest component of the EMI
                      would be larger during the initial months and gradually
                      reduce with each payment.
                    </p>
                  </div>
                  <div className="my-5 space-y-1">
                    <p className="text-base font-light">
                      The Loan EMI Calculator requires you to fill in only three
                      essential fields to determine your monthly installments
                    </p>
                    <p className="text-base font-light">Loan Amount</p>
                    <p className="text-base font-light">Rate of Interest</p>
                    <p className="text-base font-light">Term of the Loan</p>
                  </div>
                </div>{" "}
                <div className="font-abcRepro dark:bg-db-primary  bg-db-primary-light px-[30px] rounded-md  ">
                  <h2 className="text-lg font-semibold mb-5">Loan Amount:-</h2>
                  <div className="space-y-6">
                    <p className="text-base font-light">
                      Choosing the loan amount is another significant factor for
                      determining your EMI. Based on the loan amount you choose,
                      your equated monthly installment will be calculated
                      accordingly.
                    </p>
                  </div>
                </div>
                <div className="font-abcRepro dark:bg-db-primary  bg-db-primary-light p-[30px] rounded-md  ">
                  <h2 className="text-lg font-semibold mb-5">
                    Rate of Interest:-
                  </h2>
                  <div className="space-y-6">
                    <p className="text-base font-light">
                      The rate of interest is a vital factor that will help to
                      assess the installment amount owed. You can compare the
                      product and opt for one which has a lower rate of interest
                      so that your overall repayment stays low.
                    </p>
                  </div>
                </div>
                <div className="font-abcRepro dark:bg-db-primary  bg-db-primary-light  rounded-md px-[30px] pb-[30px] ">
                  <h2 className="text-lg font-semibold mb-5">
                    Term of the Loan:-
                  </h2>
                  <div className="space-y-6">
                    <p className="text-base font-light">
                      A loan’s tenure may get reduced or extended. Subsequently,
                      there will be an increase or a decrease in the EMI amount
                      as well. Thus, considering the term of a loan is also an
                      important factor that may affect your due amount.
                    </p>
                    <p className="text-base font-light">
                      You can alter the EMI to meet your repayment capacity as
                      well. Increasing the tenor will lower your EMIs and vice
                      versa. You can do this by making changes in the respective
                      fields of the EMI Calculator.
                    </p>
                    <p className="text-base font-light">
                      This Loan EMI Calculator also shows the break-up of the
                      principle and the interest amounts while calculating the
                      EMI.
                    </p>
                  </div>
                </div>{" "}
              </section>

              <section className="bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px my-[30px] rounded-md mr-2">
                <div className="font-abcRepro dark:bg-db-primary bg-db-primary-light  p-[30px] rounded-md  ">
                  <h2 className="text-2xl font-semibold mb-[25px]">
                    Formula:-
                  </h2>

                  <ul>
                    <li className="text-base font-light ">
                      There is a specific formula that we uses to compute the
                      EMI amount for a loan.
                    </li>
                    <li className="text-base font-light my-5 ">
                      {"EMI = [P x R x (1+R) ^ N]/ [(1+R) ^ (N-1)], where –"}
                    </li>
                    <li className="text-base font-light ">
                      P is the principal amount
                    </li>
                    <li className="text-base font-light ">
                      R is the rate of interest
                    </li>
                    <li className="text-base font-light ">
                      N is the loan tenure
                    </li>
                    <li className="text-base font-light mb-6">
                      This is the standardized formula used by any online loan
                      calculator. Some variables may be added based on the type
                      of loan.
                    </li>
                  </ul>

                  <p className="text-lg font-semibold ">
                    How to calculate EMI:-
                  </p>
                  <ul>
                    <li className="text-base font-light  mb-10">
                      For example, if you take a loan of from the bank at 10.5%
                      annual interest for a period of 10 years (i.e., 120
                      months),
                    </li>
                    <li className="text-base font-light ">Then,</li>
                    <li className="text-base font-light ">
                      -Loan Amount = ₹10,00,000
                    </li>
                    <li className="text-base font-light ">
                      -Rate of Interest(p.a) = 10.5%
                    </li>
                    <li className="text-base font-light ">
                      -Loan Tenure (In Years) = 10 years
                    </li>
                  </ul>
                  <p className="text-base font-light my-5 ">
                    Therefore, EMI = ₹10,00,000 * 0.00875 * (1 + 0.00875)120 /
                    ((1 + 0.00875)120 - 1) = ₹13,493.
                  </p>
                  <p className="text-base font-light my-5 ">
                    i.e., you will have to pay ₹13,493 for 120 months to repay
                    the entire loan amount.
                  </p>
                  <p className="text-base font-light my-5 ">
                    The total amount payable will be * 120 = that includes as
                    interest toward the loan.
                  </p>
                </div>
              </section>
            </>
          )
        )}
      </>
    </>
  );
};

export default CalculatorsPage;
