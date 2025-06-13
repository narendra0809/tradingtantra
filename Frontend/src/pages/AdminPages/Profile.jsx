import { useState } from "react";
import { FiUser, FiMail, FiLock, FiLoader } from "react-icons/fi";

import bgImage from "../../assets/adminImages/myprofile/image1.png";
import ResetPasswordModal from "../../Components/AdminComponents/ResetPasswordModal";
import { useOutletContext } from "react-router-dom";
import { useEffect } from "react";
import { adminSchema } from "../../../validators/validator";
import axios from "axios";
import { ADMIN_SERVER_URI } from "./Home";
export default function Profile() {
  const { admin } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(admin);
  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    setFormData(admin);
  }, [admin]);

  const handleChangePassword = () => setShowResetModal(true);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setFormErrors({ ...formErrors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = adminSchema.safeParse(formData);
    if (error) {
      const errorMessages = {};
      error.errors.forEach((err) => {
        errorMessages[err.path[0]] = err.message;
      });
      setFormErrors(errorMessages);
      return;
    }
    try {
      const res = await axios.put(`${ADMIN_SERVER_URI}/update-admin`, data, {
        withCredentials: true,
      });
      setFormData(res.data.updatedAdmin);
    } catch (error) {
      console.log("Error updating admin details: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0D0F1C] min-h-screen text-white px-4 sm:px-6 md:px-10 py-6">
      {/* Header */}
      <div
        className="relative w-full h-24 sm:h-28 md:h-32 rounded-b-xl"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute bottom-[-30px] left-4 sm:left-6 flex items-center gap-4">
          <h2 className="text-xl relative bottom-4 sm:text-2xl font-semibold">
            {`${formData.firstName}${formData.lastName}`}
          </h2>
        </div>
        <button
          onClick={handleChangePassword}
          className="absolute right-4 top-[90px] sm:top-[100px] bg-[#1A1D2E] border border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
        >
          <FiLock /> Change Password
        </button>
      </div>

      {showResetModal && (
        <ResetPasswordModal onClose={() => setShowResetModal(false)} />
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#101223] mt-20 mx-auto rounded-xl p-4 sm:p-6 md:p-8 max-w-4xl"
      >
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <FiUser /> Account
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Lorem ipsum dolor sit amet consectetur sit mauris nec morbi nisi.
        </p>

        <p className="text-sm text-gray-400 mb-4">
          Lorem ipsum dolor sit amet consectetur quisque nisi eget mi libero leo
          vel claim in.
        </p>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm mb-1" htmlFor="firstName">
              First name
            </label>
            <FiUser className="absolute top-10 left-3 text-gray-400" />
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full bg-[#1A1D2E] border-none rounded-md pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {formErrors?.firstName && (
              <span className="text-sm text-red-400">
                {formErrors.firstName}
              </span>
            )}
          </div>
          <div className="relative">
            <label className="block text-sm mb-1" htmlFor="lastName">
              Last name
            </label>
            <FiUser className="absolute top-10 left-3 text-gray-400" />
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full bg-[#1A1D2E] border-none rounded-md pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {formErrors?.lastName && (
              <span className="text-sm text-red-400">
                {formErrors.lastName}
              </span>
            )}
          </div>
        </div>

        <div className="mb-6 relative">
          <label className="block text-sm mb-1" htmlFor="email">
            Email address
          </label>
          <FiMail className="absolute top-10 left-3 text-gray-400" />
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-[#1A1D2E] border-none rounded-md pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          {formErrors?.email && (
            <span className="text-sm text-red-400">{formErrors.email}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 w-full py-2 rounded-md text-white font-semibold"
        >
          {loading ? <FiLoader className="text-center" /> : "Submit"}
        </button>
      </form>
    </div>
  );
}
