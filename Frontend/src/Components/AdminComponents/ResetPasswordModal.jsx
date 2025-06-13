/* eslint-disable react/prop-types */
// components/ResetPasswordModal.js

import { useState } from "react";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { adminPasswordSchema } from "../../../validators/validator";
import axios from "axios";
import { ADMIN_SERVER_URI } from "../../pages/AdminPages/Home";

const ResetPasswordModal = ({ onClose }) => {
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const handleShowPassword = () => {
    setShowPassword({ ...showPassword, password: !showPassword.password });
  };
  const handleShowConfirmPassword = () => {
    setShowPassword({
      ...showPassword,
      confirmPassword: !showPassword.confirmPassword,
    });
  };

  const [passwordErrors, setPasswordErrors] = useState({});

  const handleChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setPasswordErrors({});
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = adminPasswordSchema.safeParse(passwordForm);
    if (error) {
      const errorMessages = {};
      error.errors.forEach((err) => {
        errorMessages[err.path[0]] = err.message;
      });
      setPasswordErrors(errorMessages);
      return;
    }
    try {
      const res = await axios.put(
        `${ADMIN_SERVER_URI}/update-password`,
        { password: data.password },
        { withCredentials: true }
      );
      if (res.status !== 200) {
        throw new Error("Error while updating password");
      }
      onClose();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div
      onClick={() => onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-2xl  bg-opacity-60"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#050A1F] rounded-2xl p-6 w-full max-w-sm text-white relative"
      >
        <h2 className="text-2xl font-bold text-center mb-2">Reset Password</h2>
        <p className="text-center text-sm text-gray-400 mb-6">
          Enter your new passwordand confirm new password. Fill the Details
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <FiLock className="absolute top-3.5 left-3 text-gray-400" />
            <input
              type={showPassword.password ? "text" : "password"}
              onChange={handleChange}
              name="password"
              placeholder="New Password"
              className="w-full pl-10 pr-3 py-2 bg-[#1A1D2E] rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {passwordErrors?.password && (
              <span className="text-sm text-red-400">
                {passwordErrors.password}
              </span>
            )}
            <button
              onClick={handleShowPassword}
              type="button"
              className="absolute top-3 right-2"
            >
              {showPassword.password ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="mb-6 relative">
            <FiLock className="absolute top-3.5 left-3 text-gray-400" />
            <input
              onChange={handleChange}
              type={showPassword.confirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm New Password"
              className="w-full pl-10 pr-3 py-2 bg-[#1A1D2E] rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {passwordErrors?.noMatch && (
              <span className="text-sm text-red-400">
                {passwordErrors.noMatch}
              </span>
            )}
            <button
              type="button"
              onClick={handleShowConfirmPassword}
              className="absolute top-3 right-2"
            >
              {showPassword.confirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
