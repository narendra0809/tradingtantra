import mongoose from "mongoose";

const dailyCandleReversalSchema = new mongoose.Schema(
  {
    securityId: { type: String, required: true, unique: true },
    fstPreviousDayChange: { type: Number, required: true },
    persentageChange: { type: Number, required: true },
    trend: {
      type: String,
      enum: ["BULLISH", "BEARISH"],
      required: true,
    },
    UNDERLYING_SYMBOL: { type: String, required: true },
    SYMBOL_NAME: { type: String, required: true },
    timestamp: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const DailyCandleReversalModel = mongoose.model(
  "DailyCandleReversalModel",
  dailyCandleReversalSchema
);

export default DailyCandleReversalModel;
