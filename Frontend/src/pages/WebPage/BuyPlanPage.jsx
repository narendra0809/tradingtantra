/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import lock from "../../assets/Images/lock.svg";
import play from "../../assets/Images/play.svg";
import doc from "../../assets/Images/doc.svg";
import shild from "../../assets/Images/shild.svg";
import pay from "../../assets/Images/payImg.svg";
import { useRazorpay } from "react-razorpay";
import useFetchData from "../../utils/useFetchData";
import { paymentSchema } from "../../../validators/validator";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";

const PLAN_AMOUNT = 3388.98;
const GST_AMOUNT = 610.02;
const TOTAL_AMOUNT = 3999;

const BuyPlanPage = ({ onPaymentSuccess }) => {
  const { Razorpay } = useRazorpay();
  const { fetchData } = useFetchData();
  const theme = useSelector((state) => state.theme.theme);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [countryCode, setCountryCode] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [selectedState, setSelectedState] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    country: "",
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

  // computed payable
  const payableTotal =
    TOTAL_AMOUNT - (TOTAL_AMOUNT * Number(couponPercent || 0)) / 100;

  // simple helpers
  const inputClass = `${
    theme === "dark"
      ? "bg-[#000A2D] text-white placeholder-gray-400"
      : "bg-[#F3F6F9] text-gray-800 placeholder-gray-500"
  } w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5]`;

  const selectClass = `${
    theme === "dark" ? "bg-[#000A2D] text-white" : "bg-[#F3F6F9] text-gray-800"
  } w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5]`;

  const themeClass = (darkCls, lightCls) =>
    theme === "dark" ? darkCls : lightCls;

  // --------- LOCATION DATA ---------
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get(
          "https://countriesnow.space/api/v0.1/countries"
        );
        setCountries(res.data.data || []);
      } catch (err) {
        console.error("Error fetching country data:", err);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      if (!selectedCountry) {
        setStates([]);
        return;
      }
      try {
        const res = await axios.post(
          "https://countriesnow.space/api/v0.1/countries/states",
          { country: selectedCountry }
        );
        setStates(res.data.data?.states || []);
      } catch (err) {
        console.error("Error fetching state data:", err);
      }
    };
    fetchStates();
  }, [selectedCountry]);

  useEffect(() => {
    const fetchCode = async () => {
      if (!selectedCountry) {
        setCountryCode("");
        return;
      }
      try {
        const res = await axios.post(
          "https://countriesnow.space/api/v0.1/countries/codes",
          { country: selectedCountry }
        );
        setCountryCode(res.data.data?.dial_code || "");
      } catch (err) {
        console.error("Error fetching country code:", err);
      }
    };
    fetchCode();
  }, [selectedCountry]);

  useEffect(() => {
    if (countries.length) setSelectedCountry("India");
  }, [countries]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, country: selectedCountry }));
  }, [selectedCountry]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, state: selectedState }));
  }, [selectedState]);

  // --------- HANDLERS ---------
  const handleCountryChange = (e) => {
    const value = e.target.value;
    setSelectedCountry(value);
    setSelectedState("");
    setCountryCode("");
    setFormData((prev) => ({ ...prev, country: value }));
  };

  const handleStateChange = (e) => {
    const value = e.target.value;
    setSelectedState(value);
    setFormData((prev) => ({ ...prev, state: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCheck = (e) => {
    setIsChecked(e.target.checked);
    setFormErrors((prev) => ({ ...prev, isAgreed: "" }));
  };

  // --------- COUPON VERIFY ---------
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
      // catch me bhi same message
      setCouponError("Invalid or expired coupon");
    }
  };

  // --------- PAYMENT ---------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isChecked) {
      setFormErrors((prev) => ({
        ...prev,
        isAgreed: "Please agree to terms & conditions",
      }));
      return;
    }

    const { data: validData, error } = paymentSchema.safeParse(formData);
    if (error) {
      const errObj = {};
      error.errors.forEach((err) => {
        errObj[err.path[0]] = err.message;
      });
      setFormErrors(errObj);
      return;
    }

    try {
      // optional: send couponCode to backend if you want to use there
      const payload = { ...validData, couponCode: couponCode.trim() || null };
      const res = await fetchData(
        `payment/createorder?renew=${false}`,
        "POST",
        payload
      );
      if (res.status !== 200) throw new Error("Failed to create order !");

      const data = res.data;
      const RAZOR_KEY = data.key;

      const options = {
        key: RAZOR_KEY,
        amount: data.data.amount, // backend final amount
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
          try {
            const isVerified = await verifyPayment(response);
            if (isVerified) {
              Cookies.set("isSubscribed", true);
              onPaymentSuccess();
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            alert(
              "Error verifying payment. Please check your subscription status."
            );
          }
        },
        theme: { color: "#F37254" },
      };

      const rzp = new Razorpay(options);
      rzp.on("payment.failed", (response) => {
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err) {
      console.log("Error doing payment : ", err.message);
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

  // --------- UI ---------
  return (
    <div
      className={`flex flex-col lg:flex-row ${
        theme === "dark"
          ? "bg-[#020417] min-h-screen py-8"
          : "bg-gray-50 min-h-screen py-8"
      } max-w-6xl mx-auto px-8 rounded-2xl`}
    >
      {/* LEFT: FORM */}
      <div className="lg:w-3/5 p-6 lg:p-8">
        <div className="mb-8">
          <h3
            className={`${themeClass(
              "text-white",
              "text-gray-900"
            )} text-2xl font-medium mb-2`}
          >
            Don&apos;t Just Trade, Dominate
          </h3>
          <div
            className={`${themeClass(
              "bg-primary",
              "bg-[#F0F6FF] border"
            )} rounded-lg text-2xl font-thin px-4 py-3 inline-block`}
          >
            <span
              className={theme === "dark" ? "text-white" : "text-[#012A6E]"}
            >
              CRYSTAL (Rs. 3999)
            </span>
          </div>
          <p
            className={`${themeClass(
              "text-white",
              "text-gray-800"
            )} text-xl font-bold mt-4`}
          >
            Duration: 6 months + 6 Months Free
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <span className="text-red-400 text-sm">
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
                <span className="text-red-400 text-sm">
                  {formErrors.lastName}
                </span>
              )}
            </div>

            {/* Country */}
            <div className="space-y-1">
              <select
                name="country"
                value={selectedCountry}
                onChange={handleCountryChange}
                className={selectClass}
              >
                <option value="" disabled className="text-gray-400">
                  Select Country
                </option>
                {countries.map((c, idx) => (
                  <option
                    key={idx}
                    value={c.country}
                    className={theme === "dark" ? "bg-[#000A2D]" : ""}
                  >
                    {c.country}
                  </option>
                ))}
              </select>
            </div>

            {/* State */}
            <div className="space-y-1">
              <select
                name="state"
                value={selectedState}
                onChange={handleStateChange}
                disabled={!selectedCountry}
                className={`${selectClass} disabled:opacity-50`}
              >
                <option value="" disabled className="text-gray-400">
                  Select State
                </option>
                {states.length ? (
                  states.map((s, idx) => (
                    <option
                      key={idx}
                      value={s.name}
                      className={theme === "dark" ? "bg-[#000A2D]" : ""}
                    >
                      {s.name}
                    </option>
                  ))
                ) : (
                  <option
                    disabled
                    className={theme === "dark" ? "bg-[#000A2D]" : ""}
                  >
                    No states available
                  </option>
                )}
              </select>
            </div>

            {/* Phone */}
            <div className="space-y-1 md:col-span-2">
              <div className="flex items-center gap-2">
                <div
                  className={`${
                    theme === "dark"
                      ? "bg-[#000A2D] text-white"
                      : "bg-[#F3F6F9] text-gray-800"
                  } py-3 px-4 rounded-lg w-24 text-center`}
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
                  } flex-1 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5]`}
                />
              </div>
              {formErrors.phoneNumber && (
                <span className="text-red-400 text-sm">
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
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheck}
              className="mt-1 w-5 h-5"
            />
            <div>
              <label
                className={theme === "dark" ? "text-white" : "text-gray-800"}
              >
                I agree with terms & Condition
              </label>
              {formErrors.isAgreed && (
                <span className="block text-red-400 text-sm mt-1">
                  {formErrors.isAgreed}
                </span>
              )}
            </div>
          </div>

          <button type="submit" className="w-full mt-6">
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
        className={`lg:w-2/5 p-6 lg:p-8 rounded-r-xl ${
          theme === "dark" ? "bg-[#72A3FD]" : "bg-[#E6F6FF]"
        }`}
      >
        <div className="h-full flex flex-col">
          <h5
            className={`${
              theme === "dark" ? "text-[#01071C]" : "text-[#012A6E]"
            } font-bold text-2xl mb-6`}
          >
            Payment Information
          </h5>

          {/* Amounts */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <p
                className={`${
                  theme === "dark" ? "text-[#01071C]" : "text-gray-700"
                }`}
              >
                Plan Amount
              </p>
              <p
                className={`${
                  theme === "dark" ? "text-[#01071C]" : "text-gray-900"
                } font-medium`}
              >
                ₹{PLAN_AMOUNT.toFixed(2)}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <p
                className={`${
                  theme === "dark" ? "text-[#01071C]" : "text-gray-700"
                }`}
              >
                GST @18%
              </p>
              <p
                className={`${
                  theme === "dark" ? "text-[#01071C]" : "text-gray-900"
                } font-medium`}
              >
                ₹{GST_AMOUNT.toFixed(2)}
              </p>
            </div>

            {couponPercent > 0 && (
              <div className="flex justify-between items-center">
                <p
                  className={`${
                    theme === "dark" ? "text-[#01071C]" : "text-gray-700"
                  }`}
                >
                  Coupon Discount ({couponPercent}%)
                </p>
                <p className="text-green-700 font-medium">
                  - ₹{((TOTAL_AMOUNT * couponPercent) / 100).toFixed(2)}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center border-t border-[#01071C] pt-4 mt-2">
              <p
                className={`${
                  theme === "dark" ? "text-[#01071C]" : "text-gray-900"
                } font-bold text-lg`}
              >
                Total Payable
              </p>
              <p
                className={`${
                  theme === "dark" ? "text-[#01071C]" : "text-gray-900"
                } font-bold text-lg`}
              >
                ₹{payableTotal.toFixed(2)}
              </p>
            </div>
          </div>
          {/* Coupon */}
          <div className="mb-6">
            <p
              className={`mb-2 text-sm ${
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
                className={`flex-1 py-2 px-3 rounded-lg text-sm outline-none ${
                  theme === "dark"
                    ? "bg-[#BCD4FF] text-[#01071C] placeholder-gray-600"
                    : "bg-white text-gray-800 placeholder-gray-500"
                }`}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-4 py-2 rounded-lg bg-[rgb(2,86,245)] text-white text-sm font-semibold hover:opacity-90"
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
          <div className="space-y-4 mt-4">
            <h6
              className={`${
                theme === "dark" ? "text-[#01071C]" : "text-gray-800"
              } font-semibold text-lg`}
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
              <div key={i} className="flex items-center space-x-3">
                <img src={icon} alt="" className="w-5 h-5" />
                <p
                  className={`${
                    theme === "dark" ? "text-[#01071C]" : "text-gray-800"
                  }`}
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
