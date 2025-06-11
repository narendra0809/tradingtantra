import React from "react";
import myImage from "../assets/homapage/BarLineChart (1).png"; // <-- apni image path daalna

const ImageCard = () => {
  return (
    <div className="flex items-center justify-center px-2 bg-black">
      <div className="m-2 p-0 rounded-xl shadow-xl max-w-4xl w-full">
        <img
          src={myImage}
          alt="Dashboard"
          className="w-full h-[800px] object-contain rounded-lg"
        />
      </div>
    </div>
  );
};

export default ImageCard;
