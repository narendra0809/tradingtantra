import React, { useState, useEffect } from "react";
import axios from "axios";
import lock from "../../assets/Images/lock.svg";
import play from "../../assets/Images/play.svg";
import doc from "../../assets/Images/doc.svg";
import shild from "../../assets/Images/shild.svg";
import pay from "../../assets/Images/payImg.png";

const BuyPlanPage = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [countryCode, setCountryCode] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

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
    setSelectedCountry(event.target.value);
    setSelectedState("");
    setCountryCode(""); 
  };

  const handleStateChange = (event) => {
    setSelectedState(event.target.value);
  };

  return (
    <>
         <div className="bg-[url(./assets/Images/heroImg.png)]  rounded-3xl md:w-[90%] w-full md:h-[360px] h-[200px] mx-auto object-center bg-no-repeat md:my-35 mt-30 mb-20  flex items-center justify-center font-abcRepro ">
        <div className="blue-blur-circle"></div>
        <h1 className="md:text-6xl text-4xl font-abcRepro font-bold ">Buy Plan</h1>
      </div>

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
            <form action="">
              <div className="flex items-center justify-between flex-wrap  text-white md:space-y-6 space-y-3">
                <input
                  type="text"
                  placeholder="First Name*"
                  className="sm:w-[45%] w-full  bg-[#000A2D] py-2 rounded-lg px-3"
                />
                <input
                  type="text"
                  placeholder="Last Name*"
                  className="sm:w-[45%] w-full   bg-[#000A2D] py-2 rounded-lg px-3"
                />

                {/* Country Dropdown */}
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

                {/* State Dropdown */}
                <select
                  name="state"
                  className="sm:w-[45%] w-full px-4 bg-[#000A2D] py-2 rounded-lg"
                  value={selectedState}
                  onChange={handleStateChange}
                  disabled={!selectedCountry} // Disable if no country is selected
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
                  <p className="px-2 w-[15%] text-center py-2 bg-[#000A2D] rounded-lg">{countryCode||"+91"}</p>
                  <input
                    type="number"
                    placeholder="Whatsapp Number*"
                    className="w-[85%] bg-[#000A2D] py-2 rounded-lg px-3"
                  />
                </div>

                <input
                  type="email"
                  placeholder="G-Mail Id*"
                  className="w-full bg-[#000A2D] py-2 rounded-lg px-3"
                />
                <input
                  type="email"
                  placeholder="Re-enter G-Mail Id"
                  className="w-full bg-[#000A2D] py-2 rounded-lg px-3"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Payment Information */}
        <div className="sm:w-[40%] w-full bg-[#72A3FD] rounded-2xl  p-5">
          <h5 className="text-primary font-bold text-xl">Payment Information</h5>

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
              <p className="md:text-base text-sm font-normal">Get Instant Access Now</p>
            </div>
            <div className="flex items-center gap-3">
              <img src={doc} alt="" className="md:w-6 w-4 md:h-6 h-4" />
              <p className="md:text-base text-sm font-normal">Watch Tutorials Inside</p>
            </div>
            <div className="flex items-center gap-3">
              <img src={play} alt="" className="md:w-6 w-4 md:h-6 h-4" />
              <p className="md:text-base text-sm font-normal">View All Strategies</p>
            </div>
            <div className="flex items-center gap-3">
              <img src={shild} alt="" className="md:w-6 w-4 md:h-6 h-4" />
              <p className="md:text-base text-sm font-normal">Prepare For Tomorrow</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-black">
            <input type="checkbox" className="w-4 h-4" name="TandC" />
            <label htmlFor="TandC" className="md:text-xl text-xs">I agree with terms & Condition</label>
          </div>
          <img src={pay} alt="" className="w-4/5 cursor-pointer mt-5 mx-auto" />
        </div>
      </div>
    </>
  );
};

export default BuyPlanPage;
