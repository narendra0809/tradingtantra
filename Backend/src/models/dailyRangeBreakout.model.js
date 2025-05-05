import mongoose from "mongoose";

const DailyRangeBreakoutSchema = new mongoose.Schema(
  {
    securityId: {
      type: String,
      required: true,
      index: true, // Index for faster lookups
    },
    type: {
      type: String,
      enum: ["Bullish", "Bearish"],
      required: true,
    },
    stockSymbol: {
      type: String,
      required: true,
      default: "N/A",
    },
    stockName: {
      type: String,
      required: true,
      default: "N/A",
    },
    lastTradePrice: {
      type: String,
      required: true,
      default: 0,
    },
    previousClosePrice: {
      type: String,
      required: true,
      default: 0,
    },
    percentageChange: {
      type: String,
      required: true,
      default: 0,
    },
    rangeHigh: {
      type: String,
      required: false, // Optional, but useful for reference
    },
    rangeLow: {
      type: String,
      required: false, // Optional, but useful for reference
    },
    todayHigh: {
      type: String,
      required: false, // Optional, but useful for reference
    },
    todayLow: {
      type: String,
      required: false, // Optional, but useful for reference
    },
    timestamp: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// Create the model
const DailyRangeBreakouts = mongoose.model(
  "DailyRangeBreakout",
  DailyRangeBreakoutSchema
);

export default DailyRangeBreakouts;
