import marketDepth from "../../assets/Images/Dashboard/homepage/marketDepth.png";
import customStrategy from "../../assets/Images/Dashboard/homepage/customer-strategy.png";
import sectorDepth from "../../assets/Images/Dashboard/homepage/sector-depth.png";
import AiSwing from "../../assets/Images/Dashboard/homepage/AI-swing.png";
import clock from "../../assets/Images/Dashboard/homepage/clock.png";
import profit from "../../assets/Images/Dashboard/homepage/profit.png";
import graph from "../../assets/Images/Dashboard/homepage/graph.png";
import learnBook from "../../assets/Images/Dashboard/homepage/learn-book.png";
import ourStrategy from "../../assets/Images/Dashboard/homepage/over-strategy.png";
import { useNavigate } from "react-router-dom";

const HOME_CARDS = [
  {
    id: "ai-market-depth",
    gridClass: "div1",
    img: marketDepth,
    imgAlt: "Market Depth",
    title: "AI Market Depth",
    description:
      "It identifies stocks where the big players are actively building positions.",
    buttonLabel: "AI Market Depth",
    to: "/dashboard/market-depth",
  },
  {
    id: "ai-sector-depth",
    gridClass: "div2",
    img: sectorDepth,
    imgAlt: "Sector Depth",
    title: "AI Sector Depth",
    description:
      "Perfect for traders aiming for high-profit trades with pinpoint accuracy.",
    buttonLabel: "Sector Depth",
    to: "/dashboard/sector-depth",
  },
  {
    id: "ai-option-clock",
    gridClass: "div3",
    img: clock,
    imgAlt: "Option Clock",
    title: "AI Option Clock",
    description: "Just select time and get position built up by big players.",
    buttonLabel: "AI Option Clock",
    to: "/dashboard/option-clock",
  },
  {
    id: "smart-money-action",
    gridClass: "div4",
    img: customStrategy,
    imgAlt: "Customer Strategy",
    title: "Smart Money Action",
    description:
      '"Customer Strategy" analyzes stocks based on proven market structures.',
    buttonLabel: "Smart Money Action",
    to: "/dashboard/smart-action",
  },
  {
    id: "ai-swing-traders",
    gridClass: "div5",
    img: AiSwing,
    imgAlt: "AI Swing Traders",
    title: "AI Swing Traders",
    description:
      "Find best stocks for swing trading based on different strategies.",
    buttonLabel: "AI Swing Traders",
    to: "/dashboard/swing-trades",
  },
  {
    id: "profit",
    gridClass: "div6",
    img: profit,
    imgAlt: "Profit",
    title: "Profit",
    description:
      "Trading profit is earnings from core business activities before deductions.",
    buttonLabel: "Profit",
    to: "/dashboard/profit",
  },
  {
    id: "index-depth",
    gridClass: "div7",
    img: graph,
    imgAlt: "Index Depth",
    // no title in your JSX, only text
    description:
      '"Index Depth" shows which stocks are the driving forces behind index movements.',
    buttonLabel: "Index Depth",
    to: "/dashboard/index-depth",
    extraButtonClasses: "mt-10",
  },
  {
    id: "learn-from-us",
    gridClass: "div8",
    img: learnBook,
    imgAlt: "Learn From Us",
    title: "Learn From Us",
    description:
      "Take maximum benefits of Trade Tantra & learn how to use different features.",
    buttonLabel: "Learn From Us",
    to: "/dashboard/learn-from-us",
    extraButtonClasses: "mt-10",
  },
  {
    id: "our-strategy",
    gridClass: "div9",
    img: ourStrategy,
    imgAlt: "Our Strategy",
    title: "Our Strategy",
    description:
      "Take maximum benefits of Trade Tantra & learn how to use different features.",
    buttonLabel: "Our Strategy",
    to: "/dashboard/our-strategy",
    extraButtonClasses: "mt-10",
  },
];

const HomePageGridLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="py-10">
      <h1 className="text-2xl font-bold mb-6">Indian Markets</h1>

      <div className="homeParent">
        {HOME_CARDS.map(
          ({
            id,
            gridClass,
            img,
            imgAlt,
            title,
            description,
            buttonLabel,
            to,
            extraButtonClasses = "",
          }) => (
            <div
              key={id}
              className={`${gridClass} dark:bg-gradient-to-br from-[#0009B2] to-[#02000E] p-px rounded-lg`}
            >
              <div className="bg-db-primary not-dark:bg-[#ffffff] border border-transparent rounded-xl p-4 relative shadow-lg w-full h-full flex flex-col justify-between">
                <div className="flex flex-col items-start space-x-3">
                  <div className={title ? "flex items-center gap-3" : ""}>
                    <div>
                      <img className="w-12 h-12" src={img} alt={imgAlt} />
                    </div>
                    {title && (
                      <h2 className="font-semibold text-lg">{title}</h2>
                    )}
                  </div>
                  <div>
                    <p className="text-[#FFFFFF] not-dark:text-black font-light text-sm mt-5">
                      {description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(to)}
                  className={`w-full bg-[#0256F5] text-white py-2 rounded-md font-medium mt-4 ${extraButtonClasses}`}
                >
                  {buttonLabel}
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default HomePageGridLayout;
