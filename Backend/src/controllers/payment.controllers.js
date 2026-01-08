import crypto from "crypto";
import { razorpayInstance } from "../config/razorpayInstance.js";
import Payment from "../models/payment.model.js";
import UserOrders from "../models/userOrders.model.js";
import Coupons from "../models/adminModels/coupon.model.js";
import UserSubscription from "../models/userSubscription.model.js";
import { getRazorpayTokens } from "../utils/getTokens.js";

export const createOrder = async (req, res) => {
  try {
    const isRenewal = req.query.renew === "true";
    const userId = req.user._id;

    const BASE_AMOUNT = 1999;
    let finalAmount = BASE_AMOUNT;

    // ================= COUPON LOGIC =================
    const { couponCode } = req.body;

    const normalizedCouponCode = couponCode
      ? couponCode.trim().toUpperCase()
      : null;

    if (normalizedCouponCode) {
      const coupon = await Coupons.findOne({
        code: normalizedCouponCode,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired coupon",
        });
      }

      finalAmount =
        BASE_AMOUNT - (BASE_AMOUNT * coupon.discountPercent) / 100;
    }

    finalAmount = Math.round(finalAmount);
    // =================================================

    // ================= EXISTING FLOW =================
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
        return res.status(400).json({
          success: false,
          message: "Missing required details",
        });
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
        return res.status(400).json({
          success: false,
          message: "No subscription to renew",
        });
      }
    }
    // =================================================

    // ================= RAZORPAY =================
    const orderOptions = {
      amount: finalAmount * 100,
      currency: "INR",
      notes: {
        isRenewal: isRenewal.toString(),
        userId: userId.toString(),
      },
    };

    const order = await razorpayInstance.orders.create(orderOptions);

    const payment = new Payment({
      userId,
      amount: order.amount / 100,
      currency: order.currency,
      orderId: order.id,
      status: "created",
    });

    await payment.save();

    const tokens = await getRazorpayTokens();

    return res.status(200).json({
      success: true,
      data: payment,
      key: tokens.RAZORPAY_KEY_ID,
    });
    // =================================================
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= VERIFY PAYMENT =================
export const verifyPayment = async (req, res) => {
  try {
    console.log("🔍 Verifying payment...");
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      console.error("❌ Missing verification fields");
      return res.status(400).json({
        success: false,
        message: "Missing verification fields",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("❌ Invalid payment signature");
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // Find payment by orderId
    const payment = await Payment.findOne({ orderId: razorpay_order_id });
    if (!payment) {
      console.error("❌ Payment not found for orderId:", razorpay_order_id);
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Check if payment is already verified
    if (payment.status === "success") {
      console.log("✅ Payment already verified");
      // Check if subscription exists, if not create it (fallback in case webhook failed)
      const userId = payment.userId;
      let userSubscription = await UserSubscription.findOne({ userId });

      if (!userSubscription) {
        console.log("⚠️ Subscription not found, creating fallback subscription...");
        userSubscription = new UserSubscription({
          userId,
          startDate: new Date(),
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ),
          status: "active",
          paymentId: payment._id,
        });
        await userSubscription.save();
        payment.userSubscriptionId = userSubscription._id;
        await payment.save();
        console.log("✅ Fallback subscription created");
      }

      return res.status(200).json({
        success: true,
        message: "Payment already verified",
      });
    }

    // Update payment status
    payment.status = "success";
    payment.transactionId = razorpay_payment_id;
    await payment.save();
    console.log("✅ Payment status updated to success");

    // Check if subscription exists, if not create it (fallback in case webhook hasn't fired yet)
    const userId = payment.userId;
    if (!userId) {
      console.error("❌ UserId not found in payment");
      return res.status(500).json({
        success: false,
        message: "UserId not found in payment",
      });
    }

    let userSubscription = await UserSubscription.findOne({ userId });
    const isRenewal = req.query.renew === "true";

    if (isRenewal) {
      if (!userSubscription) {
        console.error("❌ No subscription found for renewal");
        return res.status(400).json({
          success: false,
          message: "No subscription found for renewal",
        });
      }
      // Extend subscription
      const newEndDate = new Date(userSubscription.endDate);
      const today = new Date();
      const remainingMs = Math.max(0, newEndDate - today);
      const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
      const newExpiry = new Date(today);
      newExpiry.setDate(newExpiry.getDate() + remainingDays + 365);
      
      userSubscription.endDate = newExpiry;
      userSubscription.status = "active";
      userSubscription.paymentId = payment._id;
      console.log("🔄 Renewing subscription, new endDate:", newExpiry);
    } else {
      if (userSubscription && userSubscription.status === "active") {
        // Update existing subscription
        userSubscription.endDate = new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        );
        userSubscription.paymentId = payment._id;
        console.log("🔄 Updating existing subscription");
      } else {
        // Create new subscription
        if (userSubscription) {
          // Reactivate expired subscription
          userSubscription.startDate = new Date();
          userSubscription.endDate = new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          );
          userSubscription.status = "active";
          userSubscription.paymentId = payment._id;
          console.log("🔄 Reactivating expired subscription");
        } else {
          userSubscription = new UserSubscription({
            userId,
            startDate: new Date(),
            endDate: new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            ),
            status: "active",
            paymentId: payment._id,
          });
          console.log("✨ Creating new subscription");
        }
      }
    }

    await userSubscription.save();
    payment.userSubscriptionId = userSubscription._id;
    await payment.save();
    console.log("✅ Subscription updated/created successfully");

    return res.status(200).json({
      success: true,
      message: "Payment verified and subscription updated",
    });
  } catch (error) {
    console.error("❌ Verify payment error:", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ================= RENEW =================
export const renewPlan = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Use createOrder with renew=true for renewals",
  });
};
