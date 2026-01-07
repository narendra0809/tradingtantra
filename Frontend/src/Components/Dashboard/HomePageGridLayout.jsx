import marketDepth from "../../assets/Images/Dashboard/homepage/marketDepth.png";
import customStrategy from "../../assets/Images/Dashboard/homepage/customer-strategy.png";
import sectorDepth from "../../assets/Images/Dashboard/homepage/sector-depth.png";
import AiSwing from "../../assets/Images/Dashboard/homepage/AI-swing.png";
import clock from "../../assets/Images/Dashboard/homepage/clock.png";
import profit from "../../assets/Images/Dashboard/homepage/profit.png";
import graph from "../../assets/Images/Dashboard/homepage/graph.png";
import learnBook from "../../assets/Images/Dashboard/homepage/learn-book.png";
import ourStrategy from "../../assets/Images/Dashboard/homepage/over-strategy.png";
import optionInsiderImg from "../../assets/Images/option-insider.png";
import FIIDII from "../../assets/Images/Dashboard/homepage/FII-DII-Img.png";
import TradingJournalImg from "../../assets/Images/Dashboard/homepage/TradingJournalImg.png";
import CalculatorImg from "../../assets/Images/Dashboard/homepage/CalculatorImg.png";
// Using calculator image as placeholder for Feedback Form
import FeedbackImg from "../../assets/Images/Dashboard/homepage/CalculatorImg.png";

import { useNavigate } from "react-router-dom";

// Cards ordered exactly as per sidebar sequence
// OPTIONS section first, then INTRADAY STOCKS, then SWING, then OTHERS
const HOME_CARDS = [
  // OPTIONS Section (from sidebar)
  {
    id: "ai-option-insider",
    gridClass: "div1",
    img: optionInsiderImg,
    imgAlt: "Option Insider",
    title: "AI Option Insider",
    description:
      "Gives in depth INSIGHTS of options in live market Keep a watch on what BIG PLAYERS are doing in LIVE MARKET in INDEX Advanced OPTIONS analysis using AI",
    buttonLabel: "AI Option Insider",
    to: "/dashboard/option-insider",
  },
  {
    id: "ai-option-data",
    gridClass: "div1",
    img: graph, // Using graph as placeholder for Option Data
    imgAlt: "AI Option Data",
    title: "AI Option Data",
    description:
      "Advanced options data analysis with comprehensive insights and real-time market data.",
    buttonLabel: "AI Option Data",
    to: "/dashboard/option-data",
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
    id: "index-depth",
    gridClass: "div7",
    img: graph,
    imgAlt: "Index Depth",
    title: "AI Index Depth",
    description:
      '"Index Depth" shows which stocks are the driving forces behind index movements.',
    buttonLabel: "Index Depth",
    to: "/dashboard/index-depth",
    extraButtonClasses: "mt-10",
  },
  // INTRADAY STOCKS Section (from sidebar)
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
  // SWING Section (from sidebar)
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
  // OTHERS Section (from sidebar) - including commented items that user wants
  {
    id: "fii-dii",
    gridClass: "div10",
    img: FIIDII,
    imgAlt: "FII / DII Data",
    title: "FII / DII Data",
    description:
      "Track Foreign Institutional Investors and Domestic Institutional Investors positioning in the market.",
    buttonLabel: "FII / DII Data",
    to: "/dashboard/fii-dii",
  },
  {
    id: "trading-journal",
    gridClass: "div11",
    img: TradingJournalImg,
    imgAlt: "Trading Journal",
    title: "Trading Journal",
    description:
      "A gamified finance toolkit offering simulations and challenges to help users understand real-world financial scenarios.",
    buttonLabel: "Trading Journal",
    to: "/dashboard/trading-journal",
  },
  {
    id: "calculator",
    gridClass: "div12",
    img: CalculatorImg,
    imgAlt: "Calculator",
    title: "Calculator",
    description:
      "Discover the power of financial planning with our comprehensive calculator page. Explore tools like Risk, CAGR, SIP, EMI, and many more calculators.",
    buttonLabel: "Calculator",
    to: "/dashboard/calculator",
  },
  // {
  //   id: "profit",
  //   gridClass: "div13",
  //   img: profit,
  //   imgAlt: "Profit",
  //   title: "Profit",
  //   description:
  //     "Trading profit is earnings from core business activities before deductions.",
  //   buttonLabel: "Profit",
  //   to: "/dashboard/profit",
  // },
  {
    id: "feedback-form",
    gridClass: "div14",
    img: FeedbackImg,
    imgAlt: "Feedback Form",
    title: "Feedback Form",
    description:
      "Share your feedback and suggestions to help us improve Trading Tantra.",
    buttonLabel: "Feedback Form",
    to: "/dashboard/feedback",
  },
  // {
  //   id: "learn-from-us",
  //   gridClass: "div8",
  //   img: learnBook,
  //   imgAlt: "Learn From Us",
  //   title: "Learn From Us",
  //   description:
  //     "Take maximum benefits of Trade Tantra & learn how to use different features.",
  //   buttonLabel: "Learn From Us",
  //   to: "/dashboard/learn-from-us",
  //   extraButtonClasses: "mt-10",
  // },
  // {
  //   id: "our-strategy",
  //   gridClass: "div9",
  //   img: ourStrategy,
  //   imgAlt: "Our Strategy",
  //   title: "Our Strategy",
  //   description:
  //     "Take maximum benefits of Trade Tantra & learn how to use different features.",
  //   buttonLabel: "Our Strategy",
  //   to: "/dashboard/our-strategy",
  //   extraButtonClasses: "mt-10",
  // },
];

const HomePageGridLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="py-6 sm:py-8 md:py-10">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Indian Markets</h1>

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
              <div className="bg-db-primary not-dark:bg-[#ffffff] border border-transparent rounded-xl p-3 sm:p-4 relative shadow-lg w-full h-full flex flex-col justify-between">
                <div className="flex flex-col items-start space-x-3">
                  <div className={title ? "flex items-center gap-2 sm:gap-3" : ""}>
                    <div>
                      <img className="w-10 h-10 sm:w-12 sm:h-12" src={img} alt={imgAlt} />
                    </div>
                    {title && (
                      <h2 className="font-semibold text-base sm:text-lg">{title}</h2>
                    )}
                  </div>
                  <div>
                    <p className="text-[#FFFFFF] not-dark:text-black font-light text-xs sm:text-sm mt-3 sm:mt-5">
                      {description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(to)}
                  className={`w-full bg-[#0256F5] text-white py-1.5 sm:py-2 rounded-md font-medium text-sm sm:text-base mt-3 sm:mt-4 ${extraButtonClasses}`}
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
