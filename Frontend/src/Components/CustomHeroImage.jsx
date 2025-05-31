/* eslint-disable react/prop-types */
const CustomHeroImage = ({ title }) => {
  return (
    <div className="bg-[url('./assets/Images/heroImg.png')] bg-center bg-cover bg-no-repeat rounded-3xl md:w-[90%] w-full md:h-[360px] h-[200px] mx-auto mt-30 mb-20 flex items-center justify-center font-abcRepro">
      <div className="blue-blur-circle"></div>
      <h1 className="md:text-6xl text-4xl font-bold">{title}</h1>
    </div>
  );
};

export default CustomHeroImage;
