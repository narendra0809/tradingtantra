import crypto from "crypto";
import Payment from "../models/payment.model.js";
import UserSubscription from "../models/userSubscription.model.js";

export const razporpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET;
    const body = JSON.stringify(req.body);

    const signature = req.headers["x-razorpay-signature"];

    //  console.log('signature', signature);

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature for webhook",
      });
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;

    // console.log("webhook event recieved", event);
    // console.log('payment entity', paymentEntity)

    if (event === "payment.captured") {
      const payment = await Payment.findOneAndUpdate(
        { orderId: paymentEntity.order_id },
        {
          status: "success",
          transactionId: paymentEntity.id,
        },
        { new: true }
      );

      console.log('payment on succes', payment)

      if (payment) {
      await UserSubscription.findOneAndUpdate(
          { paymentId: payment._id },
          { status: "active" },
          { new: true }
        );
        // console.log('user subscription updated',userSubscription)
      } else {
        console.log('payment not found')
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }
    } else if (event === "payment.failed") {
       await Payment.findOneAndUpdate(
        {orderId: paymentEntity.order_id },
        {
          status: "failed",
        }   
      );
    //   console.log('payment on failed', payment)
    }

    return res.status(200).json({ success: true, message: "webhook recieved" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
