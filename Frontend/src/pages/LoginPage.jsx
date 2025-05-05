import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useFetchData from "../utils/useFetchData";
import { useAuth } from "../contexts/AuthContext";
import Cookies from "js-cookie";  


const LoginPage = () => {
  const SERVER_URI = import.meta.env.VITE_SERVER_URI;
  // const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  // const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { data, error, loading, fetchData } = useFetchData();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // console.log(formData)

    await fetchData("auth/login", "POST", formData);
  };

  useEffect(() => {
    if (data?.success) {
      login(data.token);
      Cookies.set("isSubscribed",data?.user?.isSubscribed,{expires: 1});
      navigate("/dashboard");
    }
     
 
  }, [data]);

  const handleGoolgleLogin = async () => {
    window.location.href = `${SERVER_URI}/auth/google`;
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100  ">
      {loading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-10">
          <div className="loader"></div>
        </div>
      )}
      <div
        className={`w-full max-w-md bg-gray-50 p-8 shadow-md rounded-md ${
          loading ? "opacity-50" : "opacity-100"
        }`}
      >
        <div className="border-b-[1px] pb-2">
          <h2 className="font-bold text-center text-2xl text-gray-700">
            Login
          </h2>
          <p className="text-center text-xs text-gray-500 font-semibold mt-1">
            ACCESS YOUR ACCOUNT
          </p>
        </div>

        <form className="flex flex-col mt-2 " onSubmit={handleSubmit}>
          <div className="mb-4 flex flex-col">
            <label htmlFor="email" className="block text-lg text-gray-600 mb-1">
              Email:
            </label>
            <input
              required
              value={setFormData.email}
              onChange={handleChange}
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              className="border-2 outline-none text-gray-800 border-gray-300 rounded-lg px-4 py-2 text-base focus:border-[#2196F3] focus:ring-4 focus:ring-[#2195f34f] transition duration-300 ease-in-out"
            />
          </div>

          <div className="mb-2 flex flex-col">
            <label
              htmlFor="password"
              className="block text-lg text-gray-600 mb-1"
            >
              Password:
            </label>
            <input
              required
              value={setFormData.password}
              onChange={handleChange}
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              className="border-2 outline-none text-gray-800 border-gray-300 rounded-lg px-4 py-2 text-base focus:border-[#2196F3] focus:ring-4 focus:ring-[#2195f34f] transition duration-300 ease-in-out"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-2">
              {error?.data?.error || error?.message || error?.data?.message}
            </p>
          )}
          <button
            type="submit"
            className="bg-[#2196F3] text-white rounded-lg py-2 text-lg font-semibold hover:bg-[#348dd6] transition duration-300 ease-in-out"
          >
            Login
          </button>
        </form>

        {/* <div className="mt-2">
          <button className="bg-[#2196F3] text-white rounded-lg py-2 text-lg font-semibold hover:bg-[#348dd6] transition duration-300 ease-in-out w-full" onClick={handleGoolgleLogin}>Login with Google</button>
        </div> */}

        <div className="flex gap-1 items-center justify-center mt-2">
          <p className="text-gray-600">Don't have an Account?</p>
          <Link to="/signup">
            <span className="text-[#2196F3] underline font-semibold">
              Register
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};




export default LoginPage;


 