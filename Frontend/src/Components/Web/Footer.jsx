import React from "react";
import { useLocation, Link } from "react-router-dom";
import logo from "../../assets/Images/logo.svg";
import logo_light from "../../assets/Images/logo_light.svg";
import { FaFacebookSquare } from "react-icons/fa";
import { PiInstagramLogoFill } from "react-icons/pi";
import { FaXTwitter } from "react-icons/fa6";
import flag from "../../assets/Images/flag.svg";
import { useSelector } from "react-redux";

const Footer = () => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  const isDashboardRoute = location.pathname.includes("/dashboard");
const theme=useSelector((state)=>state.theme.theme)
  return (
    <div className="dark:bg-db-primary bg-db-primary-light  w-full px-[5%]  pt-10 font-abcRepro mt-20">
      <div className="flex sm:flex-row flex-col gap-y-5 justify-between">
        <div className="lg:space-y-10 space-y-8">
          <img
            src={theme==="dark"?logo:logo_light}
            className="lg:w-60 w-60  h-auto"
            alt="trading tantra logo"
          />
          <div className="flex justify-start gap-3 text-4xl ">
            <PiInstagramLogoFill />
            <FaFacebookSquare />
            <FaXTwitter />
          </div>
        </div>
        <div className="sm:w-96 w-65 space-y-8 ">
          {/* Conditionally Render Button */}
          <Link to={isDashboardRoute ? "/" : "/dashboard"}>
            <button className="lg:ml-48 md:ml-40 sm:ml-35 ml-0 px-4 py-2 mb-10 dark:bg-primary bg-primary-light rounded-md font-normal lg:text-xl md:text-lg text-base">
              {isDashboardRoute ? "Go to Website" : "View Dashboard"}
            </button>
          </Link>

          <div className="flex justify-between w-full items-start">
            <ul className="space-y-2">
              <h3 className="sm:text-base text-lg font-bold">Terms Of Use</h3>
              <Link to={"/disclaimer"}>
                <li className="text-sm font-normal">Disclaimer</li>
              </Link>
              <Link to={"/refund-policy"}>
                <li className="text-sm font-normal">Refund Policy</li>
              </Link>
              <Link to={"/disclosures"}>
                <li className="text-sm font-normal">Disclosures</li>
              </Link>
              <Link to={"/terms-and-condition"}>
                <li className="text-sm font-normal">Terms & Conditions</li>
              </Link>
              <Link to={"/privacy-policy"}>
                <li className="text-sm font-normal">Privacy Policy</li>
              </Link>
            </ul>
            <ul className="space-y-2">
              <h3 className="sm:text-base text-lg font-bold">Company</h3>
              <Link to={"/"}>
                <li className="text-sm font-light">Home</li>
              </Link>
              <Link to={"/updates"}>
                <li className="text-sm font-light">Updates</li>
              </Link>
              <Link to={"/about-us"}>
                <li className="text-sm font-light">About Us</li>
              </Link>
              <Link to={"/contact-us"}>
                <li className="text-sm font-light">Contact Us</li>
              </Link>
              <Link to={"/faq"}>
                <li className="text-sm font-light">FAQ</li>
              </Link>
            </ul>
          </div>
        </div>
      </div>
      <div className="w-full mt-10 border-t-2 border-t-[#00124F] border-b-2 border-b-[#00124F] py-10 space-y-5 text-sm">
        <p className="font-light text-lg leading-6 tracking-wider">
          TradingTantra is India’s 1st AI stock screener which is made with love
          in INDIA.
        </p>
        <p className="font-light  leading-6 tracking-widest">
          At TradingTantra we make advanced AI algorithms which provide
          thoroughly filtered stocks on which you can make trades according to
          your analysis.Through our AI algorithms we try to make your trading
          experience smoother and profitable.
        </p>
        <p className="font-light  leading-6 tracking-widest">
          Our mission is to teach you and make you an independent trader instead
          of providing calls or tips.
        </p>
        <p className="font-light   leading-6 tracking-widest">
          We see heavy potential in INDIA and Indian Stock Market and
          TradingTantra will provide you an edge above others.
        </p>
        <p className="font-light   leading-6 tracking-widest">
          Disclaimer: Investing involves risk, and past performance is not
          indicative of future results. Please conduct your own research before
          making investment decisions.
        </p>
        <p className="font-light text-base leading-6 tracking-widest">
          With TradingTantra you can do the following types of trading - 
        </p>
        <ul className="space-y-1 mt-10">
          <li className="font-thin text-base leading-6 tracking-widest">
            -Intraday Trading
          </li>
          <li className="font-thin text-base leading-6 tracking-widest">
            -BTST
          </li>
          <li className="font-thin text-base leading-6 tracking-widest">
            -Swing Trading
          </li>
          <li className="font-thin text-base leading-6 tracking-widest">
            -Option Buying
          </li>
          <li className="font-thin text-base leading-6 tracking-widest">
            -Option Selling
          </li>
          <li className="font-thin text-base leading-6 tracking-widest">
            -Scalping Trading
          </li>
        </ul>
      </div>
      <div className="flex items-center sm:flex-row flex-col justify-between py-10">
        <p className="sm:text-base text-sm">
          &copy; {currentYear} Trading Tantra. All Rights Reserved
        </p>
        <div className="flex items-center gap-1 sm:text-base text-sm">
          Made with ❤️ in{" "}
          <img src={flag} className="w-5 h-5" alt="Indian flag" />
        </div>
      </div>
    </div>
  );
};

export default Footer;
