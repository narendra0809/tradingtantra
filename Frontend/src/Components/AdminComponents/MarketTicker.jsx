import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import hdfc from "../../assets/adminImages/hdfc2.png";
import icici from "../../assets/adminImages/ici.png";
import rel from "../../assets/adminImages/reli.png";
import state from "../../assets/adminImages/state.png";
import tata from "../../assets/adminImages/tcs.png";

const data = [
  {
    name: "ICICI Bank",
    price: "1246.75",
    change: "-24.16",
    percent: "-1.87%",
    icon: icici,
  },
  {
    name: "TCS",
    price: "4099.25",
    change: "-85.00",
    percent: "-2.03%",
    icon: tata,
  },
  {
    name: "HDFC Bank",
    price: "3240.30",
    change: "-44.05",
    percent: "-1.35%",
    icon: hdfc,
  },
  {
    name: "SBI",
    price: "793.50",
    change: "-7.55",
    percent: "-0.94%",
    icon: state,
  },
  {
    name: "RELI",
    price: "N/A",
    change: "N/A",
    percent: "N/A",
    icon: rel,
  },
];

const MarketTicker = () => {
  const controls = useAnimation();
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const tickerItems = [...data, ...data]; // For looping effect

  useEffect(() => {
    const startScroll = async () => {
      const container = containerRef.current;
      const content = contentRef.current;

      if (!container || !content) return;

      const distance = content.scrollWidth - container.offsetWidth;
      let direction = 1;

      while (true) {
        await controls.start({
          x: direction === 1 ? -distance : 0,
          transition: { duration: 20, ease: "linear" },
        });
        direction *= -1;
      }
    };

    startScroll();
  }, [controls]);

  return (
    <div
      ref={containerRef}
      className="bg-[#0c0c1d] w-full  sm:max-w-3xl md:max-w-4xl lg:max-w-5xl mx-2 overflow-hidden border border-blue-950 rounded-xl py-3 mt-4 px-1 sm:px-2"
    >
      <motion.div
        ref={contentRef}
        className="flex gap-4 sm:gap-6 whitespace-nowrap"
        animate={controls}
      >
        {tickerItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center space-x-1 sm:space-x-2 min-w-max px-2 sm:px-4 py-1 text-xs sm:text-sm md:text-base"
          >
            <div className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center">
              <img
                src={item.icon}
                alt={item.name}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-white font-medium whitespace-nowrap">
              {item.name}
            </span>
            <span className="text-gray-300">• {item.price}</span>
            <span
              className={
                item.change === "N/A"
                  ? "text-gray-400"
                  : parseFloat(item.change) < 0
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              {item.change} ({item.percent})
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default MarketTicker;
