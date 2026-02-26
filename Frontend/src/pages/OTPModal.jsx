/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import WrapperHeader from "./WrapperHeader";
import WrapperPage from "./WrapperPage";
import useFetchData from "../utils/useFetchData";

const OTPModal = () => {
  const navigate = useNavigate();
  const { fetchData } = useFetchData();

  const [error, setError] = useState("");
  const [timer, setTimer] = useState(300); // 🔥 5 min
  const intervalRef = useRef(null);

  const refArray = Array(6)
    .fill(0)
    .map(() => useRef(null));

  /* TIMER */
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (timer <= 0) {
      clearInterval(intervalRef.current);
    }
  }, [timer]);

  /* INPUT CHANGE */
  const handleChange = (e, index) => {
    if (e.target.value.length > 1) {
      e.target.value = e.target.value[0];
    }

    if (e.target.value && index < 5) {
      refArray[index + 1].current.focus();
    }
  };

  /* BACKSPACE */
  const handleBack = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      refArray[index - 1].current.focus();
    }
  };

  /* SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const otp = refArray.map((ref) => ref.current.value).join("");

    if (otp.length !== 6) {
      setError("Please enter 6 digit OTP");
      return;
    }

    const email = localStorage.getItem("resetEmail");

    const res = await fetchData("auth/verify-otp", "POST", {
      email,
      otp,
    });

    if (!res || res.success === false) {
      setError(res?.message || "Invalid OTP");
      return;
    }
// OTPModal.jsx → handleSubmit()


  localStorage.setItem("verifiedOtp", otp);
  navigate("/reset-password");

  };

  return (
    <WrapperPage>
      <WrapperHeader
        title="OTP Verification"
        discription="Enter 6 digit OTP sent to your email."
      />

      <form onSubmit={handleSubmit} className="flex flex-col mt-4 space-y-6">
        <div className="flex justify-center gap-3 sm:gap-4">
          {refArray.map((ref, index) => (
            <input
              key={index}
              ref={ref}
              type="number"
              maxLength={1}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleBack(e, index)}
              className="bg-[#151B2D] text-white text-xl sm:text-2xl w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] text-center rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0256F5] focus:border-[#0256F5]"
            />
          ))}
        </div>

        {error && (
          <div className="p-3 bg-[#1F0000] border border-[#FF4242] rounded-lg">
            <p className="text-sm text-[#FF4242] text-center">{error}</p>
          </div>
        )}

        <div className="text-center">
          <span className="text-[#FF4242] text-sm sm:text-base font-medium">
            {timer > 0
              ? `00:${Math.floor(timer / 60)
                  .toString()
                  .padStart(2, "0")}:${(timer % 60)
                  .toString()
                  .padStart(2, "0")}`
              : "OTP expired"}
          </span>
        </div>

        <button
          type="submit"
          className="text-white w-full py-3 px-4 bg-[#0256F5] hover:bg-[#0257f5] rounded-lg font-medium transition duration-200"
        >
          Continue
        </button>
      </form>
    </WrapperPage>
  );
};

export default OTPModal;
