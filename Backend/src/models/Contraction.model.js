import mongoose from "mongoose";

const ContractionSchema = new mongoose.Schema(
  {
    securityId: { type: String, required: true, unique: true },
    UNDERLYING_SYMBOL: { type: String, required: true },
    SYMBOL_NAME: { type: String, required: true },
    percentageChange: { type: String },
    timestamp: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const ContractionModel = mongoose.model("AIContraction", ContractionSchema);

export default ContractionModel;
