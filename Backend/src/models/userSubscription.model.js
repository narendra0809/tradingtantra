import mongoose from "mongoose";

const userSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["active", "expired", "cancelled"],
    default: "active",
  },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
});

export const UserSubscription = mongoose.model(
  "UserSubscription",
  userSubscriptionSchema
);
export default UserSubscription;
