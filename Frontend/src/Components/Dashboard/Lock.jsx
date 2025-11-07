import { useState } from "react";
import { FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Lock = () => {
  const [hovering, setHovering] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="lock-container-light dark:lock-container w-full h-full rounded-lg">
      <div className="w-full h-full flex justify-center items-center bg-[#28292b80] backdrop-blur-xs rounded-lg">
        <div
          className="relative flex flex-col items-center"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onClick={() => navigate("/dashboard/plan")}
        >
          {/* Fixed container to prevent layout shift */}
          <div className="h-12  flex items-center justify-center">
            {hovering && (
              <button
                className="text-nowrap absolute -top-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 
                          text-white font-medium rounded-full shadow-lg hover:shadow-xl 
                          transform transition-all duration-300 hover:scale-105 
                          hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 
                          focus:ring-purple-400 focus:ring-opacity-50 animate-pulse"
              >
                Buy Now To Unlock
              </button>
            )}
          </div>

          <FaLock
            className={`text-4xl text-white transition-all duration-200
                      ${
                        hovering
                          ? "cursor-pointer transform scale-110 text-yellow-300"
                          : "text-white"
                      }`}
          />

          {hovering && (
            <div className="absolute top-full mt-2 text-xs text-white opacity-0 animate-fade-in">
              Click to unlock
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lock;
