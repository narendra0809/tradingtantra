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
    firstCandleLow: { type: Number, required: true },
    firstCandleHigh: { type: Number, required: true },
    currentCandleClose: { type: Number, required: true },
    firstCandleRange: { type: String, required: true },
    timestamp: { type: String, required: true },
    date: { type: Date, required: true }, // Added date field
  },
  { timestamps: true }
);

// Create an index for efficient querying and to avoid duplicates
DailyRangeBreakoutSchema.index({ securityId: 1, date: 1, type: 1 }, { unique: true });

const DailyRangeBreakouts = mongoose.model("DailyRangeBreakouts", DailyRangeBreakoutSchema);

export default DailyRangeBreakouts;