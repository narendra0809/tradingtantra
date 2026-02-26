import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WrapperHeader from "./WrapperHeader";
import WrapperPage from "./WrapperPage";
import { Eye, EyeOff } from "lucide-react";
import useFetchData from "../utils/useFetchData";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { fetchData } = useFetchData();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const email = localStorage.getItem("resetEmail");
    const otp = localStorage.getItem("verifiedOtp"); // OTPModal me store karna

    const res = await fetchData("auth/forgot", "POST", {
      email,
      otp,
      password: formData.password,
    });

    if (!res || res.success === false) {
      setError(res?.message || "Something went wrong");
      return;
    }
localStorage.removeItem("verifiedOtp");
localStorage.removeItem("resetEmail");

    navigate("/password-changed");
  };

  return (
    <WrapperPage>
      <WrapperHeader
        title="Reset Password"
        discription="Enter new password and confirm new password."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PASSWORD */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1 text-white">
            Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.password ? "text" : "password"}
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full text-white px-4 py-3 bg-[#151B2D] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5] placeholder:text-gray-400"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords({
                  ...showPasswords,
                  password: !showPasswords.password,
                })
              }
              className="absolute right-4 top-3 text-gray-400 hover:text-white"
            >
              {showPasswords.password ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* CONFIRM PASSWORD */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-white">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirmPassword ? "text" : "password"}
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full text-white px-4 py-3 bg-[#151B2D] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5] placeholder:text-gray-400"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords({
                  ...showPasswords,
                  confirmPassword: !showPasswords.confirmPassword,
                })
              }
              className="absolute right-4 top-3 text-gray-400 hover:text-white"
            >
              {showPasswords.confirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-[#1F0000] border border-[#FF4242] rounded-lg">
            <p className="text-sm text-[#FF4242]">{error}</p>
          </div>
        )}

        <button
          type="submit"
          className="text-white w-full py-3 px-4 bg-[#0256F5] hover:bg-[#0257f5] rounded-lg font-medium transition duration-200"
        >
          Change Password
        </button>
      </form>
    </WrapperPage>
  );
};

export default ResetPassword;
