/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import useFetchData from "../utils/useFetchData";
import { useAuth } from "../contexts/AuthContext";
import Cookies from "js-cookie";
import WrapperHeader from "./WrapperHeader";
import WrapperPage from "./WrapperPage";
import GoogleButton from "../Components/OAuth";
import { useDispatch } from "react-redux";
import { setTheme } from "../contexts/Redux/Slices/themeSlice";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, error, fetchData } = useFetchData();
  const { login } = useAuth();

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
        const res = await fetchData("auth/login", "POST", formData);
        console.log(res.data.user.darkMode);
        console.log(res?.data?.user?.darkMode === true ? "dark" : "light");
        dispatch(setTheme(res?.data?.user?.darkMode ? "dark" : "light"));
      } catch (err) {
        console.error("Login error:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    if (data?.success) {
      login(data.token);
      Cookies.set("isSubscribed", data?.user?.isSubscribed, { expires: 1 });
      navigate("/dashboard");
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
      <WrapperHeader
        title="Welcome Back"
        discription="Welcome back please enter your detials"
      />

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
        <div className="w-full flex items-center my-4">
          <div className="flex-grow border-t border-[#E8ECF4]"></div>
          <span className="mx-4 text-gray-500">Or Login with</span>
          <div className="flex-grow border-t border-[#E8ECF4]"></div>
        </div>

        <GoogleButton />

        <div className="text-center text-sm ">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="text-[#6290FF] hover:text-[#6290FF] font-medium"
          >
            Sign Up
          </button>
        </div>
      </form>
    </WrapperPage>
  );
};

export default LoginPage;
