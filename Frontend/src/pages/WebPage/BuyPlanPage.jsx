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
    phoneNumber: Number,
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
      const res = await fetchData("payment/createorder", "POST", formValues);
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
          const isVerified = await verifyPayment(response);
          if (!isVerified) return;
          Cookies.set("isSubscribed", true, { expires: 1 });
          navigate("/dashboard/plan", { replace: true });
        },
        theme: {
          color: "#F37254",
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      console.log("Error doing payment : ", error.message);
    }
  };

  const verifyPayment = async (paymentResponse) => {
    try {
      const res = await fetchData(
        "payment/verify-payment",
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
    <>
      <div className="xl:w-[70%] md:w-[90%] w-full mx-auto bg-[#01071C] md:px-8 px-4 md:py-8 py-4 font-abcRepro space-y-10 rounded-xl border border-[#0256f550] flex sm:flex-row flex-col items-start gap-5 ">
        <div className="sm:w-[60%] w-full">
          <div className="flex flex-col md:space-y-10 space-y-5">
            <h3 className="text-2xl font-medium">Don’t Just Trade Dominate</h3>
            <p className="bg-primary rounded-lg md:text-2xl text-xl font-thin px-3 py-2 md:w-1/2 w-4/5">
              CRYSTAL (Rs. 3999)
            </p>
            <p className="md:text-2xl text-xl font-bold">
              Duration: 6 months + 6 Months Free
            </p>
          </div>

          <div className=" md:mt-15 mt-8">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between flex-wrap  text-white md:space-y-6 space-y-3">
                <input
                  onChange={handleChange}
                  name="firstName"
                  type="text"
                  placeholder="First Name*"
                  value={formData.firstName}
                  className="sm:w-[45%] w-full  bg-[#000A2D] py-2 rounded-lg px-3"
                />
                {formErrors.firstName && (
                  <span className="bg-red-400 rounded-lg p-2 ">
                    {formErrors.firstName}
                  </span>
                )}
                <input
                  type="text"
                  onChange={handleChange}
                  name="lastName"
                  value={formData.lastName}
                  placeholder="Last Name*"
                  className="sm:w-[45%] w-full   bg-[#000A2D] py-2 rounded-lg px-3"
                />
                {formErrors.lastName && (
                  <span className="bg-red-400 rounded-lg p-2 ">
                    {formErrors.lastName}
                  </span>
                )}

                <select
                  name="country"
                  className="sm:w-[45%] w-full px-4 bg-[#000A2D] py-2 rounded-lg"
                  value={selectedCountry}
                  onChange={handleCountryChange}
                >
                  <option value="" disabled>
                    Select Country
                  </option>
                  {countries.map((country, index) => (
                    <option key={index} value={country.country}>
                      {country.country}
                    </option>
                  ))}
                </select>

                <select
                  name="state"
                  className="sm:w-[45%] w-full px-4 bg-[#000A2D] py-2 rounded-lg"
                  value={selectedState}
                  onChange={handleStateChange}
                  disabled={!selectedCountry}
                >
                  <option value="" disabled>
                    Select State
                  </option>
                  {states.length > 0 ? (
                    states.map((state, index) => (
                      <option key={index} value={state.name}>
                        {state.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No states available</option>
                  )}
                </select>

                <div className="w-full flex items-center gap-2">
                  <p className="px-2 w-[15%] text-center py-2 bg-[#000A2D] rounded-lg">
                    {countryCode || "+91"}
                  </p>
                  <input
                    type="number"
                    name="phoneNumber"
                    onChange={handleChange}
                    value={formData.phoneNumber}
                    placeholder="Whatsapp Number*"
                    className="w-[85%] bg-[#000A2D] py-2 rounded-lg px-3"
                  />
                </div>

                <input
                  type="email"
                  onChange={handleChange}
                  name="email"
                  value={formData.email}
                  placeholder="G-Mail Id*"
                  className="w-full bg-[#000A2D] py-2 rounded-lg px-3"
                />
                {formErrors.email && (
                  <span className="bg-red-400 rounded-lg p-2 ">
                    {formErrors.email}
                  </span>
                )}
                <input
                  onChange={handleChange}
                  name="confirmEmail"
                  value={formData.confirmEmail}
                  type="email"
                  placeholder="Re-enter G-Mail Id"
                  className="w-full bg-[#000A2D] py-2 rounded-lg px-3"
                />
                {formErrors.confirmEmail && (
                  <span className="bg-red-400 rounded-lg p-2 ">
                    {formErrors.confirmEmail}
                  </span>
                )}
              </div>
              <button type="submit" id="formSubmit"></button>
            </form>
          </div>
        </div>

        {/* Payment Information */}
        <div className="sm:w-[40%] w-full bg-[#72A3FD] rounded-2xl  p-5">
          <h5 className="text-primary font-bold text-xl">
            Payment Information
          </h5>

          <div className="w-full flex justify-between items-center text-black text-sm font-thin md:mt-10 mt-5 ">
            <p>Amount</p>
            <p>&#8377;3388.98</p>
          </div>
          <div className="w-full flex justify-between items-center text-black text-sm font-thin md:mt-5 mt-2">
            <p>GST @18%</p>
            <p>&#8377;610.02</p>
          </div>
          <div className="w-full flex justify-between items-center text-black text-sm font-thin md:mt-5 mt-2">
            <p>Amount Payable</p>
            <p>&#8377;3,999</p>
          </div>
          <div className="flex flex-col  md:space-y-5 space-y-2 text-black md:my-10 my-5">
            <div className="flex items-center gap-3">
              <img src={lock} alt="" className="md:w-6 w-4 md:h-6 h-4" />
              <p className="md:text-base text-sm font-normal">
                Get Instant Access Now
              </p>
            </div>
            <div className="flex items-center gap-3">
              <img src={doc} alt="" className="md:w-6 w-4 md:h-6 h-4" />
              <p className="md:text-base text-sm font-normal">
                Watch Tutorials Inside
              </p>
            </div>
            <div className="flex items-center gap-3">
              <img src={play} alt="" className="md:w-6 w-4 md:h-6 h-4" />
              <p className="md:text-base text-sm font-normal">
                View All Strategies
              </p>
            </div>
            <div className="flex items-center gap-3">
              <img src={shild} alt="" className="md:w-6 w-4 md:h-6 h-4" />
              <p className="md:text-base text-sm font-normal">
                Prepare For Tomorrow
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-black">
            <input
              type="checkbox"
              onChange={handleCheck}
              checked={isChecked}
              className="w-4 h-4"
              name="TandC"
            />
            <label htmlFor="TandC" className="md:text-xl text-xs">
              I agree with terms & Condition
            </label>
            {formErrors?.isAgreed && (
              <span className="bg-red-400 rounded-lg p-2">
                {formErrors?.isAgreed}
              </span>
            )}
          </div>
          <button onClick={handleClick}>
            <img
              src={pay}
              alt=""
              className="w-4/5 cursor-pointer mt-5 mx-auto"
            />
          </button>
        </div>
      </div>
    </>
  );
};

export default BuyPlanPage;
