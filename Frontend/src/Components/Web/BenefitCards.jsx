import React from "react";
import Journal from "../../assets/Images/tredingJournalImg.png";
import search from "../../assets/Images/searchImg.png";
import money from "../../assets/Images/moneyImg.png";
import smallChart from "../../assets/Images/smallChartImg.png";
import calculator from "../../assets/Images/calculatorImg.png";
import videoImg from "../../assets/Images/videoImg.png";
import FiiDii from "../../assets/Images/FiiDiiImg.png";
import calander from "../../assets/Images/calanderImg.png";
import { DiJava } from "react-icons/di";

const BenefitCards = () => {
  const cardData = [
    {
      img: Journal,
      title: "Trading Journal",
      desc: "Keep log of all your trades,Learn by your mistakes",
    },
    {
      img: search,
      title: "AI Market Depth",
      desc: "Get AI Filtered Stocks in LIVE Market",
    },
    {
      img: money,
      title: "Smart Money Action",
      desc: "Track where big players are putting money",
    },
    {
      img: smallChart,
      title: "AI Swing Trades",
      desc: "Get AI Filtered Swing Stocks in LIVE Market",
    },
    {
      img: calculator,
      title: "Risk Calculator",
      desc: "Take calculated risk with our risk calculator",
    },
    {
      img: videoImg,
      title: "Strategy Videos",
      desc: "Get all my strategy videos here",
    },
    {
      img: FiiDii,
      title: "FII-DII Data",
      desc: "Get FII DII data insights",
    },
    {
      img: calander,
      title: "Financial Calendar",
      desc: "Never miss any important news and events",
    },
    {
      img: smallChart,
      title: "Index Depth",
      desc: "In Depth Analysis on INDEX",
    },
  ];
  return (
    <>
      {cardData.map((card, index) => (
        <div key={index} className="flex gap-4 px-2 py-3 font-abcRepro border-[0.5px]  border-primary bg-[#000517] rounded-2xl items-center">
          <div>
            <img src={card.img} className="w-24 h-24" />
          </div>
          <div className="space-y-3">
            <p className="text-xl font-black">{card.title}</p>
            <p className="text-sm font-thin">{card.desc}</p>
          </div>
        </div>
      ))}
    </>
  );
};

export default BenefitCards;
