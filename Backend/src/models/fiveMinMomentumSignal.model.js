import mongoose from "mongoose";

const IntradayReversalFiveMinSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["Bullish Reversal", "Bearish Reversal"],
    },
    securityId: {
      type: String,
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
      type: Number,
      required: true,
    },
    previousClosePrice: {
      type: Number,
      required: true,
    },
    percentageChange: {
      type: Number,
      required: true,
    },
    overAllPercentageChange:{type:String},
    timestamp: {
      type:String,
      required:true
    },
  },
  { timestamps: true }
);

const IntradayReversalFiveMin = mongoose.model(
  "IntradayReversalFiveMin",
  IntradayReversalFiveMinSchema
);

export default IntradayReversalFiveMin;
