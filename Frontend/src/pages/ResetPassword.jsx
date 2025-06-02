import { useState } from "react";
import WrapperHeader from "./WrapperHeader";
import WrapperPage from "./WrapperPage";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const [FormData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });

  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    let { name, value } = e.target;
    setFormData({ ...FormData, [name]: value });
    if (name === "confirmPassword") {
      name = "passNoMatch";
    }
    setFormErrors({ ...formErrors, [name]: "" });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
  };
  return (
    <WrapperPage>
      <WrapperHeader
        title="Reset Password"
        discription="Enter new password and confirm  new password. fill the details."
      />
      <form onSubmit={handleSubmit}>
        <div className="mb-4 flex flex-col">
          <label
            htmlFor="password"
            className="block text-lg text-[#C7C7C7] mb-1"
          >
            Password
          </label>
          <div className="flex relative">
            <input
              type={showPasswords.password ? "text" : "password"}
              name="password"
              value={FormData.password}
              placeholder="Enter your Password"
              onChange={handleChange}
              id="password"
              className="w-full px-4 py-3 bg-[#151B2D] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5]"
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
                <EyeOff className="cursor-pointer absolute right-4 top-3 text-[#C7C7C7]" />
              ) : (
                <Eye className="cursor-pointer absolute right-4 top-3 text-[#C7C7C7]" />
              )}
            </button>
          </div>
          {formErrors.password && (
            <p className="text-red-400">{formErrors.password}</p>
          )}
        </div>
        <div className="mb-4 flex flex-col">
          <label
            htmlFor="password"
            className="block text-lg text-[#C7C7C7] mb-1"
          >
            Confirm Password
          </label>
          <div className="flex relative">
            <input
              type={showPasswords.confirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Retype your Password"
              value={FormData.confirmPassword}
              onChange={handleChange}
              id="confrimPassword"
              className="w-full px-4 py-3 bg-[#151B2D] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5]"
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
                <EyeOff className="cursor-pointer absolute right-4 top-3 text-[#C7C7C7]" />
              ) : (
                <Eye className="cursor-pointer absolute right-4 top-3 text-[#C7C7C7]" />
              )}
            </button>
          </div>
          {formErrors.passNoMatch && (
            <p className="text-red-400">{formErrors.passNoMatch}</p>
          )}
          <button
            type="submit"
            className="bg-[#052C89] mt-7 text-white rounded-lg py-2 text-lg font-semibold 
            hover:bg-[#052C89] 
            transition-all duration-300 ease-out 
            transform hover:scale-105 
            focus:outline-none focus:ring-2 focus:ring-[#0256F5] focus:ring-opacity-50"
          >
            Change Password
          </button>
        </div>
      </form>
    </WrapperPage>
  );
};

export default ResetPassword;
