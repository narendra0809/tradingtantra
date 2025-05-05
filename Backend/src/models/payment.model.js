import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
       
    },
    userSubscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserSubscription",
    },
    amount: { type: Number, required: true },
    currency: { type: String, required: true ,default:"INR"},
    paymentDate: { type: Date, default: Date.now },
    transactionId: { type: String, },
    orderId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed","created"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
