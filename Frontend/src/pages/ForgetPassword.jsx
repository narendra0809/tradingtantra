import WrapperHeader from "./WrapperHeader";
import WrapperPage from "./WrapperPage";

import facebook from "../assets/Images/logos/facebook.png";
import google from "../assets/Images/logos/google.png";
import apple from "../assets/Images/logos/apple.png";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import useFetchData from "../utils/useFetchData";
// import { useEffect } from "react";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");

  const { fetchData } = useFetchData();

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetchData("auth/otp", "POST", { email });
  };

  // useEffect(() => {
  //   console.log(error);
  // }, [error]);
  return (
    <WrapperPage>
      <WrapperHeader
        title="Forget Password"
        discription="Enter your email for the verification proccess,we will send 4 digits code to your email."
      />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-lg font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#151B2D] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5]"
            placeholder="Enter your email"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 px-4 bg-[#0256F5] hover:bg-[#0257f5] rounded-lg font-medium transition duration-200"
        >
          Send OTP
        </button>
      </form>
      <div className="w-full flex items-center my-4">
        <div className="flex-grow border-t border-[#E8ECF4]"></div>
        <span className="mx-4 text-gray-500">Or Login with</span>
        <div className="flex-grow border-t border-[#E8ECF4]"></div>
      </div>
      <div className="flex justify-between">
        <button>
          <img src={facebook} alt="" />
        </button>
        <button>
          <img src={google} alt="" />
        </button>
        <button>
          <img src={apple} alt="" />
        </button>
      </div>
      <div className="mt-5 w-full flex justify-center">
        <p className="text-[#C7C7C7]">
          Remember Password?{" "}
          <NavLink className="underline text-[#6290FF]" to="/login">
            Log In
          </NavLink>
        </p>
      </div>
    </WrapperPage>
  );
};

export default ForgetPassword;
