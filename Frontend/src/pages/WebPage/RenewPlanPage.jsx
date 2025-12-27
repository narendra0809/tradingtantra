/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import lock from "../../assets/Images/lock.svg";
import play from "../../assets/Images/play.svg";
import doc from "../../assets/Images/doc.svg";
import shild from "../../assets/Images/shild.svg";
import { useRazorpay } from "react-razorpay";
import useFetchData from "../../utils/useFetchData";

const RenewPlanPage = ({ setShowRenewModal, onPaymentSuccess }) => {
  const { Razorpay } = useRazorpay();
  const { fetchData } = useFetchData();

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [selectedState, setSelectedState] = useState("");

  // 🔥 Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [couponPercent, setCouponPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [isCouponApplied, setIsCouponApplied] = useState(false);

  // ---------------- COUNTRY / STATE ----------------
  useEffect(() => {
    const fetchCountries = async () => {
      const res = await axios.get(
        "https://countriesnow.space/api/v0.1/countries"
      );
      setCountries(res.data.data || []);
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      if (!selectedCountry) return;
      const res = await axios.post(
        "https://countriesnow.space/api/v0.1/countries/states",
        { country: selectedCountry }
      );
      setStates(res.data.data?.states || []);
    };
    fetchStates();
  }, [selectedCountry]);

  // ---------------- COUPON VERIFY ----------------
  const handleApplyCoupon = async () => {
    setCouponError("");
    setCouponMsg("");
    setCouponPercent(0);
    setIsCouponApplied(false);

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
      setIsCouponApplied(true);
    } catch {
      setCouponError("Invalid or expired coupon");
    }
  };

  // ---------------- PAYMENT ----------------
  const handlePayment = async () => {
    if (!selectedCountry || !selectedState) return;

    try {
      // 🔑 IMPORTANT LOGIC
      // Coupon only sent if it was APPLIED successfully
      const payload = {
        couponCode: isCouponApplied ? couponCode.trim() : null,
      };

      const res = await fetchData(
        `payment/createorder?renew=${true}`,
        "POST",
        payload
      );

      if (res.status !== 200) throw new Error("Order creation failed");

      const data = res.data;

      const options = {
        key: data.key,
        amount: data.data.amount, // backend-decided
        currency: "INR",
        name: "Trading Tantra",
        description: "Renew Subscription",
        order_id: data.data.orderId,
        handler: async (response) => {
          const verify = await fetchData(
            `payment/verify-payment?renew=${true}`,
            "POST",
            response
          );

          if (!verify?.data?.success) return;

          await fetchData("payment/renew-plan", "POST");
          setShowRenewModal(false);
          onPaymentSuccess();
        },
        theme: { color: "#F37254" },
      };

      new Razorpay(options).open();
    } catch (err) {
      console.log("Payment error:", err.message);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="xl:w-[70%] w-[90%] mx-auto bg-gray-50 dark:bg-[#020417] px-8 py-8 space-y-10 rounded-2xl">
      <div className="flex justify-between">
        <div className="space-y-3">
          <h3 className="text-3xl font-bold dark:text-white">Renew Plan</h3>
          <p className="bg-primary px-4 py-2 rounded text-white text-xl">
            DIAMOND (₹3999)
          </p>
        </div>
        <p className="text-xl dark:text-white">Validity: 365 Days</p>
      </div>

      {/* Country & State */}
      <div className="flex gap-5">
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="w-1/2 px-4 py-2 rounded bg-gray-100 dark:bg-[#000A2D] dark:text-white"
        >
          {countries.map((c, i) => (
            <option key={i} value={c.country}>
              {c.country}
            </option>
          ))}
        </select>

        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="w-1/2 px-4 py-2 rounded bg-gray-100 dark:bg-[#000A2D] dark:text-white"
        >
          <option value="">Select State</option>
          {states.map((s, i) => (
            <option key={i} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* 🔥 Coupon Section */}
      <div>
        <p className="mb-2 text-sm dark:text-white">Have a coupon?</p>

        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            disabled={isCouponApplied}
            onChange={(e) => {
              setCouponCode(e.target.value.toUpperCase());
              setCouponError("");
              setCouponMsg("");
            }}
            placeholder="Enter coupon code"
            className="flex-1 px-3 py-2 rounded bg-white dark:bg-[#000A2D] dark:text-white disabled:opacity-60"
          />

          <button
            type="button"
            onClick={handleApplyCoupon}
            disabled={isCouponApplied}
            className="px-4 py-2 bg-primary text-white rounded disabled:opacity-60"
          >
            Apply
          </button>
        </div>

        {couponError && (
          <p className="text-red-500 text-xs mt-1">{couponError}</p>
        )}
        {couponMsg && (
          <p className="text-green-600 text-xs mt-1">{couponMsg}</p>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-5">
        {[lock, doc, play, shild].map((icon, i) => (
          <div key={i} className="flex gap-3 items-center">
            <img src={icon} className="w-8 h-8" />
            <p className="dark:text-white">Premium Access</p>
          </div>
        ))}
      </div>

      <button
        onClick={handlePayment}
        className="w-full bg-primary text-white py-4 rounded-xl text-xl"
      >
        Click to Continue
      </button>
    </div>
  );
};

export default RenewPlanPage;
