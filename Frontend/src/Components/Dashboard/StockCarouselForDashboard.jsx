import React from "react";
import { motion } from "framer-motion";

const stocks = [
  { symbol: "RELIANCE", price: 2450, change: 12.5, changePercent: 0.51 },
  { symbol: "TCS", price: 3750, change: -8.2, changePercent: -0.22 },
  { symbol: "SBIN", price: 595, change: 5.1, changePercent: 0.86 },
  { symbol: "INFY", price: 1605, change: -6.7, changePercent: -0.42 },
  { symbol: "HDFCBANK", price: 1570, change: 4.3, changePercent: 0.27 },
  { symbol: "ICICIBANK", price: 930, change: -5.5, changePercent: -0.59 },
  { symbol: "LT", price: 3075, change: 18.9, changePercent: 0.62 },
  { symbol: "BAJAJFINANCE", price: 7000, change: -40, changePercent: -0.57 },
  { symbol: "AXISBANK", price: 950, change: 6.2, changePercent: 0.66 },
  { symbol: "WIPRO", price: 450, change: -2.4, changePercent: -0.53 },
  { symbol: "HCLTECH", price: 1300, change: 8.5, changePercent: 0.65 },
  { symbol: "ITC", price: 420, change: 1.5, changePercent: 0.36 },
  { symbol: "MARUTI", price: 11050, change: -25, changePercent: -0.23 },
  { symbol: "M&M", price: 1600, change: 7.3, changePercent: 0.46 },
  { symbol: "ONGC", price: 180, change: -1.8, changePercent: -0.99 },
  { symbol: "POWERGRID", price: 275, change: 3.2, changePercent: 1.18 },
  { symbol: "SUNPHARMA", price: 1170, change: -9.6, changePercent: -0.81 },
  { symbol: "TATAMOTORS", price: 680, change: 5.6, changePercent: 0.83 },
  { symbol: "BPCL", price: 425, change: -2.3, changePercent: -0.54 },
  { symbol: "COALINDIA", price: 245, change: 4.1, changePercent: 1.71 },
];

const tickerData = [...stocks, ...stocks];

const StockCarouselForDashboard = () => {
  return (
    <div className=" dark:bg-[#000517] bg-[#273D8F]     border border-[#000B34] rounded-sm mt-10 py-2 overflow-hidden w-full flex ">
      <motion.div
        className="flex"
        initial={{ x: 0 }}
        animate={{ x: "-100%" }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration:150,
        }}
      >
        {tickerData.map((stock, index) => (
          <div
            key={index}
            className="flex items-center text-white text-lg font-semibold px-4 whitespace-nowrap"
          >
            <span className="mr-2">{stock.symbol}</span>
            <span>₹{stock.price}</span>
            <span
              className={`ml-2 ${
                stock.change < 0 ? "text-red-500" : "text-green-500"
              }`}
            >
              {stock.change} ({stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default StockCarouselForDashboard;
