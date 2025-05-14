import mongoose from "mongoose";

const DailyRangeBreakoutSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["Bullish", "Bearish"],
    },
    securityId: { type: String, required: true },
    stockSymbol: { type: String, required: true },
    stockName: { type: String, required: true },
    lastTradePrice: { type: Number, required: true },
    percentageChange: { type: String, required: true },
    firstCandleLow: { type: Number, required: true },  // Fixed typo
    firstCandleHigh: { type: Number, required: true }, // Fixed typo
    currentCandleClose: { type: Number, required: true }, // Fixed typo
    firstCandleRange: { type: String, required: true }, // Fixed typo
    timestamp: { type: String, required: true },
  },
  { timestamps: true }
);

const DailyRangeBreakouts = mongoose.model(
  "DailyRangeBreakouts",
  DailyRangeBreakoutSchema
);

export default DailyRangeBreakouts;