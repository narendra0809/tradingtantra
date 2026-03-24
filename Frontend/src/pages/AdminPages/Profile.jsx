import { useState } from "react";
import { FiUser, FiMail, FiLock, FiLoader } from "react-icons/fi";

import bgImage from "../../assets/adminImages/myprofile/image1.png";
import ResetPasswordModal from "../../Components/AdminComponents/ResetPasswordModal";
import { useOutletContext } from "react-router-dom";
import { useEffect } from "react";
import { adminSchema } from "../../../validators/validator";
import axios from "axios";
import { ADMIN_SERVER_URI } from "./Home";
import AdminCard from "../../Components/AdminComponents/AdminCard";
import AdminButton from "../../Components/AdminComponents/AdminButton";
import AdminInput from "../../Components/AdminComponents/AdminInput";

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
    <div className="min-h-screen text-white p-4 sm:p-8 bg-[#000A2D]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Background */}
        <div
          className="relative w-full h-32 sm:h-40 rounded-2xl overflow-hidden"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#000A2D] to-transparent"></div>
          <div className="absolute bottom-4 left-6 flex items-end gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <FiUser className="text-white text-2xl" />
            </div>
            <div className="pb-2">
              <h2 className="text-2xl font-semibold">
                {`${formData.firstName} ${formData.lastName}`}
              </h2>
              <p className="text-gray-400 text-sm">{formData.email}</p>
            </div>
          </div>
          <AdminButton 
            variant="outline" 
            size="sm"
            icon={<FiLock />}
            onClick={handleChangePassword}
            className="absolute right-4 bottom-4"
          >
            Change Password
          </AdminButton>
        </div>

        {showResetModal && (
          <ResetPasswordModal onClose={() => setShowResetModal(false)} />
        )}

        {/* Form */}
        <AdminCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FiUser className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Account Settings</h3>
                <p className="text-sm text-gray-400">Update your profile information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminInput
                label="First Name"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                error={formErrors?.firstName}
                icon={<FiUser />}
              />
              <AdminInput
                label="Last Name"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                error={formErrors?.lastName}
                icon={<FiUser />}
              />
            </div>

            <AdminInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={formErrors?.email}
              icon={<FiMail />}
            />

            <AdminButton 
              type="submit" 
              variant="primary" 
              loading={loading}
              className="w-full"
            >
              {loading ? <FiLoader className="animate-spin" /> : "Save Changes"}
            </AdminButton>
          </form>
        </AdminCard>
      </div>
    </div>
  );
}
