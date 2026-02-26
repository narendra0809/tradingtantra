import WrapperHeader from "./WrapperHeader";
import WrapperPage from "./WrapperPage";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import useFetchData from "../utils/useFetchData";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { fetchData } = useFetchData();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const res = await fetchData("auth/otp", "POST", { email });

    console.log("OTP API Response:", res);

    if (!res || res.error || res.success === false) {
      setErrorMsg(res?.message || "Something went wrong");
      return;
    }

    // success case
    localStorage.setItem("resetEmail", email);
    navigate("/otp"); // 👈 MAKE SURE ROUTE EXISTS
  };

  return (
    <WrapperPage>
      <WrapperHeader
        title="Forget Password"
        discription="Enter your email for the verification process, we will send 6 digits code to your email."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1 text-white">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-white px-4 py-3 bg-[#151B2D] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5] placeholder:text-gray-400"
            placeholder="Enter your email"
            required
          />
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#1F0000] border border-[#FF4242] rounded-lg">
            <p className="text-sm text-[#FF4242]">{errorMsg}</p>
          </div>
        )}

        <button
          type="submit"
          className="text-white w-full py-3 px-4 bg-[#0256F5] hover:bg-[#0257f5] rounded-lg font-medium transition duration-200"
        >
          Send OTP
        </button>
      </form>

      <div className="mt-5 text-center">
        <p className="text-white">
          Remember Password?{" "}
          <NavLink className="underline text-[#6290FF] hover:text-[#6290FF] font-medium" to="/login">
            Log In
          </NavLink>
        </p>
      </div>
    </WrapperPage>
  );
};

export default ForgetPassword;
