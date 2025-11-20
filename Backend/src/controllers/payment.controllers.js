import crypto from "crypto";
import { razorpayInstance } from "../config/razorpayInstance.js";
import Payment from "../models/payment.model.js";
import UserOrders from "../models/userOrders.model.js";
import UserSubscription from "../models/userSubscription.model.js";

export const createOrder = async (req, res) => {
  try {
    const isRenewal = req.query.renew === "true";
    const userId = req.user._id;

    if (!isRenewal) {
      const { firstName, lastName, email, phoneNumber, country, state } =
        req.body;
      if (
        !firstName ||
        !lastName ||
        !email ||
        !phoneNumber ||
        !country ||
        !state
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required details" });
      }
      await UserOrders.create({
        userId,
        firstName,
        lastName,
        email,
        phoneNumber,
        country,
        state,
      });
    } else {
      const existingSub = await UserSubscription.findOne({ userId });
      if (!existingSub) {
        return res
          .status(400)
          .json({ success: false, message: "No subscription to renew" });
      }
    }

    const orderOptions = {
      amount: 3999 * 100,
      currency: "INR",
      notes: { isRenewal: isRenewal.toString(), userId: userId.toString() },
    };
    console.log(JSON.stringify(orderOptions));
    const order = await razorpayInstance.orders.create(orderOptions);
    console.log(JSON.stringify(order));

    const payment = new Payment({
      userId,
      amount: order.amount / 100,
      currency: order.currency,
      orderId: order.id,
      status: "created",
    });
    await payment.save();

    return res.status(200).json({
      success: true,
      data: payment,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message, stack: error?.stack });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Missing verification fields" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }
    return res.status(200).json({
      success: true,
      message: "Payment verified (processing in background)",
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const renewPlan = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Use createOrder with renew=true for renewals",
  });
};
