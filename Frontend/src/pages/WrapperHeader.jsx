/* eslint-disable react/prop-types */
const WrapperHeader = ({ title, discription }) => {
  return (
    <div className="mb-8 flex flex-col justify-center items-center ">
      <h2 className="text-3xl font-bold mb-2">{title}</h2>
      {discription && (
        <p className="text-gray-400 text-center">{discription}</p>
      )}
    </div>
  );
};

export default WrapperHeader;
