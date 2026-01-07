/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import lock from "../../assets/Images/lock.svg";
import play from "../../assets/Images/play.svg";
import doc from "../../assets/Images/doc.svg";
import shild from "../../assets/Images/shild.svg";
import pay from "../../assets/Images/payImg.svg";
import indiaStates from "../../utils/indiaStates";
import { useRazorpay } from "react-razorpay";
import useFetchData from "../../utils/useFetchData";
import { paymentSchema } from "../../../validators/validator";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast"; // Using toast for better visibility

const PLAN_AMOUNT = 1639.18;
const GST_AMOUNT =359.82;
const TOTAL_AMOUNT = 1999;

const BuyPlanPage = ({ onPaymentSuccess }) => {
  const { Razorpay } = useRazorpay();
  const { fetchData } = useFetchData();
  const theme = useSelector((state) => state.theme.theme);

  const [countryCode, setCountryCode] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [selectedState, setSelectedState] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    country: "India", // Default set kiya
    state: "",
    phoneNumber: "",
    email: "",
    confirmEmail: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponPercent, setCouponPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponMsg, setCouponMsg] = useState("");

  const payableTotal =
    TOTAL_AMOUNT - (TOTAL_AMOUNT * Number(couponPercent || 0)) / 100;

  const inputClass = `${
    theme === "dark"
      ? "bg-[#000A2D] text-white placeholder-gray-400"
      : "bg-[#F3F6F9] text-gray-800 placeholder-gray-500"
  } w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#0256F5]`;

  const selectClass = `${
    theme === "dark" ? "bg-[#000A2D] text-white" : "bg-[#F3F6F9] text-gray-800"
  } w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#0256F5]`;

  const themeClass = (darkCls, lightCls) =>
    theme === "dark" ? darkCls : lightCls;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Error clear karein taaki user ko pata chale wo fix kar raha hai
    if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheck = (e) => {
    setIsChecked(e.target.checked);
    setFormErrors((prev) => ({ ...prev, isAgreed: "" }));
  };

  const handleApplyCoupon = async () => {
    setCouponError("");
    setCouponMsg("");
    setCouponPercent(0);

    const code = couponCode.trim();
    if (!code) {
      setCouponError("Please enter coupon code");
      return;
    }

    try {
      const res = await fetchData(
        `verify-coupon?code=${encodeURIComponent(code)}`,
        "GET"
      );

      if (res.status !== 200 || !res.data?.success) {
        setCouponError("Invalid or expired coupon");
        return;
      }

      const { coupon } = res.data;
      setCouponPercent(coupon.discountPercent);
      setCouponMsg(
        `Coupon applied: ${coupon.code} (${coupon.discountPercent}% OFF)`
      );
    } catch (err) {
      console.error("Error verifying coupon:", err);
      setCouponError("Invalid or expired coupon");
    }
  };

  // 🔥🔥🔥 DEBUGGING ENABLED HANDLER 🔥🔥🔥
  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("🚀 Step 1: Submit Button Clicked"); 

    // 1. Check Terms
    if (!isChecked) {
      console.warn("⚠️ Validation Fail: Terms not checked");
      toast.error("Please agree to terms & conditions");
      setFormErrors((prev) => ({
        ...prev,
        isAgreed: "Please agree to terms & conditions",
      }));
      return; // YAHAN RUK RAHA HOGA
    }

    // 2. Check Zod Validation
    // console.log("🔍 Step 2: Validating Data...", formData);
    
    // NOTE: Agar aapka schema phone number ko Number expect kar raha hai 
    // lekin form String bhej raha hai, to ye fail hoga.
    const { data: validData, error } = paymentSchema.safeParse(formData);

    if (error) {
      // console.error("❌ Step 2 Fail: Zod Validation Errors:", error.errors);
      
      const errObj = {};
      error.errors.forEach((err) => {
        errObj[err.path[0]] = err.message;
      });
      setFormErrors(errObj);
      toast.error("Please fill all details correctly");
      return; // YAHAN RUK RAHA HOGA
    }

    // console.log("✅ Step 2 Pass: Validation Successful");

    // 3. Check Razorpay SDK
    if (!Razorpay) {
        console.error("❌ Razorpay SDK not loaded yet");
        toast.error("Payment gateway loading... please try again in 5 seconds");
        return;
    }

    try {
      // console.log("📡 Step 3: Calling Create Order API...");
      
      const payload = { ...validData, couponCode: couponCode.trim() || null };
      
      const res = await fetchData(
        `payment/createorder?renew=${false}`,
        "POST",
        payload
      );

      // console.log("📥 Step 4: API Response Received:", res);

      if (!res || res.status !== 200) {
        throw new Error(res?.data?.message || "Failed to create order !");
      }

      const data = res.data;
      const RAZOR_KEY = data.key;

      const options = {
        key: RAZOR_KEY,
        amount: data.data.amount,
        currency: "INR",
        name: "Trading Tantra",
        description: "Test Transaction",
        order_id: data.data.orderId,
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          contact: data.phoneNumber,
        },
        handler: async (response) => {
          console.log("✅ Payment Success Callback:", response);
          try {
            const isVerified = await verifyPayment(response);
            if (isVerified) {
              Cookies.set("isSubscribed", true);
              onPaymentSuccess();
              toast.success("Payment Successful!");
            } else {
              toast.error("Payment verification failed");
            }
          } catch (err) {
            console.error("Payment verification error:", err);
          }
        },
        theme: { color: "#F37254" },
      };

      // console.log("Step 5: Opening Razorpay Modal");
      const rzp = new Razorpay(options);
      rzp.on("payment.failed", (response) => {
        console.error("Payment Failed:", response.error);
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err) {
      console.error("❌ Critical Error in Payment Flow:", err);
      toast.error(err.message || "Something went wrong");
    }
  };

  const verifyPayment = async (paymentResponse) => {
    try {
      const res = await fetchData(
        `payment/verify-payment?renew=${false}`,
        "POST",
        paymentResponse
      );
      if (res.status !== 200) throw new Error("Failed to verify payment");
      return res.data.success;
    } catch (err) {
      console.log("Error verifing payment : ", err);
      return false;
    }
  };

  return (
    <div
      className={`flex flex-col lg:flex-row ${
        theme === "dark"
          ? "bg-[#020417] min-h-screen py-4 sm:py-6 md:py-8"
          : "bg-gray-50 min-h-screen py-4 sm:py-6 md:py-8"
      } max-w-6xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 rounded-xl sm:rounded-2xl`}
    >
      {/* LEFT: FORM */}
      <div className="lg:w-3/5 p-4 sm:p-5 md:p-6 lg:p-8">
        <div className="mb-5 sm:mb-6 md:mb-8">
          <h3
            className={`${themeClass(
              "text-white",
              "text-gray-900"
            )} text-xl sm:text-xl md:text-2xl font-medium mb-2`}
          >
            Don&apos;t Just Trade, Dominate
          </h3>
          <div
            className={`${themeClass(
              "bg-primary",
              "bg-[#F0F6FF] border"
            )} rounded-lg text-lg sm:text-lg md:text-xl lg:text-2xl font-thin px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 inline-block`}
          >
            <span
              className={`${theme === "dark" ? "text-white" : "text-[#012A6E]"} text-base sm:text-base md:text-lg lg:text-xl`}
            >
              CRYSTAL (Rs. 1999)
            </span>
          </div>
          <p
            className={`${themeClass(
              "text-white",
              "text-gray-800"
            )} text-base sm:text-base md:text-lg lg:text-xl font-bold mt-3 sm:mt-4`}
          >
            Duration: 6 months + 6 Months Free
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5 md:gap-4">
            {/* First Name */}
            <div className="space-y-1">
              <input
                name="firstName"
                type="text"
                placeholder="First Name*"
                value={formData.firstName}
                onChange={handleChange}
                className={inputClass}
              />
              {formErrors.firstName && (
                <span className="text-red-400 text-xs sm:text-sm">
                  {formErrors.firstName}
                </span>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-1">
              <input
                name="lastName"
                type="text"
                placeholder="Last Name*"
                value={formData.lastName}
                onChange={handleChange}
                className={inputClass}
              />
              {formErrors.lastName && (
                <span className="text-red-400 text-xs sm:text-sm">
                  {formErrors.lastName}
                </span>
              )}
            </div>

            {/* Country */}
            <div className="space-y-1">
              <select
                name="country"
                value="India"
                disabled
                className={`${selectClass} cursor-not-allowed opacity-80`}
              >
                <option value="India">India</option>
              </select>
            </div>
            
            {/* State */}
            <div className="space-y-1">
              <select
                name="state"
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setFormData((prev) => ({ ...prev, state: e.target.value }));
                  // Clear error if any
                  if(formErrors.state) setFormErrors((prev) => ({ ...prev, state: "" }));
                }}
                className={selectClass}
              >
                <option value="">Select State</option>
                {indiaStates.map((state) => (
                  <option
                    key={state}
                    value={state}
                    className={theme === "dark" ? "bg-[#000A2D]" : ""}
                  >
                    {state}
                  </option>
                ))}
              </select>
               {/* SHOW ERROR IF STATE IS REQUIRED IN SCHEMA */}
               {formErrors.state && (
                <span className="text-red-400 text-sm">
                  {formErrors.state}
                </span>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1 md:col-span-2">
              <div className="flex items-center gap-2">
                <div
                  className={`${
                    theme === "dark"
                      ? "bg-[#000A2D] text-white"
                      : "bg-[#F3F6F9] text-gray-800"
                  } py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg w-18 sm:w-20 md:w-24 text-center text-sm sm:text-base flex-shrink-0`}
                >
                  {countryCode || "+91"}
                </div>
                <input
                  type="number"
                  name="phoneNumber"
                  placeholder="Whatsapp Number*"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`${
                    theme === "dark"
                      ? "bg-[#000A2D] text-white placeholder-gray-400"
                      : "bg-[#F3F6F9] text-gray-800 placeholder-gray-500"
                  } flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#0256F5]`}
                />
              </div>
              {formErrors.phoneNumber && (
                <span className="text-red-400 text-xs sm:text-sm">
                  {formErrors.phoneNumber}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1 md:col-span-2">
              <input
                type="email"
                name="email"
                placeholder="G-Mail Id*"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
              />
              {formErrors.email && (
                <span className="text-red-400 text-sm">{formErrors.email}</span>
              )}
            </div>

            {/* Confirm Email */}
            <div className="space-y-1 md:col-span-2">
              <input
                type="email"
                name="confirmEmail"
                placeholder="Re-enter G-Mail Id"
                value={formData.confirmEmail}
                onChange={handleChange}
                className={inputClass}
              />
              {formErrors.confirmEmail && (
                <span className="text-red-400 text-sm">
                  {formErrors.confirmEmail}
                </span>
              )}
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start space-x-2 sm:space-x-3">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheck}
              className="mt-1 w-4 h-4 sm:w-5 sm:h-5 cursor-pointer flex-shrink-0"
            />
            <div className="flex-1">
              <label
                className={`cursor-pointer text-sm sm:text-base ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                onClick={() => handleCheck({target: {checked: !isChecked}})}
              >
                I agree with terms & Condition
              </label>
              {formErrors.isAgreed && (
                <span className="block text-red-400 text-xs sm:text-sm mt-1">
                  {formErrors.isAgreed}
                </span>
              )}
            </div>
          </div>

          <button type="submit" className="w-full mt-4 sm:mt-5 md:mt-6">
            <img
              src={pay}
              alt="Pay Now"
              className="w-full max-w-md mx-auto cursor-pointer hover:opacity-90 transition-opacity"
            />
          </button>
        </form>
      </div>

      {/* RIGHT: PAYMENT INFO + COUPON */}
      <div
        className={`lg:w-2/5 p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl lg:rounded-r-xl mt-5 sm:mt-6 lg:mt-0 ${
          theme === "dark" ? "bg-[#72A3FD]" : "bg-[#E6F6FF]"
        }`}
      >
        <div className="h-full flex flex-col">
          <h5
            className={`${
              theme === "dark" ? "text-[#01071C]" : "text-[#012A6E]"
            } font-bold text-xl sm:text-xl md:text-2xl mb-4 sm:mb-5 md:mb-6`}
          >
            Payment Information
          </h5>

          {/* Amounts */}
          <div className="space-y-3 sm:space-y-3.5 md:space-y-4 mb-4 sm:mb-5 md:mb-6">
            <div className="flex justify-between items-center">
              <p
                className={`text-sm sm:text-sm md:text-base ${
                  theme === "dark" ? "text-[#01071C]" : "text-gray-700"
                }`}
              >
                Plan Amount
              </p>
              <p
                className={`text-sm sm:text-sm md:text-base ${
                  theme === "dark" ? "text-[#01071C]" : "text-gray-900"
                } font-medium`}
              >
                ₹{PLAN_AMOUNT.toFixed(2)}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <p
                className={`text-sm sm:text-sm md:text-base ${
                  theme === "dark" ? "text-[#01071C]" : "text-gray-700"
                }`}
              >
                GST @18%
              </p>
              <p
                className={`text-sm sm:text-sm md:text-base ${
                  theme === "dark" ? "text-[#01071C]" : "text-gray-900"
                } font-medium`}
              >
                ₹{GST_AMOUNT.toFixed(2)}
              </p>
            </div>

            {couponPercent > 0 && (
              <div className="flex justify-between items-center">
                <p
                  className={`text-sm sm:text-sm md:text-base ${
                    theme === "dark" ? "text-[#01071C]" : "text-gray-700"
                  }`}
                >
                  Coupon Discount ({couponPercent}%)
                </p>
                <p className="text-green-700 font-medium text-sm sm:text-sm md:text-base">
                  - ₹{((TOTAL_AMOUNT * couponPercent) / 100).toFixed(2)}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center border-t border-[#01071C] pt-3 sm:pt-3.5 md:pt-4 mt-2">
              <p
                className={`text-base sm:text-base md:text-lg ${
                  theme === "dark" ? "text-[#01071C]" : "text-gray-900"
                } font-bold`}
              >
                Total Payable
              </p>
              <p
                className={`text-base sm:text-base md:text-lg ${
                  theme === "dark" ? "text-[#01071C]" : "text-gray-900"
                } font-bold`}
              >
                ₹{payableTotal.toFixed(2)}
              </p>
            </div>
          </div>
          {/* Coupon */}
          <div className="mb-4 sm:mb-6">
            <p
              className={`mb-2 text-xs sm:text-sm ${
                theme === "dark" ? "text-[#01071C]" : "text-gray-700"
              }`}
            >
              Have a coupon?
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponError("");
                  setCouponMsg("");
                }}
                placeholder="Enter coupon code"
                className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm outline-none ${
                  theme === "dark"
                    ? "bg-[#BCD4FF] text-[#01071C] placeholder-gray-600"
                    : "bg-white text-gray-800 placeholder-gray-500"
                }`}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-3 sm:px-4 py-2 rounded-lg bg-[rgb(2,86,245)] text-white text-xs sm:text-sm font-semibold hover:opacity-90 whitespace-nowrap"
              >
                Apply
              </button>
            </div>
            {couponError && (
              <p className="text-red-600 text-xs mt-1">{couponError}</p>
            )}
            {couponMsg && (
              <p className="text-green-700 text-xs mt-1">{couponMsg}</p>
            )}
          </div>
          {/* Plan Includes (same as pehle) */}
          <div className="space-y-2.5 sm:space-y-3 md:space-y-4 mt-4">
            <h6
              className={`${
                theme === "dark" ? "text-[#01071C]" : "text-gray-800"
              } font-semibold text-base sm:text-base md:text-lg`}
            >
              Plan Includes:
            </h6>
            {[
              [lock, "Full access to all trading strategies"],
              [play, "Daily market analysis videos"],
              [doc, "Exclusive trading tools & indicators"],
              [shild, "Risk management guides"],
              [play, "Live trading sessions weekly"],
              [doc, "Portfolio building techniques"],
              [shild, "Priority customer support"],
              [lock, "Market trend alerts"],
            ].map(([icon, text], i) => (
              <div key={i} className="flex items-center space-x-2 sm:space-x-2.5 md:space-x-3">
                <img src={icon} alt="" className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                <p
                  className={`text-xs sm:text-xs md:text-sm ${
                    theme === "dark" ? "text-[#01071C]" : "text-gray-800"
                  } leading-tight`}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyPlanPage;