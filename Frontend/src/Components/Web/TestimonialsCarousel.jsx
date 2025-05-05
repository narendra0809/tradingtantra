import React from "react";
import { motion } from "framer-motion";
import userImg from "../../assets/Images/userImg.png";

const testimonials = [
  {
    name: "Vikram Dhule",
    text: "By far the best tool to pick right trades in live market. Now I can do Job and trading side by side. Thanks TradeFinder team to develop such tool. It will really help to all part time traders like us",
    image: userImg,
    hash: "#tradingmadesimple",
  },
  {
    name: "Preetam S",
    text: "Sir I'm college student and from long time I'm in search of such tool which can help me to find momentum stocks in less time and then I can easily trade and made money.",
    image: userImg,
    hash: "#tradingmadesimple",
  },
  {
    name: "Shivam Bhoir",
    text: "TradeFinder changed my trading game! Now I can easily understand where the big players stand in Nifty BankNifty options. It's like having a secret weapon in the market. Best tool for option buyers. Kudos Team TradeFinder",
    image: userImg,
    hash: "#tradingmadesimple",
  },
  {
    name: "Kapil Shah",
    text: "As a office person, I only trade in first 2 hours. TradeFinder really helped me to calm myself and show the best trading opportunities available in live market and now am getting consistent results.",
    image: userImg,
    hash: "#tradingmadesimple",
  },
  {
    name: "Karthik S",
    text: "My problem was, I always used to enter late and miss the main move. Now using Intraday boost, able to spot good trades very early. Keep it up TradeFinder for making trading finding easy. Long way to go, but now I am confident.",
    image: userImg,
    hash: "#tradingmadesimple",
  },
];

const TestimonialsCarousel = () => {
  return (
    <div className="relative flex flex-col md:flex-row md:space-x-6 overflow-hidden h-[500px] md:h-[700px] w-full  ">
      {/* Blurred Overlay - Top */}
      <div className="absolute top-0 left-0 w-full h-20 md:h-40 bg-gradient-to-b from-[#0E1225] via-[#0E1225]/80 to-transparent z-10 pointer-events-none" />

      {/* Blurred Overlay - Bottom */}
      <div className="absolute bottom-0 left-0 w-full h-20 md:h-40 bg-gradient-to-t from-[#0E1225] via-[#0E1225]/80 to-transparent z-10 pointer-events-none" />

      {/* Responsive Grid for Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <Column testimonials={testimonials} direction="down" speed={20} />
        <Column testimonials={testimonials} direction="up" speed={25} />
        <Column testimonials={testimonials} direction="down" speed={22} />
      </div>
    </div>
  );
};

const Column = ({ testimonials, direction, speed }) => {
  const duplicatedTestimonials = [...testimonials, ...testimonials];
  const optimizedTestimonials = [...duplicatedTestimonials.slice(0, -1)];

  return (
    <div className="w-full  h-[500px] md:h-[700px] overflow-hidden relative">
      <motion.div
        className="flex flex-col space-y-4"
        animate={{ y: direction === "up" ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: speed,
          ease: "linear",
        }}
      >
        {optimizedTestimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-[#161B32] text-white p-3 md:p-4 rounded-lg shadow-md"
          >
            <div className="flex items-center space-x-3">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full"
              />
              <h3 className="font-bold text-sm md:text-base">{testimonial.name}</h3>
            </div>
            <p className="text-xs md:text-sm mt-2">{testimonial.text}</p>
            <p className="text-xs md:text-sm mt-4">{testimonial.hash}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default TestimonialsCarousel;
