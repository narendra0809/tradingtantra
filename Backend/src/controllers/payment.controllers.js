import crypto from "crypto";
import { razorpayInstance } from "../config/razorpayInstance.js";
import Payment from "../models/payment.model.js";
import UserSubscription from "../models/userSubscription.model.js";
import Subscription from "../models/subscriptionPlan.model.js";

const createOrder = async (req, res) => {
  const { planId } = req.body;
  // console.log('planId',planId)
  const subscriptionPlan = await Subscription.findById(planId);

  // console.log(subscriptionPlan, "subscriptionPlan");

  if (!subscriptionPlan) {
    return res.status(404).json({ success: false, message: "Plan not found" });
  }

  const options = { amount: subscriptionPlan.price * 100, currency: "INR" };

  try {
    const order = await razorpayInstance.orders.create(options);
    // console.log( "order",order );

    if (!order) {
      return res
        .status(500)
        .json({ success: false, message: "order not created" });
    }

    const payment = new Payment({
      userId: req.user._id,
      amount: options.amount,
      currency: options.currency,
      orderId: order.id,
      status: order.status,
    });

    // console.log(payment, "payment");

    await payment.save();

    res
      .status(200)
      .json({ success: true, data: payment, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      planId,
    } = req.body;

    // console.log("bodu", req.body);

    if (
      !razorpay_payment_id &&
      !razorpay_order_id &&
      !razorpay_signature &&
      !planId
    ) {
      // console.log("in if", planId);
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification fields.",
      });
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

    const transaction = await Payment.findOne({ orderId: razorpay_order_id });
    // console.log("transaction", transaction);
    if (!transaction) {
      return res
        .status(400)
        .json({ success: false, message: "Transaction not found" });
    }

    transaction.transactionId = razorpay_payment_id;
    

    await transaction.save();

    const userSubscription = new UserSubscription({
      userId: transaction.userId,
      planId,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      status: "active",
      paymentId: transaction._id,
    });

    await userSubscription.save();

    res.status(200).json({
      success: true,
      message: "Payment verified, Subscription Activated!",
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: "Internal server error in verifying payment",
      error: error.message,
    });
  }
};

export { createOrder, verifyPayment };
