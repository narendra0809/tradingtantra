import { useState, useRef, useEffect } from "react";

import { IoTriangle } from "react-icons/io5";
import CustomHeroImage from "../../Components/CustomHeroImage";
import { faqs } from "../../constants/constants";
const FAQPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const contentRefs = useRef([]);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  useEffect(() => {
    contentRefs.current = contentRefs.current.slice(0, faqs.length);
  }, []);

  return (
    <>
      <CustomHeroImage title="FAQ" />
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
