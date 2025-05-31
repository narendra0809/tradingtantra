/* eslint-disable react/prop-types */
import AboutUsImg from "../../assets/Images/AboutUsImg.png";
import CustomHeroImage from "../../Components/CustomHeroImage";
import { aboutListData } from "../../constants/constants";
const AboutUsPage = () => {
  return (
    <>
      <CustomHeroImage title="About Us" />

      <div className="grid md:grid-cols-2 grid-cols-1 gap-10 font-abcRepro">
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
        {aboutListData.map((list) => (
          <AboutList key={list.id} list={list} />
        ))}
      </div>
    </>
  );
};

const AboutList = ({ list }) => (
  <div className="bg-[#01071C] w-full md:mx-10 mx-0 border-l-2 border-l-primary p-5 font-abcRepro space-y-2">
    <h1 className="md:text-2xl text-xl font-bold ">{list.title}</h1>
    <p className="md:text-base text-sm font-light">{list.desc}</p>
  </div>
);
export default AboutUsPage;
