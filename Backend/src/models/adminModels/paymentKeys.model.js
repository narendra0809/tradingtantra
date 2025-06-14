import mongoose from "mongoose";

const PaymentKeysSchema = new mongoose.Schema(
  {
    key_id: {
      type: String,
      required: true,
    },
    key_secret: {
      type: String,
      required: true,
    },
    webhook: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const PaymentKey = mongoose.model("paymentkey", PaymentKeysSchema);
export default PaymentKey;
