import React from "react";

const DisclaimerPage = () => {
  const disclaimerListData = [
    {
      title: "1. No Investment Advice",
      desc: "TradingTantra.in is an AI-powered stock market screener designed to provide data, analytics, and insights. However, we do not provide financial, investment, legal, or tax advice. Any information on this website is for educational and informational purposes only and should not be considered as a recommendation to buy, sell, or hold any securities.",
      desc2:
        "Before making any investment decisions, consult a qualified financial advisor and conduct your own due diligence.",
    },
    {
      title: "2. Market Risks",
      desc: "Stock market investments carry inherent risks, including potential loss of principal. Past performance of any stock, strategy, or tool does not guarantee future results. TradingTantra.in does not take responsibility for any financial losses incurred due to reliance on our website's data or tools.",
    },
    {
      title: "3. Accuracy of Information",
      desc: "We strive to provide accurate and up-to-date information, but we do not guarantee the accuracy, completeness, or reliability of any content on TradingTantra.in. Market data, stock prices, and financial metrics may be delayed or sourced from third-party providers, and we are not responsible for any discrepancies.",
    },
    {
      title: "4. Third-Party Links & Services",
      desc: "Our website may contain links to third-party websites, tools, or services. These are provided for convenience only, and TradingTantra.in does not endorse or assume responsibility for any content, policies, or services offered by external websites.",
    },
    {
      title: "5. No Liability",
      desc: "Under no circumstances shall TradingTantra.in, its owners, employees, partners, or affiliates be liable for any direct, indirect, incidental, or consequential damages arising from the use of our website. Your use of TradingTantra.in is at your own risk.",
    },
    {
      title: "6. Regulatory Compliance",
      desc: "Users are responsible for ensuring compliance with all applicable laws and regulations in their respective jurisdictions before engaging in stock market activities. TradingTantra.in does not provide regulatory guidance.",
    },
    {
      title: "7. Changes to This Disclaimer",
      desc: "We reserve the right to update, modify, or remove any part of this disclaimer at any time without prior notice. Please review this page periodically for changes.",
    },
  ];

  return (
    <>
   <div className="bg-[url(./assets/Images/heroImg.png)]  rounded-3xl md:w-[90%] w-full md:h-[360px] h-[200px] mx-auto object-center bg-no-repeat md:my-35 mt-30 mb-20  flex items-center justify-center font-abcRepro ">
        <div className="blue-blur-circle"></div>

        <h1 className="md:text-6xl text-4xl font-abcRepro font-bold">Disclaimer</h1>
      </div>

      <h1 className="md:text-2xl text-xl font-bold font-abcRepro text-wrap md:w-[60%] w-full text-center md:leading-10 mx-auto ">
        Welcome to <span className="text-primary"> TradingTantra.in. </span>
        By using our website, you acknowledge and agree to the following
        disclaimers:
      </h1>

      <div className="md:space-y-10 space-y-5 mt-20">
        {disclaimerListData.map((list, index) => (
          <DisclaimerList key={index} list={list} />
        ))}
      </div>
    </>
  );
};
const DisclaimerList = ({ list }) => (
  <div className="bg-[#01071C] w-full md:mx-10 border-l-2 border-l-primary p-5 font-abcRepro md:space-y-2 space-y-1">
    <h1 className="md:text-2xl text-xl font-bold ">{list.title}</h1>
    <p className="md:text-base text-sm font-light">{list.desc}</p>
    {list.desc2 && <p className="text-base font-light">{list.desc2}</p>}
  </div>
);
export default DisclaimerPage;
