import crypto from "crypto";
import Payment from "../models/payment.model.js";
import UserSubscription from "../models/userSubscription.model.js";

export const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Webhook secret not configured");
    }

    const body = JSON.stringify(req.body);
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      res
        .status(400)
        .json({ success: false, message: "Invalid webhook signature" });
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;
    const orderId = paymentEntity.order_id;

    // Find the payment (idempotency: prevent duplicate processing)
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    if (payment.status === "success" || payment.status === "failed") {
      // Already processed (idempotent)
      return res
        .status(200)
        .json({ success: true, message: "Webhook already processed" });
    }

    if (event === "payment.captured") {
      // Update payment status
      payment.status = "success";
      payment.transactionId = paymentEntity.id;
      await payment.save();

      // Check if it's a renewal via notes
      const isRenewal = paymentEntity.notes?.isRenewal === "true";
      const userId = paymentEntity.notes?.userId || payment.userId; // Fallback to stored userId

      let userSubscription = await UserSubscription.findOne({ userId });

      if (isRenewal) {
        if (!userSubscription) {
          // Edge case: Renewal but no existing subscription
          throw new Error("No subscription found for renewal");
        }
        // Extend endDate (add 1 year + remaining days)
        const newEndDate = calculateNewSubscriptionExpiry(
          userSubscription.endDate
        );
        userSubscription.endDate = newEndDate;
        userSubscription.status = "active";
        userSubscription.paymentId = payment._id;
      } else {
        if (userSubscription) {
          // Edge case: User already has a subscription
          throw new Error("User already subscribed");
        }
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
      }
      await userSubscription.save();
    } else if (event === "payment.failed") {
      payment.status = "failed";
      await payment.save();
      // Optional: Notify user (e.g., email)
    }

    return res
      .status(200)
      .json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ success: false, message: error.message });
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
