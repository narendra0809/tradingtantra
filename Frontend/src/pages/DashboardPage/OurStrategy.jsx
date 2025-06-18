/* eslint-disable react/prop-types */
// import card_1 from "../../assets/Images/Dashboard/ourStrategy/card_1.png";
// import card_2 from "../../assets/Images/Dashboard/ourStrategy/card_2.png";
// import card_3 from "../../assets/Images/Dashboard/ourStrategy/card_3.png";
// import card_4 from "../../assets/Images/Dashboard/ourStrategy/card_4.png";
// import card_5 from "../../assets/Images/Dashboard/ourStrategy/card_5.png";
// import card_6 from "../../assets/Images/Dashboard/ourStrategy/card_6.png";
// import card_7 from "../../assets/Images/Dashboard/ourStrategy/card_7.png";
import { GoArrowRight } from "react-icons/go";
import { BsFillPlayCircleFill } from "react-icons/bs";
import { useEffect, useState } from "react";
import axios from "axios";
import { ADMIN_SERVER_URI } from "../AdminPages/Home";

const OurStrategy = () => {
  // const importantVideosData = [
  //   {
  //     img: card_1,
  //     title: "Most Important Videos",
  //     description: "Kindly Don't skip this video and watch at least twice.",
  //     url: "",
  //   },
  //   {
  //     img: card_2,
  //     title: "Why 90% traders lose money",
  //     description:
  //       "This is the reason why you are failing and why you will keep losing money if you didn't watch the video and understand it.",
  //     url: "",
  //   },
  //   {
  //     img: card_3,
  //     title: "Risk management",
  //     description:
  //       "Technique to survive the initial phase of trading where majority traders quit trading.",
  //     url: "",
  //   },
  //   {
  //     img: card_4,
  //     title: "Why I am able to make consistent money from the stock market",
  //     description:
  //       "My trading process that has enabled me to trade consistently in the stock market.",
  //     url: "",
  //   },
  //   {
  //     img: card_5,
  //     title: "How to select stocks for intraday or swing trading",
  //     description: "My secret method on finding the winners for the day.",
  //     url: "",
  //   },
  //   {
  //     img: card_6,
  //     title: "Truth of Strategy",
  //     description:
  //       "What strategy actually means and how does this tool help you in trading strategy?",
  //     url: "",
  //   },
  //   {
  //     img: card_7,
  //     title: "Strategy fundamentals",
  //     description: "Different components of trading strategy.",
  //     url: "",
  //   },
  // ];

  // const strategyVideosData = [
  //   { title: "Strategy ES", url: "" },
  //   { title: "Strategy ES CBO", url: "" },
  //   { title: "Strategy ES MS", url: "" },
  //   { title: "Strategy ES FMR", url: "" },
  //   { title: "Strategy SP", url: "" },
  //   { title: "Strategy TM", url: "" },
  //   { title: "Strategy PB", url: "" },
  // ];
  const [videos, setVideos] = useState([]);

  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-strategy`);
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      setVideos(res.data.videos);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Our Strategy</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {videos.map((strategyVideo, index) => (
          <StrategyVideoCard key={index} strategyVideo={strategyVideo} />
        ))}
      </div>
    </div>
  );
};

// const ImportantVideoCard = ({ impVideo }) => {
//   return (
//     <div className="bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px rounded-lg">
//       <div className="bg-db-primary dark:bg-db-primary rounded-lg p-4 h-full flex flex-col">
//         <div className="relative mb-4 rounded-md overflow-hidden">
//           <img
//             src={impVideo.img}
//             className="w-full h-auto object-cover"
//             alt={impVideo.title}
//           />
//           <div className="absolute inset-0 flex items-center justify-center">
//             <BsFillPlayCircleFill className="text-[#0457F5] text-4xl" />
//           </div>
//         </div>

//         <div className="flex-grow flex flex-col">
//           <h2 className="text-base font-medium mb-2">{impVideo.title}</h2>
//           <p className="text-xs font-light mb-4 flex-grow">
//             {impVideo.description}
//           </p>
//           <button className="border flex items-center justify-center gap-2 border-[#0659F6] py-2 rounded-md font-medium w-full">
//             Watch Video
//             <GoArrowRight />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

const StrategyVideoCard = ({ strategyVideo }) => {
  return (
    <div className="w-[75%] bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px rounded-lg">
      <div className="bg-db-primary dark:bg-db-primary rounded-lg p-4 h-full flex flex-col">
        <div className="flex-grow dark:bg-[#02000E] bg-db-primary rounded-lg flex items-center justify-center mb-4">
          <div className="relative text-center p-4">
            <p
              className="uppercase text-[20px] sm:text-[24px] md:text-[30px] lg:text-[40px] xl:text-[50px] text-[#ED9B2F] font-bold"
              style={{
                textShadow:
                  "rgb(24 9 255) 0px 0px 20px, rgb(24 9 255) 0px 0px 20px",
              }}
            >
              <img
                width={300}
                height={300}
                src={strategyVideo.thumbnailUrl}
                alt="img"
              />
            </p>
            <BsFillPlayCircleFill className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#0457F5] text-4xl" />
          </div>
        </div>

        <div>
          <p className="text-xl font-medium mb-4">{strategyVideo.title}</p>
          <p className="text-lg font-medium mb-4">
            {strategyVideo.description}
          </p>
          <a
            href={strategyVideo.videoUrl}
            target="_blank"
            className="border cursor-pointer flex items-center justify-center gap-2 border-[#0659F6] py-2 rounded-md font-medium w-full"
          >
            Watch Video
            <GoArrowRight />
          </a>
        </div>
      </div>
    </div>
  );
};

export default OurStrategy;
