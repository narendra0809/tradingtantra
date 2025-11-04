/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useEffect } from "react";
import { IoTriangle } from "react-icons/io5";
import Lock from "../../Components/Dashboard/Lock";
import Cookies from "js-cookie";
const LearnFromUsPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const contentRefs = useRef([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const toggleDetail = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const data = [
    {
      title: "What Mistakes new people make while using Trading Tantra?",
      desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem unde corporis perferendis velit quasi culpa hic qui, fuga laboriosam pariatur doloribus accusamus! Placeat recusandae, similique eos odio vero delectus hic ab labore magni est.",
    },
    {
      title: "Trading Techniques",
      desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem unde corporis perferendis velit quasi culpa hic qui, fuga laboriosam pariatur doloribus accusamus! Placeat recusandae, similique eos odio vero delectus hic ab labore magni est.",
    },
    {
      title: "Market Pulse",
      desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem unde corporis perferendis velit quasi culpa hic qui, fuga laboriosam pariatur doloribus accusamus! Placeat recusandae, similique eos odio vero delectus hic ab labore magni est.",
    },
    {
      title: "Insider Strategy",
      desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem unde corporis perferendis velit quasi culpa hic qui, fuga laboriosam pariatur doloribus accusamus! Placeat recusandae, similique eos odio vero delectus hic ab labore magni est.",
    },
    {
      title: "Sector Scope",
    },
    {
      title: "Swing Spectrum",
      desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem unde corporis perferendis velit quasi culpa hic qui, fuga laboriosam pariatur doloribus accusamus! Placeat recusandae, similique eos odio vero delectus hic ab labore magni est.",
    },
    {
      title: "Option Clock",
    },
    {
      title: "Option Apex",
    },
    {
      title: "FII / DII",
    },
    {
      title: "Trading Journal",
    },
  ];

  useEffect(() => {
    contentRefs.current = contentRefs.current.slice(0, data.length);
  }, [data]);

  useEffect(() => {
    const Subscribed = Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed === "true");
  }, []);

  return (
    <>
      <div className="w-full h-full mx-auto ">
        <h2 className="font-abcRepro font-semibold text-3xl my-10 not-dark:text-black">
          Learn From Us
        </h2>
        {!isSubscribed ? (
          <Lock />
        ) : (
          data.map((data, index) => (
            <div
              key={index}
              className="dark:bg-db-primary bg-primary-light  mb-3 rounded-2xl border border-[#0256f535] "
            >
              {/* Question Section */}
              <div
                className="py-5 px-4 cursor-pointer flex gap-2 items-center justify-between  "
                onClick={() => toggleDetail(index)}
              >
                <h3 className="md:text-lg text-base font-light font-abcRepro">
                  {data.title}
                </h3>
                {data.desc && (
                  <span>
                    {activeIndex === index ? (
                      <IoTriangle className="text-lg font-semibold rotate-180" />
                    ) : (
                      <IoTriangle className="text-lg font-semibold" />
                    )}
                  </span>
                )}
              </div>

              {/* Answer Section */}
              <div
                ref={(el) => (contentRefs.current[index] = el)}
                className={`overflow-hidden transition-[height,opacity] duration-200 ease-linear px-4  `}
                style={{
                  height:
                    activeIndex === index
                      ? `${contentRefs.current[index]?.scrollHeight}px`
                      : "0px",
                  opacity: activeIndex === index ? 1 : 0,
                }}
              >
                <p className="text-base font-abcRepro py-4">{data.desc}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default LearnFromUsPage;
