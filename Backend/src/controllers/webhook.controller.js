import crypto from "crypto";
import Payment from "../models/payment.model.js";
import UserSubscription from "../models/userSubscription.model.js";
import User from "../models/user.model.js";

export const razorpayWebhook = async (req, res) => {
  try {
    console.log("🔔 Webhook received:", {
      event: req.body?.event,
      orderId: req.body?.payload?.payment?.entity?.order_id,
      timestamp: new Date().toISOString(),
    });

    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("❌ Webhook secret not configured");
      throw new Error("Webhook secret not configured");
    }

    const body = JSON.stringify(req.body);
    const signature = req.headers["x-razorpay-signature"];

    if (!signature) {
      console.error("❌ Missing webhook signature");
      return res
        .status(400)
        .json({ success: false, message: "Missing webhook signature" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("❌ Invalid webhook signature");
      return res
        .status(400)
        .json({ success: false, message: "Invalid webhook signature" });
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;
    const orderId = paymentEntity.order_id;

    console.log("✅ Webhook signature verified, processing event:", event);

    // Find the payment (idempotency: prevent duplicate processing)
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      console.error("❌ Payment not found for orderId:", orderId);
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    if (payment.status === "success" || payment.status === "failed") {
      // Already processed (idempotent)
      console.log("ℹ️ Webhook already processed for orderId:", orderId);
      return res
        .status(200)
        .json({ success: true, message: "Webhook already processed" });
    }

    if (event === "payment.captured") {
      console.log("💰 Payment captured, updating subscription...");

      // Update payment status
      payment.status = "success";
      payment.transactionId = paymentEntity.id;
      await payment.save();
      console.log("✅ Payment status updated to success");

      // Check if it's a renewal via notes
      const isRenewal = paymentEntity.notes?.isRenewal === "true";
      const userId = paymentEntity.notes?.userId || payment.userId; // Fallback to stored userId

      if (!userId) {
        console.error("❌ UserId not found in payment or notes");
        throw new Error("UserId not found");
      }

      console.log("👤 Processing subscription for userId:", userId, "isRenewal:", isRenewal);

      let userSubscription = await UserSubscription.findOne({ userId });

      if (isRenewal) {
        if (!userSubscription) {
          // Edge case: Renewal but no existing subscription
          console.error("❌ No subscription found for renewal, userId:", userId);
          throw new Error("No subscription found for renewal");
        }
        // Extend endDate (add 1 year + remaining days)
        const newEndDate = calculateNewSubscriptionExpiry(
          userSubscription.endDate
        );
        userSubscription.endDate = newEndDate;
        userSubscription.status = "active";
        userSubscription.paymentId = payment._id;
        console.log("🔄 Renewing subscription, new endDate:", newEndDate);
      } else {
        if (userSubscription && userSubscription.status === "active") {
          // Edge case: User already has an active subscription
          console.warn("⚠️ User already has active subscription, userId:", userId);
          // Don't throw error, just update the existing subscription
          userSubscription.endDate = new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          );
          userSubscription.status = "active";
          userSubscription.paymentId = payment._id;
        } else {
          // New subscription or expired subscription renewal
          if (userSubscription) {
            // Update existing expired subscription
            userSubscription.startDate = new Date();
            userSubscription.endDate = new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            );
            userSubscription.status = "active";
            userSubscription.paymentId = payment._id;
            console.log("🔄 Reactivating expired subscription");
          } else {
            // New subscription
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
      console.log("✅ UserSubscription saved successfully");

      // Update payment with subscription reference
      payment.userSubscriptionId = userSubscription._id;
      await payment.save();

      console.log("🎉 Payment and subscription updated successfully for userId:", userId);
    } else if (event === "payment.failed") {
      console.log("❌ Payment failed for orderId:", orderId);
      payment.status = "failed";
      await payment.save();
      // Optional: Notify user (e.g., email)
    }

    return res
      .status(200)
      .json({ success: true, message: "Webhook processed successfully" });
  } catch (error) {
    console.error("❌ Webhook error:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Internal server error" 
    });
  }
};

function calculateNewSubscriptionExpiry(currentEndDate) {
  const expiryDate = new Date(currentEndDate);
  const today = new Date();
  const remainingMs = Math.max(0, expiryDate - today);
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
  const newExpiry = new Date(today);
  newExpiry.setDate(newExpiry.getDate() + remainingDays + 365);
  return newExpiry;
}
