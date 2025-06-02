/* eslint-disable react/prop-types */
import SectionImage from "../assets/Images/SectionImage.png";

const WrapperPage = ({ children }) => {
  return (
    <div className="w-full flex h-[100vh] bg-[#02000e]">
      <section className="w-full lg:w-[45%] text-white flex items-center justify-center">
        <div className="w-full max-w-md px-6">{children}</div>
      </section>

      <section className="hidden lg:block w-[55%]">
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
