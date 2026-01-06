import HomePageGridLayout from "../../Components/Dashboard/HomePageGridLayout";
import TradingJournalImg from "../../assets/Images/Dashboard/homepage/TradingJournalImg.png";
import TradingJournalImgLight from "../../assets/Images/Dashboard/homepage/TradingJournalImgLight.png";
import FinancialCalendarIMg from "../../assets/Images/Dashboard/homepage/FinancialCalendarIMg.png";
import FinancialCalendarIMgLight from "../../assets/Images/Dashboard/homepage/FinancialCalendarIMgLight.png";
import FIIDII from "../../assets/Images/Dashboard/homepage/FII-DII-Img.png";
import FIIDIILight from "../../assets/Images/Dashboard/homepage/FII-DII-ImgLight.png";
import CalculatorImg from "../../assets/Images/Dashboard/homepage/CalculatorImg.png";
import CalculatorImgLight from "../../assets/Images/Dashboard/homepage/CalculatorImgLight.png";
import { useSelector } from "react-redux";

const Homepage = () => {
  const theme = useSelector((state) => state.theme.theme);

  const cards = [
    {
      imgDark: TradingJournalImg,
      imgLight: TradingJournalImgLight,
      title: "Trading Journal",
      desc: "A gamified finance toolkit offering simulations and challenges to help users understand real-world financial scenarios",
      link: "/trading-journal",
    },
    {
      imgDark: FIIDII,
      imgLight: FIIDIILight,
      title: "Fii-Dii",
      desc: "It offers a crucial data into how Foreign Institutional Investors (FIIs) and Domestic Institutional Investors (DIIs) are positioning in market. By analyzing their daily investment patterns, you gain early cues about potential market movements.",
      link: "/fii-dii",
    },
    {
      imgDark: FinancialCalendarIMg,
      imgLight: FinancialCalendarIMgLight,
      title: "Financial Calendar",
      desc: "Use your financial calendar to identify potential market volatility surrounding major events allowing you to trade strategically.",
      link: "/financial-calendar",
    },
    {
      imgDark: CalculatorImg,
      imgLight: CalculatorImgLight,
      title: "Calculator",
      desc: "Discover the power of financial planning with our comprehensive calculator page. Explore tools like Risk, CAGR, SIP, EMI, and many more calculators, empowering you to make informed decisions tailored to your financial goals.",
      link: "/calculator",
    },
  ];
  return (
    <>
      <HomePageGridLayout />
      <section className="w-full space-y-3 sm:space-y-4 md:space-y-5">
        {cards.map((card, index) => (
          <div
            key={index}
            className="flex lg:flex-row flex-col gap-3 sm:gap-4 md:gap-5 p-3 sm:p-4 dark:bg-db-primary bg-[#ffffff] rounded-lg sm:rounded-[10px] min-h-[180px] sm:min-h-[200px]"
          >
            {/* Image Section */}
            <img
              src={theme === "dark" ? card.imgDark : card.imgLight}
              alt={card.title}
              className="lg:w-[60%] w-full object-cover rounded-lg sm:rounded-[10px] h-auto"
            />

            {/* Text Section */}
            <div className="dark:bg-db-secondary bg-[#EEEEEE] rounded-lg sm:rounded-[10px] p-3 sm:p-4 flex-1 flex flex-col justify-start gap-4 sm:gap-6 md:gap-10">
              <h5 className="text-lg sm:text-xl md:text-2xl font-medium">{card.title}</h5>
              <p className="text-sm sm:text-base md:text-xl font-light">{card.desc}</p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
};

export default Homepage;
