import mongoose from "mongoose";

const highLowReversalSchema = new mongoose.Schema(
  {
    securityId: {
      type: String,
      required: true,
    },
    stockSymbol: {
      type: String,
      default: "N/A",
      required: true,
    },
    stockName: {
      type: String,
      default: "N/A",
      required: true,
    },
    high: {
      type: [String],
      required: true,
    },
    low: {
      type: [String],
      required: true,
    },
    open: {
      type: [String],
      required: true,
    },
    close: {
      type: [String],
      required: true,
    },
    percentageChange:{
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["Bearish", "Bullish"],
      required: true,
    },
    dayHigh: {
      type: String,
      required: function () {
        return this.type === "Bearish"; // Required only for Bearish type
      },
    },
    timestamp: {
      type: String,
      required: true,
      
    },
    dayLow: {
      type: Number,
      required: function () {
        return this.type === "Bullish"; // Required only for Bullish type
      },
    },
  },
  { timestamps: true }
);

const HighLowReversal = mongoose.model(
  "HighLowReversal",
  highLowReversalSchema
);

export default HighLowReversal;
