import React from "react";
import AboutUsImg from "../../assets/Images/AboutUsImg.png"
const AboutUsPage = () => {

  const aboutListData =[
    {title:"About Trading Tantra: Empowering Your Trading Journey",
      desc:"Innovation is the heartbeat of TradeFinder. We continuously explore new frontiers in trading technology, ensuring that our users are always at the forefront of market trends. Our commitment to innovation keeps our platform dynamic, relevant, and powerful.",
    },
    {title:"Why Choose TradeFinder: A Platform That Understands You",
      desc:"TradeFinder is not just a tool; it's a reflection of our users aspirations, challenges, and successes. We've created a platform that understands and adapts to your needs, helping you navigate the markets with confidence and clarity. Choosing TradeFinder means choosing a partner that empowers, educates, and elevates your trading experience.",
    },
    {title:"Join Us: Be Part of the TradeFinder Revolution",
      desc:"As we continue to redefine the trading landscape, we invite you to join us on this exciting journey. Be a part of the TradeFinder revolution and experience trading like never before. It's time to turn your trading aspirations into achievements. Welcome to TradeFinder - where every trader is a priority, and every trade, a possibility.",
    },
  ]
  return (
    <>
      <div className="bg-[url(./assets/Images/heroImg.png)]  rounded-3xl md:w-[90%] w-full md:h-[360px] h-[200px] mx-auto object-center bg-no-repeat md:my-35 mt-30 mb-20  flex items-center justify-center font-abcRepro ">
        <div className="blue-blur-circle"></div>

        <h1 className="md:text-6xl text-4xl font-abcRepro font-bold">About Us</h1>
      </div>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-10 font-abcRepro  ">
        <img src={AboutUsImg} className="rounded-2xl" />
        <div className="space-y-4">
          <h3 className="font-bold md:text-4xl text-xl text-wrap tracking-wide md:leading-15">
            About Trading Tantra: Empowering Your Trading Journey
          </h3>
          <p className="text-base font-light text-wrap">
            TradingTantra is India’s 1st AI stock screener which is made with
            love in INDIA
          </p>
          <p className="text-base font-light text-wrap">
            At TradingTantra we make advanced AI algorithms which provide
            thoroughly filtered stocks on which you can make trades according to
            your analysis.Through our AI algorithms we try to make your trading
            experience smoother and profitable.
          </p>
          <p className="text-base font-light text-wrap">
            Our mission is to teach you and make you an independent trader
            instead of providing calls or tips.
          </p>
          <p className="text-base font-light text-wrap">
            We see heavy potential in INDIA and Indian Stock Market and
            TradingTantra will provide you an edge above others.
          </p>
          <div className="flex flex-col items-start gap-y-3">
            <p className="texe-base font-medium ">Disclaimer: </p>
            <p className="text-base font-light text-wrap">
              Investing involves risk, and past performance is not indicative of
              future results. Please conduct your own research before making
              investment decisions.
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold font-abcRepro my-20">
        With TradingTantra you can do the following types of trading - 
      </h1>

      <div className="flex items-center lg:justify-between justify-center flex-wrap font-abcRepro  lg:w-4/5 w-full  mx-auto mb-10 gap-5">
        <p className="bg-[#01071C] px-5 py-3 rounded-full font-light text-base">
          Intraday Trading
        </p>
        <p className="bg-[#01071C] px-5 py-3 rounded-full font-light text-base">
          BTST
        </p>
        <p className="bg-[#01071C] px-5 py-3 rounded-full font-light text-base">
          Swing Trading
        </p>
        <p className="bg-[#01071C] px-5 py-3 rounded-full font-light text-base">
          Option Buying
        </p>
        <p className="bg-[#01071C] px-5 py-3 rounded-full font-light text-base">
          Scalping Trading
        </p>
      </div>

      <div className="space-y-5 mt-20">

        {aboutListData.map((list,index)=>(
          <AboutList key={index} list={list}/>
        ))}
      </div>
    </>
  );
};

const AboutList = ({list}) => (
  <div className="bg-[#01071C] w-full md:mx-10 mx-0 border-l-2 border-l-primary p-5 font-abcRepro space-y-2">
    <h1 className="md:text-2xl text-xl font-bold ">{list.title}</h1>
    <p className="md:text-base text-sm font-light">{list.desc}</p>
  </div>
);
export default AboutUsPage;
