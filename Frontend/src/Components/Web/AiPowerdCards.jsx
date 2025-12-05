import AiPoweredCardImage1 from "../../assets/Images/AiPoweredCardImage1.png";
import SwingTradesImg from "../../assets/Images/SwingTradesImg.png";
import moneyImg from "../../assets/Images/moneyImg.png";
import optionInsiderImg from "../../assets/Images/option-insider.png";

const AiPowerdCards = () => {
  const cardData = [
    {
      img: AiPoweredCardImage1,
      title: "AI Market Depth",
      data: [
        "Gives and compares past data with current data through AI",
        "Keep a watch on what BIG PLAYERS are doing in LIVE MARKET in STOCKS",
        "Custom STOCK screeners for making perfect trades",
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
      img: optionInsiderImg,
      title: "AI OPTION INSIDER",
      data: [
        "Gives in depth INSIGHTS of options in live market",
        "Keep a watch on what BIG PLAYERS are doing in LIVE MARKET in INDEX",
        "Advanced OPTIONS analysis using AI",
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
