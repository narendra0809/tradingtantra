import React from "react";
import { FaLock } from "react-icons/fa";

const Lock = () => {
  return (
    <div className="lock-container w-full h-full rounded-lg">
      <div className=" w-full h-full flex justify-center items-center bg-[#000A2D80] backdrop-blur-xs rounded-lg">
        <FaLock className="text-4xl text-white" />
      </div>
    </div>
  );
};

export default Lock;
