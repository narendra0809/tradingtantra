/* eslint-disable react/prop-types */
import { useState } from "react";
import { useRazorpay } from "react-razorpay";

import lock from "../../assets/Images/lock.svg";
import play from "../../assets/Images/play.svg";
import doc from "../../assets/Images/doc.svg";
import shild from "../../assets/Images/shild.svg";

import indiaStates from "../../utils/indiaStates";
import useFetchData from "../../utils/useFetchData";

const RenewPlanPage = ({ setShowRenewModal, onPaymentSuccess }) => {
  const { Razorpay } = useRazorpay();
  const { fetchData } = useFetchData();

  // ---------------- LOCATION ----------------
  const [selectedCountry] = useState("India");
  const [selectedState, setSelectedState] = useState("");

  // ---------------- COUPON ----------------
  const [couponCode, setCouponCode] = useState("");
  const [couponPercent, setCouponPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [isCouponApplied, setIsCouponApplied] = useState(false);

  // ---------------- APPLY COUPON ----------------
  const handleApplyCoupon = async () => {
    setCouponError("");
    setCouponMsg("");
    setCouponPercent(0);
    setIsCouponApplied(false);

    if (!couponCode.trim()) {
      setCouponError("Please enter coupon code");
      return;
    }

    try {
      const res = await fetchData(
        `verify-coupon?code=${encodeURIComponent(couponCode.trim())}`,
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
    if (!selectedState) {
      alert("Please select state");
      return;
    }

    try {
      const payload = {
        couponCode: isCouponApplied ? couponCode.trim() : null,
      };

      const res = await fetchData(
        `payment/createorder?renew=true`,
        "POST",
        payload
      );

      if (res.status !== 200) throw new Error("Order creation failed");

      const data = res.data;

      const options = {
        key: data.key,
        amount: data.data.amount,
        currency: "INR",
        name: "Trading Tantra",
        description: "Renew Subscription",
        order_id: data.data.orderId,
        handler: async (response) => {
          const verify = await fetchData(
            `payment/verify-payment?renew=true`,
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
    <div className="xl:w-[70%] w-[95%] sm:w-[90%] md:w-[85%] mx-auto bg-gray-50 dark:bg-[#020417] px-4 sm:px-5 md:px-6 lg:px-8 py-5 sm:py-6 md:py-8 space-y-5 sm:space-y-6 md:space-y-8 lg:space-y-10 rounded-xl sm:rounded-2xl">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
        <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
          <h3 className="text-2xl sm:text-2xl md:text-3xl font-bold dark:text-white">Renew Plan</h3>
          <p className="bg-primary px-3 sm:px-3.5 md:px-4 py-1.5 sm:py-2 rounded text-white text-base sm:text-base md:text-lg lg:text-xl inline-block">
            DIAMOND (₹1999)
          </p>
        </div>
        <p className="text-base sm:text-base md:text-lg lg:text-xl dark:text-white self-start sm:self-center">Validity: 365 Days</p>
      </div>

      {/* COUNTRY & STATE */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5">
        <select
          value={selectedCountry}
          disabled
          className="w-full sm:w-1/2 px-3 sm:px-3.5 md:px-4 py-2.5 sm:py-2 rounded text-sm sm:text-sm md:text-base bg-gray-100 dark:bg-[#000A2D] dark:text-white cursor-not-allowed opacity-80"
        >
          <option value="India">India</option>
        </select>

        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="w-full sm:w-1/2 px-3 sm:px-3.5 md:px-4 py-2.5 sm:py-2 rounded text-sm sm:text-sm md:text-base bg-gray-100 dark:bg-[#000A2D] dark:text-white"
        >
          <option value="">Select State</option>
          {indiaStates.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      {/* COUPON */}
      <div>
        <p className="mb-2 text-xs sm:text-xs md:text-sm dark:text-white">Have a coupon?</p>

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
            className="flex-1 px-3 sm:px-3.5 md:px-4 py-2.5 sm:py-2 rounded text-sm sm:text-sm md:text-base bg-white dark:bg-[#000A2D] dark:text-white disabled:opacity-60"
          />

          <button
            type="button"
            onClick={handleApplyCoupon}
            disabled={isCouponApplied}
            className="px-3 sm:px-3.5 md:px-4 py-2.5 sm:py-2 bg-primary text-white text-sm sm:text-sm md:text-base rounded disabled:opacity-60 whitespace-nowrap hover:opacity-90 transition-opacity cursor-pointer relative z-10"
            style={{ pointerEvents: isCouponApplied ? "none" : "auto" }}
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

      {/* FEATURES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
        {[lock, doc, play, shild].map((icon, i) => (
          <div key={i} className="flex gap-2 sm:gap-2.5 md:gap-3 items-center">
            <img src={icon} className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex-shrink-0" />
            <p className="text-sm sm:text-sm md:text-base dark:text-white">Premium Access</p>
          </div>
        ))}
      </div>

      {/* PAY */}
      <button
        onClick={handlePayment}
        className="w-full bg-primary text-white py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl text-base sm:text-base md:text-lg lg:text-xl font-semibold hover:opacity-90 transition-opacity"
      >
        Click to Continue
      </button>
    </div>
  );
};

export default RenewPlanPage;
