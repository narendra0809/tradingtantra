import mongoose from "mongoose";

const highLowReversalSchema = new mongoose.Schema(
  {
    securityId: { type: String, required: true },
    symbolName: { type: String, required: true },
    underlyingSymbol: { type: String, required: true },
    type: { type: String, required: true, enum: ["Bullish", "Bearish"] },
    reversalPrice: { type: Number, required: true },
    dayHigh: { type: Number },
    dayLow: { type: Number },
    timestamp: { type: String, required: true },
    percentageChange: { type: Number }, // Changed to Number
    date: { type: String, required: true },
  },
  { timestamps: true }
);

const HighLowReversal = mongoose.model(
  "HighLowReversal",
  highLowReversalSchema
);

export default HighLowReversal;
