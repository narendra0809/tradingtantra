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

      <form onSubmit={handleSubmit}>
        {/* PASSWORD */}
        <div className="mb-4">
          <label className="text-[#C7C7C7]">Password</label>
          <div className="relative">
            <input
              type={showPasswords.password ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#151B2D] border rounded-lg"
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords({
                  ...showPasswords,
                  password: !showPasswords.password,
                })
              }
            >
              {showPasswords.password ? (
                <EyeOff className="absolute right-4 top-3" />
              ) : (
                <Eye className="absolute right-4 top-3" />
              )}
            </button>
          </div>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="mb-4">
          <label className="text-[#C7C7C7]">Confirm Password</label>
          <div className="relative">
            <input
              type={showPasswords.confirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#151B2D] border rounded-lg"
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords({
                  ...showPasswords,
                  confirmPassword: !showPasswords.confirmPassword,
                })
              }
            >
              {showPasswords.confirmPassword ? (
                <EyeOff className="absolute right-4 top-3" />
              ) : (
                <Eye className="absolute right-4 top-3" />
              )}
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 mb-3">{error}</p>}

        <button className="bg-[#052C89] w-full py-2 rounded-lg">
          Change Password
        </button>
      </form>
    </WrapperPage>
  );
};

export default ResetPassword;
