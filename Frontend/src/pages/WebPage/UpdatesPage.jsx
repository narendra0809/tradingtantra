import React from "react";

const UpdatesPage = () => {
  const updates = [
    {
      date: "2025-01-27",
      type: "Release",
      desc: "Intraday Boost Filters 🔥🔥 Now filter out stocks in Intraday Boost to find pinpoints stocks to trade in Intraday.",
    },
    {
      date: "2025-01-21",
      type: "Improvement",
      desc: "R. Factor is supercharged! 🚀 We rebuilt it from the ground up to find the best momentum stocks. Get ready for a whole new level of results, starting today!",
    },
    {
      date: "2024-10-19",
      type: "Update",
      desc: "After thorough backtesting, updated the core engine behind Contraction BO stocks in Insider Strategies for better results and accuracy for all the users.",
    },
    {
      date: "2025-01-27",
      type: "Release",
      desc: "Intraday Boost Filters 🔥🔥 Now filter out stocks in Intraday Boost to find pinpoints stocks to trade in Intraday.",
    },
    {
      date: "2025-01-21",
      type: "Improvement",
      desc: "R. Factor is supercharged! 🚀 We rebuilt it from the ground up to find the best momentum stocks. Get ready for a whole new level of results, starting today!",
    },
    {
      date: "2024-10-19",
      type: "Update",
      desc: "After thorough backtesting, updated the core engine behind Contraction BO stocks in Insider Strategies for better results and accuracy for all the users.",
    },
  ];
  return (
    <>
      <div className="bg-[url(./assets/Images/heroImg.png)] rounded-3xl md:w-[90%] w-full md:h-[360px] h-[200px] mx-auto object-center bg-no-repeat md:my-35 mt-30 mb-20 flex items-center justify-center font-abcRepro ">
        <h1 className="md:text-6xl text-4xl font-abcRepro font-bold">Updates</h1>
      </div>
      <div className="w-full h-auto p-6 md:p-10 border-2 border-[#0256F5] rounded-lg">
        {updates.map((item, index) => (
          <div key={index} className="py-5 flex flex-col md:flex-row items-start md:items-center justify-start gap-4 md:gap-8 border-b border-b-[#013AA6] w-full">
            <p className="text-base w-32 md:w-40">{item.date}</p>
            <div className="w-24 h-10 flex items-center justify-center rounded-lg text-xs font-semibold" style={{ backgroundColor: item.type === "Release" ? "#6E9FFE" : item.type === "Improvement" ? "#151B2D" : "var(--color-primary)" }}>
              <p className={item.type === "Improvement" ? "text-white" : "text-[#03071B]"}>{item.type}</p>
            </div>
            <p className="text-sm text-[#FFFFFF80] text-wrap md:flex-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default UpdatesPage;