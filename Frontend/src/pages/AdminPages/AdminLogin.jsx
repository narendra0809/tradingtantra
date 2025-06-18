/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import WrapperHeader from "../WrapperHeader";
import WrapperPage from "../WrapperPage";
import { useNavigate } from "react-router-dom";
import useFetchData from "../../utils/useFetchData";
import { useAdminAuth } from "../../contexts/adminContext/AdminAuthContext";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { data, error, fetchData } = useFetchData();
  const { login, admin } = useAdminAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await fetchData("admin/auth/login", "POST", formData);
      } catch (err) {
        console.error("Login error:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    if (admin) {
      navigate("/admin", { replace: true });
    }
  }, [admin, navigate]);

  useEffect(() => {
    if (data?.success) {
      login(data.token);
      navigate("/admin");
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      if (error.data?.message === "User not Exist, please sign up") {
        setFormErrors({
          ...formErrors,
          api: "User does not exist. Please sign up.",
        });
      } else if (error.data?.error === "Invalid credentials") {
        setFormErrors({
          ...formErrors,
          api: "Wrong credentials. Please try again.",
        });
      }
    }
  }, [error]);
  return (
    <WrapperPage>
      <WrapperHeader title="Admin Login Page" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
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
          {formErrors.email && (
            <p className="mt-1 text-sm text-[#FF4242]">{formErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            name="password"
            type="password"
            id="password"
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#151B2D] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5]"
            placeholder="Enter your password"
            required
          />
          {formErrors.password && (
            <p className="mt-1 text-sm text-[#FF4242]">{formErrors.password}</p>
          )}
        </div>

        {formErrors.api && (
          <div className="p-3 bg-[#1F0000] border border-[#FF4242] rounded-lg">
            <p className="text-sm text-[#FF4242]">{formErrors.api}</p>
          </div>
        )}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/forget-password")}
            className="text-sm text-[#FF4242] hover:text-[#FF4242]"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 bg-[#0256F5] hover:bg-[#0257f5] rounded-lg font-medium transition duration-200 ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </WrapperPage>
  );
};

export default AdminLogin;
