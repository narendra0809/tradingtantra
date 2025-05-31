/* eslint-disable react/prop-types */

import CustomHeroImage from "../../Components/CustomHeroImage";
import { disclaimerListData } from "../../constants/constants";

const DisclaimerPage = () => {
  return (
    <>
      <CustomHeroImage title="Disclaimer" />

      <h1 className="md:text-2xl text-xl font-bold font-abcRepro text-wrap md:w-[60%] w-full text-center md:leading-10 mx-auto ">
        Welcome to <span className="text-primary"> TradingTantra.in. </span>
        By using our website, you acknowledge and agree to the following
        disclaimers:
      </h1>

      <div className="md:space-y-10 space-y-5 mt-20">
        {disclaimerListData.map((list, index) => (
          <DisclaimerList key={index} list={list} />
        ))}
      </div>
    </>
  );
};
const DisclaimerList = ({ list }) => (
  <div className="bg-[#01071C] w-full md:mx-10 border-l-2 border-l-primary p-5 font-abcRepro md:space-y-2 space-y-1">
    <h1 className="md:text-2xl text-xl font-bold ">{list.title}</h1>
    <p className="md:text-base text-sm font-light">{list.desc}</p>
    {list.desc2 && <p className="text-base font-light">{list.desc2}</p>}
  </div>
);
export default DisclaimerPage;
