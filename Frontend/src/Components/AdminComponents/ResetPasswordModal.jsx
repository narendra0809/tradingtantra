/* eslint-disable react/prop-types */
// components/ResetPasswordModal.js

import { FiLock } from "react-icons/fi";

const ResetPasswordModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#050A1F] rounded-2xl p-6 w-full max-w-sm text-white relative">
        <h2 className="text-2xl font-bold text-center mb-2">Reset Password</h2>
        <p className="text-center text-sm text-gray-400 mb-6">
          Enter your new password and confirm new password. Fill the Details
        </p>

        <div className="mb-4 relative">
          <FiLock className="absolute top-3.5 left-3 text-gray-400" />
          <input
            type="password"
            placeholder="New Password"
            className="w-full pl-10 pr-3 py-2 bg-[#1A1D2E] rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="mb-6 relative">
          <FiLock className="absolute top-3.5 left-3 text-gray-400" />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full pl-10 pr-3 py-2 bg-[#1A1D2E] rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
          onClick={onClose}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
