import React from "react";
import card_1 from "../../assets/Images/Dashboard/ourStrategy/card_1.png";
import card_2 from "../../assets/Images/Dashboard/ourStrategy/card_2.png";
import card_3 from "../../assets/Images/Dashboard/ourStrategy/card_3.png";
import card_4 from "../../assets/Images/Dashboard/ourStrategy/card_4.png";
import card_5 from "../../assets/Images/Dashboard/ourStrategy/card_5.png";
import card_6 from "../../assets/Images/Dashboard/ourStrategy/card_6.png";
import card_7 from "../../assets/Images/Dashboard/ourStrategy/card_7.png";
import { GoArrowRight } from "react-icons/go";
import { BsFillPlayCircleFill } from "react-icons/bs";

const OurStrategy = () => {
  const importantVideosData = [
    {
      img: card_1,
      title: "Most Important Videos",
      description: "Kindly Don’t skip this video and watch at least twice.",
      url: "",
    },
    {
      img: card_2,
      title: "Why 90% traders lose money",
      description:
        "This is the reason why you are failing and why you will keep losing money if you didn’t watch the video and understand it.",
      url: "",
    },
    {
      img: card_3,
      title: "Risk management",
      description:
        "Technique to survive the initial phase of trading where majority traders quit trading.",
      url: "",
    },
    {
      img: card_4,
      title: "Why I am able to make consistent money from the stock market",
      description:
        "My trading process that has enabled me to trade consistently in the stock market.",
      url: "",
    },
    {
      img: card_5,
      title: "How to select stocks for intraday or swing trading",
      description: "My secret method on finding the winners for the day.",
      url: "",
    },
    {
      img: card_6,
      title: "Truth of Strategy",
      description:
        "What strategy actually means and how does this tool help you in trading strategy?",
      url: "",
    },
    {
      img: card_7,
      title: "Strategy fundamentals",
      description: "Different components of trading strategy.",
      url: "",
    },
  ];

  const strategyVideosData = [
    { title: "Strategy ES", url: "" },
    { title: "Strategy ES CBO", url: "" },
    { title: "Strategy ES MS", url: "" },
    { title: "Strategy ES FMR", url: "" },
    { title: "Strategy SP", url: "" },
    { title: "Strategy TM", url: "" },
    { title: "Strategy PB", url: "" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Our Strategy</h1>

      <h2 className="text-lg font-medium mt-5 mb-2.5">Important Videos</h2>
      <div className="grid grid-cols-1 gap-y-5 gap-x-[25px] md:grid-cols-2 lg:grid-cols-3">
        {importantVideosData.map((impVideo, index) => (
          <ImportantVideoCard key={index} impVideo={impVideo} />
        ))}
      </div>
      
      <h1 className="text-2xl font-bold mt-[50px] mb-5">Strategy Videos</h1>
      <div className="grid grid-cols-1 gap-y-5 gap-x-[25px] md:grid-cols-2 lg:grid-cols-3">
        {strategyVideosData.map((strategyVideo, index) => (
          <StrategyVideoCard key={index} strategyVideo={strategyVideo} />
        ))}
      </div>
    </div>
  );
};

const ImportantVideoCard = ({ impVideo }) => {
  return (
    <div className="bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px rounded-md">
      <div className="dark:bg-db-primary bg-db-primary-light relative border border-transparent rounded-md p-2.5 h-[350px]">
        <div className="flex flex-col items-start space-y-2.5">
          <div className="w-full rounded-md relative">
            <img src={impVideo.img} className="w-full h-auto" alt={impVideo.title} />
            <BsFillPlayCircleFill className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#0457F5] text-4xl" />
          </div>
          <div className="flex flex-col gap-y-2.5 justify-between items-start">
            <h2 className="text-base font-medium">{impVideo.title}</h2>
            <p className="text-xs font-light">{impVideo.description}</p>
          </div>
          <button className="border absolute left-2 bottom-2 flex gap-2 items-center border-[#0659F6] py-2 rounded-md font-medium px-3">
            Watch Video
            <GoArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

const StrategyVideoCard = ({ strategyVideo }) => {
  return (
    <div className="bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px rounded-md">
      <div className="dark:bg-db-primary bg-db-primary-light relative  border border-transparent rounded-md p-2.5 h-[350px] flex flex-col justify-start">
        <div className="relative dark:bg-[#02000E] bg-db-secondary-light w-full h-[60%] flex justify-center items-center">

        <p className="uppercase lg:text-[50px] md:text-[40px] sm:text-[24px] text-[20px] leading-13  text-center text-[#ED9B2F] px-20 font-bold text-wrap" style={{ textShadow: "rgb(24 9 255) 0px 0px 20px, rgb(24 9 255) 0px 0px 20px" }}>
          {strategyVideo.title}
        </p>
        <BsFillPlayCircleFill className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#0457F5] text-4xl" />
        </div>
        
        <p className="text-xl font-medium mt-5 ">
          {strategyVideo.title}
        </p>
        <button className="border absolute left-2 bottom-2 flex gap-2 items-center border-[#0659F6] py-2 rounded-md font-medium px-3">
          Watch Video
          <GoArrowRight />
        </button>
      </div>
    </div>
  );
};

export default OurStrategy;