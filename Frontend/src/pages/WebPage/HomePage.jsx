import React from "react";
import AiStar from "../../assets/Images/AiIntegrationImg.png";
import AiStock from "../../assets/Images/AiIntegrationStartImg.svg";
import DoorImg from "../../assets/Images/DoorImg.svg";
import GearImg from "../../assets/Images/GearImg.svg";
import Target from "../../assets/Images/Target.svg";
import laptopImg from "../../assets/Images/laptopImg.png";
import done from "../../assets/Images/done.svg";
import { PiFireSimpleFill } from "react-icons/pi";
import { LuLogIn } from "react-icons/lu";
import AiPowerdCard from "../../Components/Web/AiPowerdCards";
import BenefitCards from "../../Components/Web/BenefitCards";
import TestimonialsCarousel from "../../Components/Web/TestimonialsCarousel";
const HomePage = () => {
  const Features = [
    "Market Depth",
    "Custom Strategy",
    "Sector Depth",
    "Ai Swing Trades",
    "Option Clock",
    "FII / DII Data",
    "Index Depth",
    "Trading Journal",
    "learn From Us",
    "Over Strategy",
    "Financial Calender",
    "Calculator",
  ];
  return (
    <>
      {/* hero section */}
      <div className="bg-[#02000e] w-full md:h-screen h-auto font-Inter ">
        <div className="blue-blur-circle"></div>
        <div className="flex flex-col items-center justify-center mt-40 space-y-12 md:w-[70%] sm:w-[90%] w-full mx-auto">
          <img src={AiStar} alt="" />
          <h1 className="text-primary font-extrabold md:text-6xl text-4xl text-center">
            India’s First AI Stock Screener
          </h1>
          <p className="text-[#A6AAB2] font-sm text-center">
            Step into the world of trading excellence and seize every
            opportunity with our advanced platform, expert guidance, and
            strategic insights for unrivaled financial success.
          </p>
        </div>
        <div className="flex items-center justify-center md:w-1/2 w-full md:text-base sm:text-sm text-xs mx-auto">
          <div className="grid grid-cols-2 mx-auto mt-10 gap-3">
            <div className="flex gap-2 items-center">
              <img src={AiStock} className="w-6 h-6 " />
              <p>AI stock selection algorithm</p>
            </div>
            <div className="flex gap-2 items-center">
              <img src={DoorImg} className="w-6 h-6 " />
              <p>Perfect Entry and Exit Strategies</p>
            </div>
            <div className="flex gap-2 items-center">
              <img src={GearImg} className="w-6 h-6 " />
              <p>Smooth Execution</p>
            </div>
            <div className="flex gap-2 items-center">
              <img src={Target} className="w-6 h-6 " />
              <p>Don’t Miss any opportunity</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center sm:mt-20 mt-10 gap-4 ">
          <button className="sm:text-xl text-sm bg-primary flex items-center gap-2 rounded-3xl px-3 py-2">
            <PiFireSimpleFill /> Buy Now
          </button>
          <button className="sm:text-xl text-sm  flex items-center gap-2 rounded-3xl px-3 py-2 bg-[#0256F533] text-white border border-[#0A7CFF33] backdrop-blur-lg">
            <LuLogIn /> Login
          </button>
        </div>
      </div>

      {/* laptop img sectionF */}
      <div className="sm:w-4/5 w-full mx-auto mt-10">
        <img src={laptopImg} className="w-full" />
      </div>

      {/* AI Powered Features */}

      <div className="w-full md:mt-40 mt-20 font-abcRepro">
        <h1 className="font-bold md:text-4xl sm:text-2xl text-xl mb-15">
          AI Powered Features
        </h1>
        <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
          <AiPowerdCard />
        </div>
      </div>

      {/* TradingTantra Benefits - */}
      <div className="w-full mt-40 font-abcRepro">
        <h1 className="font-bold md:text-4xl sm:text-2xl text-xl mb-15">
          TradingTantra Benefits -
        </h1>
        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
          <BenefitCards />
        </div>
      </div>

      {/* crystal plan */}
      <div className="font-abcRepro flex flex-col items-center justify-center mt-40">
        <h2 className="md:text-4xl text-2xl  font-bold mb-10">
          Trust,Trade,Win,Boom
        </h2>
        <div className="bg-[url(./assets/Images/CrystalPlanImg.png)] lg:w-[806px] w-full md:h-[453px] h-auto  max-auto rounded-3xl">
          <div className=" bg-[#000A2D66] text-white border border-[#0A7CFF33]  w-full h-full  rounded-4xl md:px-10 px-4 md:pb-0 pb-10 ">
            <div className="flex justify-between items-center  ">
              <div className="md:mt-10 mt-0">
                <h4 className="uppercase font-bold md:text-5xl sm:text-3xl text-xl  md:tracking-wider tracking-wide  ">
                  crystal
                </h4>
                <p className=" uppercase md:text-xl sm:text-lg text-base md:tracking-[16px] tracking-wide font-light">
                  Plan
                </p>
              </div>
              <div>
                <div className="md:space-y-4 sm:space-y-2 space-y1 rounded-b-2xl bg-[#0257f567] md:px-10 px-5 md:py-7 py-3 flex flex-col items-center">
                  <p className="md:text-xl  sm:text-lg text-sm  font-black">
                    Validity = 6 Months{" "}
                  </p>
                  <p className="md:text-3xl  sm:text-lg text-sm   font-bold">
                    +
                  </p>
                  <p className="md:text-2xl  sm:text-lg text-sm   font-black">
                    6 Months Free
                  </p>
                </div>
                <p className="text-center mt-3 text-2xl font-thin">
                  Limited Offer
                </p>
              </div>
            </div>
            <div>
              <p className="md:text-2xl text-xl md:tracking-[13px] tracking-widest">
                Total
              </p>
              <p className="md:text-6xl text-5xl font-extrabold text-primary">
                ₹ 3,999
              </p>
            </div>
            <button className="w-full md:h-15 h-10 bg-primary rounded-lg md:mt-10 mt-5 md:text-2xl text-xl">
              Buy Now
            </button>
          </div>
        </div>

        <h2 className="font-bold md:text-3xl sm:text-2xl text-xl mt-10 ">
          Unlock Everything with Tutorial Videos
        </h2>
        <div className="grid md:grid-cols-3 grid-cols-2  gap-y-5 md:gap-x-10 gap-x-3 lg:w-3/4 md:w-[90%] w-full  mx-auto xl:ml-67 ml-5 mt-10">
          {Features.map((item, index) => (
            <div className="flex items-center gap-4">
              <img src={done} className="sm:w-6 w-4 sm:h-6 h-4 " />
              <p className="md:text-base sm:text-sm text-xs font-light">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* testimonial */}

      <div>
        <h4 className="font-bold text-3xl text-center mt-40">Testmonial</h4>
        <div className="w-full mt-20">
          <TestimonialsCarousel />
        </div>
      </div>
    </>
  );
};

export default HomePage;
