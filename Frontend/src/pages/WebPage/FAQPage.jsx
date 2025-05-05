import React, { useState, useRef, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa6";

import { IoTriangle } from "react-icons/io5";
const FAQPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const contentRefs = useRef([]);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "1. What is TradeFinder?",
      answer:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem unde corporis perferendis velit quasi culpa hic qui, fuga laboriosam pariatur doloribus accusamus! Placeat recusandae, similique eos odio vero delectus hic ab labore magni est.",
    },
    {
      question: "2. Who can use TradeFinder?",
      answer:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem unde corporis perferendis velit quasi culpa hic qui, fuga laboriosam pariatur doloribus accusamus! Placeat recusandae, similique eos odio vero delectus hic ab labore magni est.",
    },
    {
      question: "3. How do I sign up for TradeFinder?",
      answer:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem unde corporis perferendis velit quasi culpa hic qui, fuga laboriosam pariatur doloribus accusamus! Placeat recusandae, similique eos odio vero delectus hic ab labore magni est.",
    },
    {
      question: "4. What kind of trading strategies does TradeFinder support?",
      answer:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem unde corporis perferendis velit quasi culpa hic qui, fuga laboriosam pariatur doloribus accusamus! Placeat recusandae, similique eos odio vero delectus hic ab labore magni est.",
    },
    {
      question:
        "5. Does TradeFinder offer educational resources for beginners?",
      answer:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem unde corporis perferendis velit quasi culpa hic qui, fuga laboriosam pariatur doloribus accusamus! Placeat recusandae, similique eos odio vero delectus hic ab labore magni est.",
    },
    {
      question:
        "6. Can I integrate my existing brokerage account with TradeFinder?",
      answer:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem unde corporis perferendis velit quasi culpa hic qui, fuga laboriosam pariatur doloribus accusamus! Placeat recusandae, similique eos odio vero delectus hic ab labore magni est.",
    },
    {
      question:
        "7. How does TradeFinder differentiate itself from other trading platforms?",
      answer:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem unde corporis perferendis velit quasi culpa hic qui, fuga laboriosam pariatur doloribus accusamus! Placeat recusandae, similique eos odio vero delectus hic ab labore magni est.",
    },
    {
      question: "8. What kind of customer support does TradeFinder offer?",
      answer:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem unde corporis perferendis velit quasi culpa hic qui, fuga laboriosam pariatur doloribus accusamus! Placeat recusandae, similique eos odio vero delectus hic ab labore magni est.",
    },
    {
      question:
        "9. Are there any additional costs or fees for using TradeFinder?",
      answer:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem unde corporis perferendis velit quasi culpa hic qui, fuga laboriosam pariatur doloribus accusamus! Placeat recusandae, similique eos odio vero delectus hic ab labore magni est.",
    },
    {
      question: "10. How can I update or cancel my subscription?",
      answer:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem unde corporis perferendis velit quasi culpa hic qui, fuga laboriosam pariatur doloribus accusamus! Placeat recusandae, similique eos odio vero delectus hic ab labore magni est.",
    },
    {
      question: "11. Is TradeFinder available on mobile devices?",
      answer:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem unde corporis perferendis velit quasi culpa hic qui, fuga laboriosam pariatur doloribus accusamus! Placeat recusandae, similique eos odio vero delectus hic ab labore magni est.",
    },
    {
      question: "12. Can I access TradeFinder from multiple devices?",
      answer:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem unde corporis perferendis velit quasi culpa hic qui, fuga laboriosam pariatur doloribus accusamus! Placeat recusandae, similique eos odio vero delectus hic ab labore magni est.",
    },
  ];

  useEffect(() => {
    contentRefs.current = contentRefs.current.slice(0, faqs.length);
  }, [faqs]);

  return (
    <>
      <div className="bg-[url(./assets/Images/heroImg.png)]  rounded-3xl md:w-[90%] w-full md:h-[360px] h-[200px] mx-auto object-center bg-no-repeat md:my-35 mt-30 mb-20  flex items-center justify-center font-abcRepro ">

        <h1 className="md:text-6xl text-4xl font-abcRepro font-bold">FAQ</h1>
      </div>
      <div className="w-full mx-auto ">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-[#01071C] sm:mb-5 mb-3 rounded-2xl border border-[#0256f535] "
          >
            {/* Question Section */}
            <div
              className="py-5 px-4 cursor-pointer flex gap-2 items-center justify-between  "
              onClick={() => toggleFAQ(index)}
            >
              <h3 className="md:text-lg text-base font-light font-abcRepro">
                {faq.question}
              </h3>
              <span>
                {activeIndex === index ? (
                  <IoTriangle className="text-lg font-semibold rotate-180" />
                ) : (
                  <IoTriangle className="text-lg font-semibold" />
                )}
              </span>
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
              <p className="text-base font-abcRepro py-4">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default FAQPage;
