import mongoose from "mongoose";

const tenDayRangeBreakerSchema = new mongoose.Schema(
  {
    securityId: { type: String, required: true, unique: true },
    UNDERLYING_SYMBOL: { type: String, required: true },
    SYMBOL_NAME: { type: String, required: true },
    todayHigh: { type: Number, required: true },
    todayLow: { type: Number, required: true },
    todayLatestTradedPrice: { type: Number, required: true },
    preTenDaysHigh: { type: Number, required: true },
    preTenDaysLow: { type: Number, required: true },
    persentageChange: { type: Number, required: true },
    type: { type: String, enum: ["bullish", "bearish"], required: true },
    timestamp: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const TenDayRangeBreakerModel = mongoose.model(
  "TenDayRangeBreakerModel",
  tenDayRangeBreakerSchema
);

export default TenDayRangeBreakerModel;
