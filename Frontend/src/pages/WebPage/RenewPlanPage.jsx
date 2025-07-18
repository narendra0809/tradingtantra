/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import lock from "../../assets/Images/lock.svg";
import play from "../../assets/Images/play.svg";
import doc from "../../assets/Images/doc.svg";
import shild from "../../assets/Images/shild.svg";
import { useRazorpay } from "react-razorpay";
import useFetchData from "../../utils/useFetchData";

const RenewPlanPage = ({ setShowRenewModal }) => {
  const { Razorpay } = useRazorpay();
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const { fetchData } = useFetchData();

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

  useEffect(() => {
    const fetchStates = async () => {
      if (selectedCountry) {
        try {
          const response = await axios.post(
            "https://countriesnow.space/api/v0.1/countries/states",
            {
              country: selectedCountry,
            }
          );
          setStates(response.data.data.states);
        } catch (error) {
          console.error("Error fetching state data:", error);
        }
      }
    };
    fetchStates();
  }, [selectedCountry]);

  // Handle country change
  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
    setSelectedState(""); // Reset state when country changes
  };

  // Handle state change
  const handleStateChange = (event) => {
    setSelectedState(event.target.value);
  };

  const handlePayment = async () => {
    if (!selectedCountry || !selectedState) {
      return;
    }
    try {
      const res = await fetchData(`payment/createorder?renew=${true}`, "POST");
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
          await increaseSubscriptionValidity();
          setShowRenewModal(false);
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
        `payment/verify-payment?renew=${true}`,
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

  const increaseSubscriptionValidity = async () => {
    try {
      const res = await fetchData("payment/renew-plan", "POST");
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      return res.data.success;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="xl:w-[70%] w-[90%] mx-auto bg-[#01071C] not-dark:bg-primary-light px-8 py-8 font-abcRepro space-y-10 rounded-xl border border-[#0256f550] not-dark:text-white">
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col space-y-5 ">
            <h3 className="md:text-5xl sm:text-3xl text-xl font-bold">
              Renew Plan
            </h3>
            <p className="bg-primary rounded-lg md:text-3xl sm:text-xl text-base font-thin px-3 py-2">
              DIAMOND (3999)
            </p>
          </div>
          <div>
            <p className="md:text-3xl sm:text-2xl text-base  font-light">
              Validity: 365 Days
            </p>
          </div>
        </div>
        <div className="space-y-5">
          <p className="text-center text-xl">Select Country and State</p>
          <div className="flex sm:flex-row flex-col gap-y-6 items-center justify-between">
            {/* Country Dropdown */}
            <select
              name="country"
              className="sm:w-[45%] w-full px-4 bg-[#000A2D] not-dark:bg-primary py-2 rounded-lg"
              value={selectedCountry}
              onChange={handleCountryChange}
            >
              <option value="" disabled selected>
                Select Country
              </option>
              {countries.map((country, index) => (
                <option key={index} value={country.country}>
                  {country.country}
                </option>
              ))}
            </select>

            {/* State Dropdown */}
            <select
              name="state"
              className="sm:w-[45%] w-full px-4 bg-[#000A2D] not-dark:bg-primary py-2 rounded-lg"
              value={selectedState}
              onChange={handleStateChange}
              disabled={!selectedCountry} // Disable if no country is selected
            >
              <option value="" disabled selected>
                Select State
              </option>
              {states.length > 0 ? (
                states.map((state, index) => (
                  <option key={index} value={state.name}>
                    {state.name} {/* Assuming 'name' is the state's name */}
                  </option>
                ))
              ) : (
                <option disabled>No states available</option>
              )}
            </select>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-10 gap-5 w-full mx-auto lg:ml-15">
          <div className="flex items-center gap-3">
            <img src={lock} alt="" className="md:w-10 w-7 md:h-10 h-7" />
            <p className="md:text-xl text-sm font-normal">
              Get Instant Access Now
            </p>
          </div>
          <div className="flex items-center gap-3">
            <img src={doc} alt="" className="md:w-10 w-7 md:h-10 h-7" />
            <p className="md:text-xl text-sm font-normal">
              Watch Tutorials Inside
            </p>
          </div>
          <div className="flex items-center gap-3">
            <img src={play} alt="" className="md:w-10 w-7 md:h-10 h-7" />
            <p className="md:text-xl text-sm font-normal">
              View All Strategies
            </p>
          </div>
          <div className="flex items-center gap-3">
            <img src={shild} alt="" className="md:w-10 w-7 md:h-10 h-7" />
            <p className="md:text-xl text-sm font-normal">
              Prepare For Tomorrow
            </p>
          </div>
        </div>
        <button
          onClick={handlePayment}
          className="cursor-pointer bg-primary py-4 text-xl font-thin w-full rounded-xl"
        >
          Click to Continue
        </button>
      </div>
    </>
  );
};

export default RenewPlanPage;
