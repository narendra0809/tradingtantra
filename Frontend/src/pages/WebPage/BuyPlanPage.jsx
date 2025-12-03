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

/**
 * BuyPlanPage — reads global theme from:
 * 1) localStorage.theme
 * 2) document.documentElement.classList.contains('dark')
 * 3) prefers-color-scheme
 *
 * Also listens to `storage` events (so header toggle updating localStorage.theme will update this component).
 */

const BuyPlanPage = ({ onPaymentSuccess }) => {
  const { Razorpay } = useRazorpay();
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [countryCode, setCountryCode] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    country: "",
    state: "",
    phoneNumber: "",
    email: "",
    confirmEmail: "",
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    country: "",
    state: "",
    phoneNumber: "",
    email: "",
    confirmEmail: "",
  });
  const { fetchData } = useFetchData();

  // THEME: read from global (localStorage or html.dark)
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const resolveTheme = () => {
      try {
        const ls = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
        if (ls === "dark" || ls === "light") return ls;
      } catch (e) {
        /* ignore localStorage errors */
      }
      // If site toggles dark class on html element
      if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
        return "dark";
      }
      // fallback to OS preference
      if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        return "light";
      }
      return "dark";
    };

    setTheme(resolveTheme());

    // listen to localStorage changes (header toggle might set localStorage.theme)
    const onStorage = (e) => {
      if (e.key === "theme") {
        setTheme(e.newValue === "light" ? "light" : "dark");
      }
    };
    window.addEventListener("storage", onStorage);

    // observe html class changes in case header toggles via classList
    const observer = new MutationObserver(() => {
      const htmlDark = document.documentElement.classList.contains("dark");
      setTheme(htmlDark ? "dark" : (localStorage.getItem("theme") === "light" ? "light" : (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener("storage", onStorage);
      observer.disconnect();
    };
  }, []);

  // Fetch countries data
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(
          "https://countriesnow.space/api/v0.1/countries"
        );
        setCountries(response.data.data);
      } catch (error) {
        console.error("Error fetching country data:", error);
      }
    };
    fetchCountries();
  }, []);

  // Fetch states based on selected country
  useEffect(() => {
    const fetchStates = async () => {
      if (selectedCountry) {
        try {
          const response = await axios.post(
            "https://countriesnow.space/api/v0.1/countries/states",
            { country: selectedCountry }
          );
          setStates(response.data.data.states);
        } catch (error) {
          console.error("Error fetching state data:", error);
        }
      } else {
        setStates([]);
      }
    };
    fetchStates();
  }, [selectedCountry]);

  useEffect(() => {
    const fetchCountryCode = async () => {
      if (selectedCountry) {
        try {
          const response = await axios.post(
            "https://countriesnow.space/api/v0.1/countries/codes",
            { country: selectedCountry }
          );
          setCountryCode(response.data.data?.dial_code || "");
        } catch (error) {
          console.error("Error fetching country code:", error);
        }
      } else {
        setCountryCode("");
      }
    };
    fetchCountryCode();
  }, [selectedCountry]);

  const handleCountryChange = (event) => {
    setFormData({ ...formData, country: event.target.value });
    setSelectedCountry(event.target.value);
    setSelectedState("");
    setCountryCode("");
  };

  const handleStateChange = (event) => {
    setFormData({ ...formData, state: event.target.value });
    setSelectedState(event.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isChecked) {
      setFormErrors({
        ...formErrors,
        isAgreed: "Please agree to terms & conditions",
      });
      return;
    }
    const { data: formValues, error } = paymentSchema.safeParse(formData);
    if (error) {
      const errorMessages = error.errors;
      const errorData = {};
      errorMessages.map((err) => {
        errorData[err.path[0]] = err.message;
      });
      setFormErrors(errorData);
      return;
    }
    try {
      const res = await fetchData(
        `payment/createorder?renew=${false}`,
        "POST",
        formValues
      );
      if (res.status !== 200) {
        throw new Error("Failed to create order !");
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
          try {
            const isVerified = await verifyPayment(response);
            if (isVerified) {
              Cookies.set("isSubscribed", true);
              onPaymentSuccess(); // Trigger parent refetch and rerender
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            alert(
              "Error verifying payment. Please check your subscription status."
            );
          }
        },
        theme: {
          color: "#F37254",
        },
      };

      const rzp = new Razorpay(options);
      rzp.on("payment.failed", (response) => {
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error) {
      console.log("Error doing payment : ", error.message);
    }
  };

  const verifyPayment = async (paymentResponse) => {
    try {
      const res = await fetchData(
        `payment/verify-payment?renew=${false}`,
        "POST",
        paymentResponse
      );
      if (res.status !== 200) {
        throw new Error("Failed to verify payment");
      }
      return res.data.success;
    } catch (error) {
      console.log("Error verifing payment : ", error);
      return false;
    }
  };

  const handleCheck = (e) => {
    setIsChecked(e.target.checked);
    setFormErrors({ ...formErrors, isAgreed: "" });
  };

  // Utility to pick classes by theme
  const themeClass = (darkCls, lightCls) => (theme === "dark" ? darkCls : lightCls);

  return (
    <div className={theme === "dark" ? "bg-[#020417] min-h-screen py-8" : "bg-gray-50 min-h-screen py-8"}>
      <div className="max-w-6xl mx-auto px-4">
        <div className={`${themeClass("bg-[#01071C] border-[#0256f550] shadow-lg", "bg-white border-gray-200 shadow-md")} rounded-xl border overflow-hidden`}>
          <div className="flex items-center justify-end p-4">
            {/* header toggle exists elsewhere — no local toggle here */}
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Left Column - Form */}
            <div className={`lg:w-3/5 p-6 lg:p-8`}>
              <div className="mb-8">
                <h3 className={`${themeClass("text-white", "text-gray-900")} text-2xl font-medium mb-2`}>
                  Don&apos;t Just Trade, Dominate
                </h3>
                <div className={`${themeClass("bg-primary", "bg-[#F0F6FF] border")} rounded-lg text-2xl font-thin px-4 py-3 inline-block`}>
                  <span className={theme === "dark" ? "text-white" : "text-[#012A6E]"}>CRYSTAL (Rs. 3999)</span>
                </div>
                <p className={`${themeClass("text-white", "text-gray-800")} text-xl font-bold mt-4`}>
                  Duration: 6 months + 6 Months Free
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <input
                      onChange={handleChange}
                      name="firstName"
                      type="text"
                      placeholder="First Name*"
                      value={formData.firstName}
                      className={`${theme === "dark" ? "bg-[#000A2D] text-white placeholder-gray-400" : "bg-[#F3F6F9] text-gray-800 placeholder-gray-500"} w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5]`}
                    />
                    {formErrors.firstName && (
                      <span className="text-red-400 text-sm">
                        {formErrors.firstName}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <input
                      type="text"
                      onChange={handleChange}
                      name="lastName"
                      value={formData.lastName}
                      placeholder="Last Name*"
                      className={`${theme === "dark" ? "bg-[#000A2D] text-white placeholder-gray-400" : "bg-[#F3F6F9] text-gray-800 placeholder-gray-500"} w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5]`}
                    />
                    {formErrors.lastName && (
                      <span className="text-red-400 text-sm">
                        {formErrors.lastName}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <select
                      name="country"
                      className={`${theme === "dark" ? "bg-[#000A2D] text-white" : "bg-[#F3F6F9] text-gray-800"} w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5]`}
                      value={selectedCountry}
                      onChange={handleCountryChange}
                    >
                      <option value="" disabled className="text-gray-400">
                        Select Country
                      </option>
                      {countries.map((country, index) => (
                        <option
                          key={index}
                          value={country.country}
                          className={theme === "dark" ? "bg-[#000A2D]" : ""}
                        >
                          {country.country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <select
                      name="state"
                      className={`${theme === "dark" ? "bg-[#000A2D] text-white" : "bg-[#F3F6F9] text-gray-800"} w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5] disabled:opacity-50`}
                      value={selectedState}
                      onChange={handleStateChange}
                      disabled={!selectedCountry}
                    >
                      <option value="" disabled className="text-gray-400">
                        Select State
                      </option>
                      {states.length > 0 ? (
                        states.map((state, index) => (
                          <option
                            key={index}
                            value={state.name}
                            className={theme === "dark" ? "bg-[#000A2D]" : ""}
                          >
                            {state.name}
                          </option>
                        ))
                      ) : (
                        <option disabled className={theme === "dark" ? "bg-[#000A2D]" : ""}>
                          No states available
                        </option>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <div className={`${theme === "dark" ? "bg-[#000A2D] text-white" : "bg-[#F3F6F9] text-gray-800"} py-3 px-4 rounded-lg w-24 text-center`}>
                        {countryCode || "+91"}
                      </div>
                      <input
                        type="number"
                        name="phoneNumber"
                        onChange={handleChange}
                        value={formData.phoneNumber}
                        placeholder="Whatsapp Number*"
                        className={`${theme === "dark" ? "bg-[#000A2D] text-white placeholder-gray-400" : "bg-[#F3F6F9] text-gray-800 placeholder-gray-500"} flex-1 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5]`}
                      />
                      {formErrors.phoneNumber && (
                        <span className="text-red-400 text-sm">
                          {formErrors.phoneNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <input
                      type="email"
                      onChange={handleChange}
                      name="email"
                      value={formData.email}
                      placeholder="G-Mail Id*"
                      className={`${theme === "dark" ? "bg-[#000A2D] text-white placeholder-gray-400" : "bg-[#F3F6F9] text-gray-800 placeholder-gray-500"} w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5]`}
                    />
                    {formErrors.email && (
                      <span className="text-red-400 text-sm">
                        {formErrors.email}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <input
                      onChange={handleChange}
                      name="confirmEmail"
                      value={formData.confirmEmail}
                      type="email"
                      placeholder="Re-enter G-Mail Id"
                      className={`${theme === "dark" ? "bg-[#000A2D] text-white placeholder-gray-400" : "bg-[#F3F6F9] text-gray-800 placeholder-gray-500"} w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0256F5]`}
                    />
                    {formErrors.confirmEmail && (
                      <span className="text-red-400 text-sm">
                        {formErrors.confirmEmail}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    onChange={handleCheck}
                    checked={isChecked}
                    className="mt-1 w-5 h-5"
                    name="TandC"
                  />
                  <div>
                    <label htmlFor="TandC" className={theme === "dark" ? "text-white" : "text-gray-800"}>
                      I agree with terms & Condition
                    </label>
                    {formErrors?.isAgreed && (
                      <span className="block text-red-400 text-sm mt-1">
                        {formErrors?.isAgreed}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6"
                >
                  <img
                    src={pay}
                    alt="Pay Now"
                    className="w-full max-w-md mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                  />
                </button>
              </form>
            </div>

            {/* Right Column - Payment Info */}
            <div className={`lg:w-2/5 p-6 lg:p-8 rounded-r-xl ${theme === "dark" ? "bg-[#72A3FD]" : "bg-[#E6F6FF]"}`}>
              <div className="h-full flex flex-col">
                <h5 className={`${theme === "dark" ? "text-[#01071C]" : "text-[#012A6E]"} font-bold text-2xl mb-6`}>
                  Payment Information
                </h5>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <p className={`${theme === "dark" ? "text-[#01071C]" : "text-gray-700"}`}>Plan Amount</p>
                    <p className={`${theme === "dark" ? "text-[#01071C]" : "text-gray-900"} font-medium`}>₹3388.98</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`${theme === "dark" ? "text-[#01071C]" : "text-gray-700"}`}>GST @18%</p>
                    <p className={`${theme === "dark" ? "text-[#01071C]" : "text-gray-900"} font-medium`}>₹610.02</p>
                  </div>
                  <div className="flex justify-between items-center border-t border-[#01071C] pt-4 mt-2">
                    <p className={`${theme === "dark" ? "text-[#01071C]" : "text-gray-900"} font-bold text-lg`}>
                      Total Payable
                    </p>
                    <p className={`${theme === "dark" ? "text-[#01071C]" : "text-gray-900"} font-bold text-lg`}>₹3,999</p>
                  </div>
                </div>

                <div className="space-y-4 mt-4">
                  <h6 className={`${theme === "dark" ? "text-[#01071C]" : "text-gray-800"} font-semibold text-lg`}>
                    Plan Includes:
                  </h6>
                  <div className="flex items-center space-x-3">
                    <img src={lock} alt="" className="w-5 h-5" />
                    <p className={`${theme === "dark" ? "text-[#01071C]" : "text-gray-800"}`}>Full access to all trading strategies</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <img src={play} alt="" className="w-5 h-5" />
                    <p className={`${theme === "dark" ? "text-[#01071C]" : "text-gray-800"}`}>Daily market analysis videos</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <img src={doc} alt="" className="w-5 h-5" />
                    <p className={`${theme === "dark" ? "text-[#01071C]" : "text-gray-800"}`}>Exclusive trading tools & indicators</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <img src={shild} alt="" className="w-5 h-5" />
                    <p className={`${theme === "dark" ? "text-[#01071C]" : "text-gray-800"}`}>Risk management guides</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <img src={play} alt="" className="w-5 h-5" />
                    <p className={`${theme === "dark" ? "text-[#01071C]" : "text-gray-800"}`}>Live trading sessions weekly</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <img src={doc} alt="" className="w-5 h-5" />
                    <p className={`${theme === "dark" ? "text-[#01071C]" : "text-gray-800"}`}>Portfolio building techniques</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <img src={shild} alt="" className="w-5 h-5" />
                    <p className={`${theme === "dark" ? "text-[#01071C]" : "text-gray-800"}`}>Priority customer support</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <img src={lock} alt="" className="w-5 h-5" />
                    <p className={`${theme === "dark" ? "text-[#01071C]" : "text-gray-800"}`}>Market trend alerts</p>
                  </div>
                </div>
              </div>
            </div>
          </div> {/* flex */}
        </div> {/* card */}
      </div>
    </div>
  );
};

export default BuyPlanPage;
