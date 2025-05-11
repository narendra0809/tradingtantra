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
    previousClosePrice: { type: Number, required: true },
    percentageChange: { type: String, required: true },
    rangeHigh: { type: Number, required: true },
    rangeLow: { type: Number, required: true },
    todayHigh: { type: Number, required: true },
    todayLow: { type: Number, required: true },
    candleReturn: { type: String, required: true },
    timestamp: { type: String, required: true },
    breakoutTime: { type: String, required: true },
    date: { type: String, required: true }, // Add the `date` field
  },
  { timestamps: true }
);

const DailyRangeBreakouts = mongoose.model(
  "DailyRangeBreakouts",
  DailyRangeBreakoutSchema
);

export default DailyRangeBreakouts;