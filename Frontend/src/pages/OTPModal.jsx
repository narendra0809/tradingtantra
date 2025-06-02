/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef, useState } from "react";
import WrapperHeader from "./WrapperHeader";
import WrapperPage from "./WrapperPage";

const OTPModal = () => {
  const [isBackPressed, setIsBackPressed] = useState(false);
  const intervalRef = useRef();

  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (timer === 0) {
      clearInterval(intervalRef.current);
    }
  }, [timer]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    intervalRef.current = interval;
    return () => clearInterval(interval);
  }, []);

  const refArray = Array(4)
    .fill(4)
    .map(() => useRef(null));

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleChange = (e, index) => {
    if (isBackPressed) {
      setIsBackPressed(false);
      return;
    }

    if (e.target.value.length > 1) {
      e.target.value = e.target.value[0];
      return;
    }

    if (e.target.value && index + 1 < refArray.length) {
      refArray[index + 1].current.focus();
    }
  };

  const handleBack = (e, index) => {
    if (e.key === "Backspace") {
      if (!e.target.value && index > 0) {
        refArray[index - 1].current.focus();
        e.target.value = "";
        setIsBackPressed(true);
      }
    }
  };

  return (
    <WrapperPage>
      <WrapperHeader
        title="OTP Verification"
        discription="Enter 4 digits code we have sent you on your Email/Phone Number."
      />
      <form className="flex flex-col mt-2" onSubmit={handleSubmit}>
        <div className="flex justify-center gap-5">
          {refArray.map((ref, index) => (
            <input
              ref={ref}
              key={index}
              type="number"
              maxLength={1}
              onKeyDown={(e) => handleBack(e, index)}
              onChange={(e) => handleChange(e, index)}
              className="bg-[#01071C] text-xl pt-4 pb-4 pr-3 pl-3 w-[79px] h-[71px] rounded-[10px] border border-[#001A4E]"
            />
          ))}
        </div>
        <span className="text-[#FF4242] mt-4 text-center">
          00:{timer > 9 ? timer : "0" + timer}
        </span>
        <button
          type="submit"
          className="bg-[#052C89] mt-5 text-white rounded-lg py-2 text-lg font-semibold 
            hover:bg-[#052C89] 
            transition-all duration-300 ease-out 
            transform hover:scale-105 
            focus:outline-none focus:ring-2 focus:ring-[#0256F5] focus:ring-opacity-50"
        >
          Continue
        </button>
        <p className="text-[#6290FF] mt-5 text-center">
          If you don&apos;t receive a code!{" "}
        </p>
        <button
          disabled={timer > 0}
          className={`${
            timer <= 0 ? "text-[#FF4242]" : "text-[#b89696] cursor-not-allowed"
          }`}
        >
          Resend
        </button>{" "}
      </form>
    </WrapperPage>
  );
};

export default OTPModal;
