import { useNavigate } from "react-router-dom";
import WrapperPage from "./WrapperPage";
import pana from "../assets/Images/pana.png";

const PasswordChanged = () => {
  const navigate = useNavigate();
  return (
    <WrapperPage>
      <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 text-center px-4">
        <img src={pana} alt="Success illustration" className="w-full max-w-md h-auto" />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          Password Successfully Changed!
        </h1>
        <p className="text-white/80 text-base sm:text-lg max-w-md">
          Your password successfully changed. Now you can login with new password.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="text-white w-full max-w-xs py-3 px-4 bg-[#0256F5] hover:bg-[#0257f5] rounded-lg font-medium transition duration-200"
        >
          Login
        </button>
      </div>
    </WrapperPage>
  );
};

export default PasswordChanged;
