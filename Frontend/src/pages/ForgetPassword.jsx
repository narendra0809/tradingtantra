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
        discription="Enter your email for the verification process, we will send 4 digits code to your email."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium mb-1">Email</label>
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#151B2D] border border-gray-700 rounded-lg"
            placeholder="Enter your email"
            required
          />
        </div>

        {errorMsg && (
          <p className="text-red-400 text-sm">{errorMsg}</p>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-[#0256F5] rounded-lg"
        >
          Send OTP
        </button>
      </form>

      <div className="mt-5 text-center">
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
