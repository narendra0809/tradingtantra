import { useState, useEffect } from "react";
import axios from "axios";
import lock from "../../assets/Images/lock.svg";
import play from "../../assets/Images/play.svg";
import doc from "../../assets/Images/doc.svg";
import shild from "../../assets/Images/shild.svg";
import { useNavigate } from "react-router-dom";
import pay from "../../assets/Images/payImg.png";
import { useRazorpay } from "react-razorpay";
import useFetchData from "../../utils/useFetchData";
import { paymentSchema } from "../../../validators/validator";
import Cookies from "js-cookie";

const BuyPlanPage = () => {
  const { Razorpay } = useRazorpay();
  const navigate = useNavigate();
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
              Cookies.set("isSubscribed", true, { expires: 1 });
              navigate("/dashboard/plan", { replace: true });
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
    }
  };

  const handleClick = () => {
    document.getElementById("formSubmit").click();
  };

  const handleCheck = (e) => {
    setIsChecked(e.target.checked);
    setFormErrors({ ...formErrors, isAgreed: "" });
  };
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-[#01071C] rounded-xl border border-[#0256f550] overflow-hidden shadow-lg">
        <div className="flex flex-col lg:flex-row">
          {/* Left Column - Form */}
          <div className="lg:w-3/5 p-6 lg:p-8">
            <div className="mb-8">
              <h3 className="text-2xl font-medium text-white mb-2">
                Don&apos;t Just Trade, Dominate
              </h3>
              <div className="bg-primary rounded-lg text-2xl font-thin px-4 py-3 inline-block">
                CRYSTAL (Rs. 3999)
              </div>
              <p className="text-xl font-bold text-white mt-4">
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
                    className="w-full bg-[#000A2D] py-3 px-4 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0256F5]"
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
                    className="w-full bg-[#000A2D] py-3 px-4 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0256F5]"
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
                    className="w-full bg-[#000A2D] py-3 px-4 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#0256F5]"
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
                        className="bg-[#000A2D]"
                      >
                        {country.country}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <select
                    name="state"
                    className="w-full bg-[#000A2D] py-3 px-4 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#0256F5] disabled:opacity-50"
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
                          className="bg-[#000A2D]"
                        >
                          {state.name}
                        </option>
                      ))
                    ) : (
                      <option disabled className="bg-[#000A2D]">
                        No states available
                      </option>
                    )}
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#000A2D] py-3 px-4 rounded-lg text-white w-24 text-center">
                      {countryCode || "+91"}
                    </div>
                    <input
                      type="number"
                      name="phoneNumber"
                      onChange={handleChange}
                      value={formData.phoneNumber}
                      placeholder="Whatsapp Number*"
                      className="flex-1 bg-[#000A2D] py-3 px-4 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0256F5]"
                    />
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <input
                    type="email"
                    onChange={handleChange}
                    name="email"
                    value={formData.email}
                    placeholder="G-Mail Id*"
                    className="w-full bg-[#000A2D] py-3 px-4 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0256F5]"
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
                    className="w-full bg-[#000A2D] py-3 px-4 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0256F5]"
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
                  <label htmlFor="TandC" className="text-white">
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
                onClick={handleClick}
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
          <div className="lg:w-2/5 bg-[#72A3FD] p-6 lg:p-8 rounded-r-xl">
            <div className="h-full flex flex-col">
              <h5 className="text-[#01071C] font-bold text-2xl mb-6">
                Payment Information
              </h5>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <p className="text-[#01071C]">Plan Amount</p>
                  <p className="text-[#01071C] font-medium">₹3388.98</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[#01071C]">GST @18%</p>
                  <p className="text-[#01071C] font-medium">₹610.02</p>
                </div>
                <div className="flex justify-between items-center border-t border-[#01071C] pt-4 mt-2">
                  <p className="text-[#01071C] font-bold text-lg">
                    Total Payable
                  </p>
                  <p className="text-[#01071C] font-bold text-lg">₹3,999</p>
                </div>
              </div>

              <div className="space-y-4 mt-4">
                <h6 className="text-[#01071C] font-semibold text-lg">
                  Plan Includes:
                </h6>
                <div className="flex items-center space-x-3">
                  <img src={lock} alt="" className="w-5 h-5" />
                  <p className="text-[#01071C]">
                    Full access to all trading strategies
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <img src={play} alt="" className="w-5 h-5" />
                  <p className="text-[#01071C]">Daily market analysis videos</p>
                </div>
                <div className="flex items-center space-x-3">
                  <img src={doc} alt="" className="w-5 h-5" />
                  <p className="text-[#01071C]">
                    Exclusive trading tools & indicators
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <img src={shild} alt="" className="w-5 h-5" />
                  <p className="text-[#01071C]">Risk management guides</p>
                </div>
                <div className="flex items-center space-x-3">
                  <img src={play} alt="" className="w-5 h-5" />
                  <p className="text-[#01071C]">Live trading sessions weekly</p>
                </div>
                <div className="flex items-center space-x-3">
                  <img src={doc} alt="" className="w-5 h-5" />
                  <p className="text-[#01071C]">
                    Portfolio building techniques
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <img src={shild} alt="" className="w-5 h-5" />
                  <p className="text-[#01071C]">Priority customer support</p>
                </div>
                <div className="flex items-center space-x-3">
                  <img src={lock} alt="" className="w-5 h-5" />
                  <p className="text-[#01071C]">Market trend alerts</p>
                </div>
              </div>
              {/* 
              <div className="mt-6 pt-4 border-t border-[#01071C]">
                <p className="text-[#01071C] text-sm">
                  * 7-day money back guarantee
                </p>
                <p className="text-[#01071C] text-sm mt-1">* Cancel anytime</p>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyPlanPage;
