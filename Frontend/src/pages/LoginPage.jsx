/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import WrapperHeader from "./WrapperHeader";
import WrapperPage from "./WrapperPage";
import GoogleButton from "../Components/OAuth";
import { useDispatch } from "react-redux";
import { setTheme } from "../contexts/Redux/Slices/themeSlice";
import { toast } from "react-hot-toast";
import { checkMaintenanceMode } from "../utils/checkMaintenance";
import MaintenancePage from "./WebPage/MaintenancePage";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);
  
  // 🔥 State for the Custom Popup
  const [showConflictModal, setShowConflictModal] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { login, user } = useAuth(); 

  // Check maintenance mode on mount
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const { isMaintenance: maintenanceStatus } = await checkMaintenanceMode();
        setIsMaintenance(maintenanceStatus);
        if (maintenanceStatus) {
          // If maintenance is ON, show maintenance page
          return;
        }
      } catch (error) {
        console.error("Error checking maintenance mode:", error);
        // On error, allow login (fail open)
        setIsMaintenance(false);
      } finally {
        setCheckingMaintenance(false);
      }
    };

    checkMaintenance();
  }, []);

  // Redirect if already logged in (only if not in maintenance)
  useEffect(() => {
    if (user && !isMaintenance) navigate("/dashboard");
  }, [user, navigate, isMaintenance]);

  // If maintenance is ON, show maintenance page
  if (checkingMaintenance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#02000E] via-[#01071C] to-[#000517] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (isMaintenance) {
    return <MaintenancePage />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: "" });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
    if (!formData.password) errors.password = "Password is required";
    return errors;
  };

  // 🔥 HANDLER FOR LOGIN LOGIC
  const handleLoginLogic = async (force = false) => {
    setIsSubmitting(true);
    try {
      const res = await login(formData.email, formData.password, force);
      
      // Success
      dispatch(setTheme(res.user?.darkMode ? "dark" : "light"));
      toast.success(force ? "Logged in & other device logged out!" : "Logged in successfully");
      setShowConflictModal(false); // Close modal if open
      navigate("/dashboard");

    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;

      // 🔥 CASE: ALREADY LOGGED IN -> OPEN CUSTOM MODAL
      if (status === 409 && data?.code === "ALREADY_LOGGED_IN") {
        setShowConflictModal(true); 
        setIsSubmitting(false); // Stop loading spinner on main form
        return; 
      }

      // Standard Errors
      toast.error(data?.message || "Login failed");
      
      if (data?.message === "User not Exist, please sign up") {
        setFormErrors((prev) => ({ ...prev, api: "User does not exist. Please sign up." }));
      } else if (data?.message === "Invalid credentials") {
        setFormErrors((prev) => ({ ...prev, api: "Wrong credentials. Please try again." }));
      }
    } finally {
      // If we are opening the modal, we already set submitting to false above.
      // If we are forcing login (recursive), we keep it true until success/fail.
      if (!force && !showConflictModal) setIsSubmitting(false); 
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      handleLoginLogic(false); // Start with force=false
    }
  };

  // 🔥 ACTION FOR MODAL "YES" BUTTON
  const handleForceLoginConfirm = () => {
    setShowConflictModal(false);
    handleLoginLogic(true); // Call login with force=true
  };

  return (
    <WrapperPage>
      <WrapperHeader
        title="Welcome Back"
        discription="Welcome back please enter your details"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1 text-white">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            onChange={handleChange}
            className="w-full text-white px-4 py-3 bg-[#151B2D] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5] placeholder:text-gray-400"
            placeholder="Enter your email"
            required
          />
          {formErrors.email && <p className="mt-1 text-sm text-[#FF4242]">{formErrors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1 text-white">
            Password
          </label>
          <input
            name="password"
            type="password"
            id="password"
            onChange={handleChange}
            className="text-white w-full px-4 py-3 bg-[#151B2D] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5] placeholder:text-gray-400"
            placeholder="Enter your password"
            required
          />
          {formErrors.password && <p className="mt-1 text-sm text-[#FF4242]">{formErrors.password}</p>}
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
          className={`text-white w-full py-3 px-4 bg-[#0256F5] hover:bg-[#0257f5] rounded-lg font-medium transition duration-200 ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Processing..." : "Sign In"}
        </button>
        
        <div className="w-full flex items-center my-4">
          <div className="grow border-t border-[#E8ECF4]"></div>
          <span className="mx-4 text-gray-500">Or Login with</span>
          <div className="grow border-t border-[#E8ECF4]"></div>
        </div>

        <GoogleButton />

        <div className="text-center text-sm text-white">
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

      {/* 🔥 CUSTOM CONFLICT MODAL */}
      {showConflictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#151B2D] border border-gray-700 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#EAB308" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">
                Already Logged In
              </h3>
              
              <p className="text-gray-400 text-sm mb-6">
                You are currently logged in on another device. Logging in here will 
                <span className="text-[#FF4242] font-medium"> log you out </span> 
                from the other session.
              </p>

              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowConflictModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleForceLoginConfirm}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#0256F5] hover:bg-[#0257f5] rounded-lg transition-colors"
                >
                  Logout Other & Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </WrapperPage>
  );
};

export default LoginPage;