import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import lock from "../../assets/Images/Vector.svg";

const Lock = () => {
  const [hovering, setHovering] = useState(false);
  const theme = useSelector((state) => state.theme.theme);
  const navigate = useNavigate();
  return (
    <div
      className={`${
        theme === "dark" ? "bg-[#000A2D]" : "bg-[#EAEBEB]"
      } w-full h-full rounded-lg mt-10`}
    >
      <div className="w-full h-full flex justify-center items-center rounded-lg">
        <div
          className="relative flex flex-col items-center"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onClick={() => navigate("/dashboard/plan")}
        >
          <div className="h-12  flex items-center justify-center">
            {hovering && (
              <button className="bg-linear-to-b from-[#0256F5] to-[#74A4FE] text-nowrap absolute -top-2 px-4 py-2">
                Buy Now To Unlock
              </button>
            )}
          </div>
          <img src={lock} alt="lock" className="cursor-pointer" />
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
