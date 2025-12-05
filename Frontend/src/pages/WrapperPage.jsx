// /* eslint-disable react/prop-types */
// import SectionImage from "../assets/Images/SectionImage.png";
// import { useMediaQuery } from "react-responsive";

// const WrapperPage = ({ children }) => {
//   const height = useMediaQuery({ maxHeight: "740px" });
//   return (
//     <div
//       className={`w-full flex max-sm:pt-4 ${
//         !height && "h-screen"
//       } bg-[#02000e]`}
//     >
//       <section className="w-full lg:w-[45%] text-white flex items-center justify-center">
//         <div className="w-full max-w-md px-6">{children}</div>
//       </section>

//       <section className="hidden lg:block w-[55%]">
//         <img
//           src={SectionImage}
//           className="w-full h-full object-cover"
//           alt="SectionImage"
//         />
//       </section>
//     </div>
//   );
// };

// export default WrapperPage;

/* eslint-disable react/prop-types */

/* eslint-disable react/prop-types */
import SectionImage from "../assets/Images/SectionImage.png";

const WrapperPage = ({ children }) => {
  return (
    <div className="w-full flex h-screen bg-[#02000e] overflow-hidden">
      <section className="w-full lg:w-[45%] h-full overflow-y-auto custom-scrollbar">
        <div className="w-full min-h-full flex items-center justify-center p-6">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </section>
      <section className="hidden lg:block w-[55%] h-full">
        <img
          src={SectionImage}
          className="w-full h-full object-cover"
          alt="SectionImage"
        />
      </section>
    </div>
  );
};

export default WrapperPage;
