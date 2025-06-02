import { useNavigate } from "react-router-dom";
import pana from "../assets/Images/pana.png";

const PasswordChanged = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#02000e] text-white w-full h-[100vh] flex flex-col items-center justify-center gap-8">
      <img src={pana} alt="" />
      <h1 className="text-3xl">Password Successfully Changed!</h1>
      <p className="text-[#C7C7C7]">
        Your password successfully changed. now you can login with new password.
      </p>
      <button
        onClick={() => navigate("/login")}
        className="bg-[#052C89] text-white rounded-lg py-2 text-lg font-semibold 
            hover:bg-[#052C89] 
            transition-all duration-300 ease-out 
            transform hover:scale-105 
            focus:outline-none focus:ring-2 focus:ring-[#0256F5] focus:ring-opacity-50 w-64"
      >
        Login
      </button>
    </div>
  );
};

export default PasswordChanged;
