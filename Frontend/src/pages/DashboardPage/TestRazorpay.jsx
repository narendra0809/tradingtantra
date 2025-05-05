import React from "react";
import axios from "axios";

const TestRazorpay = () => {

  const SERVER_URI = import.meta.env.VITE_SERVER_URI;
  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `${SERVER_URI}/payment/createorder`,
        { planId: "67c5a9539a4c8ca255e18061" },
        {
          withCredentials: true,
        }
      );

      if (!res) {
        return console.log("error in creating order", res);
      }

      const data = res?.data?.data;

      console.log(data);

      const options = {
        key: "rzp_test_zW8cLqielgxUNc",
        amount: data.amount,
        currency: "INR",

        name: "Trading-Tantra",
        order_id: data.orderId,
        description: "Test Transaction",
        handler: async (response) => {
          console.log("lrresponse", response);

          await axios.post(
            `${SERVER_URI}/payment/verify-payment`,
            {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              razorpay_order_id: response.razorpay_order_id,
              planId: "67c5a9539a4c8ca255e18061",
            }
          );
        },
        prefill: {
          name: "Gaurav Kumar",
          email: "oTt6y@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.log("error in test page", error);
    }
  };

  return (
    <div>
      <button onClick={handleSubmit} value={1999}>
        pay
      </button>
    </div>
  );
};

export default TestRazorpay;
