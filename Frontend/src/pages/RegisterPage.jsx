/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import facebook from "../assets/Images/logos/facebook.png";
import google from "../assets/Images/logos/google.png";
import apple from "../assets/Images/logos/apple.png";
import { Link, useNavigate } from "react-router-dom";
import useFetchData from "../utils/useFetchData";
import WrapperPage from "./WrapperPage";
import WrapperHeader from "./WrapperHeader";
import { useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

const RegisterPage = () => {
  const [FormData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });

  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();

  const { data, error, fetchData } = useFetchData();
  const handleChange = (e) => {
    let { name, value } = e.target;
    setFormData({ ...FormData, [name]: value });
    if (name === "confirmPassword") {
      name = "passNoMatch";
    }
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (FormData.password !== FormData.confirmPassword) {
      setFormErrors({ ...formErrors, passNoMatch: "Password does not match" });
    }

    await fetchData("auth/signup", "POST", FormData);
  };

  useEffect(() => {
    if (data?.success) {
      navigate("/login");
    }
  }, [data]);

  useEffect(() => {
    if (error.data) {
      const newErrors = {};
      error.data.errors.forEach((err) => {
        newErrors[err.path] = err.msg;
      });
      setFormErrors({ ...formErrors, ...newErrors });
    }
  }, [error]);

  return (
    <WrapperPage>
      <WrapperHeader title="Create an account" discription={null} />
      <form className="flex flex-col mt-2" onSubmit={handleSubmit}>
        <div className="mb-4 flex flex-col">
          <label htmlFor="name" className="block text-lg text-[#C7C7C7] mb-1">
            First Name
          </label>
          <input
            type="text"
            name="firstname"
            value={FormData.firstname}
            onChange={handleChange}
            placeholder="Enter your First Name"
            id="name"
            className="w-full px-4 py-3 bg-[#151B2D] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5]"
          />
          {formErrors.firstname && (
            <p className="text-red-400">{formErrors.firstname}</p>
          )}
        </div>

        <div className="mb-4 flex flex-col">
          <label className="block text-lg text-[#C7C7C7] mb-1">Last Name</label>

          <input
            type="text"
            name="lastname"
            value={FormData.lastname}
            placeholder="Enter your Last Name"
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#151B2D] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5]"
          />
          {formErrors.lastname && (
            <p className="text-red-400">{formErrors.lastname}</p>
          )}
        </div>

        <div className="mb-4 flex flex-col">
          <label htmlFor="email" className="block text-lg text-[#C7C7C7] mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter your Email"
            value={FormData.email}
            onChange={handleChange}
            id="email"
            className="w-full px-4 py-3 bg-[#151B2D] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5]"
          />
          {formErrors.email && (
            <p className="text-red-400">{formErrors.email}</p>
          )}
        </div>

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
        </div>

        <button
          type="submit"
          className="bg-[#052C89] mt-5 text-white rounded-lg py-2 text-lg font-semibold 
            hover:bg-[#052C89] 
            transition-all duration-300 ease-out 
            transform hover:scale-105 
            focus:outline-none focus:ring-2 focus:ring-[#0256F5] focus:ring-opacity-50"
        >
          Register
        </button>
      </form>
      <div className="w-full flex items-center my-4">
        <div className="flex-grow border-t border-[#E8ECF4]"></div>
        <span className="mx-4 text-gray-500">Or Login with</span>
        <div className="flex-grow border-t border-[#E8ECF4]"></div>
      </div>
      <div className="flex justify-between">
        <button>
          <img src={facebook} alt="" />
        </button>
        <button>
          <img src={google} alt="" />
        </button>
        <button>
          <img src={apple} alt="" />
        </button>
      </div>

      <div className="flex gap-1 items-center justify-center mt-2">
        <p className="text-[#C7C7C7]">Already have an Account?</p>
        <Link to="/login">
          <span className="text-[#6290FF] underline font-semibold">Log In</span>
        </Link>
      </div>
    </WrapperPage>
  );
};

export default RegisterPage;
