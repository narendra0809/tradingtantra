import crypto from "crypto";
import { razorpayInstance } from "../config/razorpayInstance.js";
import Payment from "../models/payment.model.js";
import UserSubscription from "../models/userSubscription.model.js";
import UserOrders from "../models/userOrders.model.js";

const createOrder = async (req, res) => {
  const renew = req.query.renew === "true";
  if (!renew) {
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
      res
        .status(401)
        .json({ success: false, message: "Missing required detials" });
    }
    await UserOrders.create({
      userId: req.user._id,
      firstName,
      lastName,
      email,
      phoneNumber,
      country,
      state,
    });
  }

  const options_order = { amount: 3999 * 100, currency: "INR" };
  try {
    const order = await razorpayInstance.orders.create(options_order);
    if (!order) {
      return res
        .status(500)
        .json({ success: false, message: "order not created" });
    }

    const payment = new Payment({
      userId: req.user._id,
      amount: order.amount / 100,
      currency: order.currency,
      orderId: order.id,
      status: order.status,
    });

    await payment.save();

    res
      .status(200)
      .json({ success: true, data: payment, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const renew = req.query.renew === "true";
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
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
    if (!renew) {
      const userSubscription = new UserSubscription({
        userId: transaction.userId,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        status: "active",
        paymentId: transaction._id,
      });
      await UserSubscription.create(userSubscription);
    }
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

const renewPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      res.status(401).send("User id not found !");
    }
    const userSub = await UserSubscription.findOne({ userId });
    if (!userSub) {
      res.status(401).send("No subscription found !");
    }
    const expiryDate = userSub.endDate.toISOString().split("T")[0];
    const newExpiry = calculateNewSubscriptionExpiry(expiryDate);
    const updatedSub = await UserSubscription.findByIdAndUpdate(
      userSub._id,
      {
        endDate: newExpiry,
      },
      { new: true }
    );
    if (!updatedSub) {
      res
        .status(401)
        .json({ success: false, message: "Subscription updation failed !" });
    }
    res.status(200).json({ success: true, updatedSub });
  } catch (error) {
    console.log(error);
  }
};

function calculateNewSubscriptionExpiry(userSubsExpiry) {
  const expiryDate = new Date(userSubsExpiry);
  const today = new Date();

  const remainingMs = Math.max(0, expiryDate - today);
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

  const newExpiry = new Date(today);
  newExpiry.setDate(newExpiry.getDate() + remainingDays + 365);
  return newExpiry;
}

export { createOrder, verifyPayment, renewPlan };
