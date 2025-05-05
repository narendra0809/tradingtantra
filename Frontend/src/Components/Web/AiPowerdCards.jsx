import React from "react";
import AiPoweredCardImage1 from "../../assets/Images/AiPoweredCardImage1.png";
import moneyImg from "../../assets/Images/moneyImg.png";
import AiSectorAnalysisImg from "../../assets/Images/AiSectorAnalysisImg.png";
import SwingTradesImg from "../../assets/Images/SwingTradesImg.png";
const AiPowerdCards = () => {
  const cardData = [
    {
      img: AiPoweredCardImage1,
      title: "AI Market Depth",
      data: [
        "Track deep market insights",
        "Super Refined AI filtered Momentum Stocks",
        "In Depth Analysis through AI",
      ],
    },
    {
      img: moneyImg,
      title: "Smart Money Action",
      data: [
        "Track smart money through AI",
        "Get all Premium Data",
        "Find major momentum stocks",
      ],
    },
    {
      img: AiSectorAnalysisImg,
      title: "AI Sector Analysis",
      data: [
        "Get in Depth Sectoral Analysis",
        "Track performance of all Sectors",
        "Easy to understand graphical representation",
      ],
    },
    {
      img: SwingTradesImg,
      title: "AI Swing Trades",
      data: [
        "Get major AI Breakout Stocks",
        "Get major AI Reversal Stocks",
        "AI Super Stock Selection",
      ],
    },
  ];

  return (
    <>
      {cardData.map((card, index) => (
        <div
          key={index}
          className="rounded-3xl bg-[#01071C] border border-[#000A2D] px-5 py-2 flex flex-col items-start font-abcRepro  "
        >
          <img src={card.img} alt={card.title} className="w-25 h-25 mt-5" />
          <h4 className="text-2xl font-bold mt-14 mb-5 ">{card.title}</h4>
          <ul className="list-disc px-2">
            {card.data.map((data, index) => (
              <li key={index}>{data}</li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
};

export default AiPowerdCards;
