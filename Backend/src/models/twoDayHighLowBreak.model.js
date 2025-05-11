import mongoose from "mongoose";

const twoHLBreakSchema = new mongoose.Schema(
    
    {
    securityId: { type: String, required: true },
    symbolName: { type: String, required: true },
    underlyingSymbol: { type: String, required: true },
    type: { type: String, required: true, enum: ["Bullish", "Bearish"] },
    breakPrice: { type: Number, required: true },
    maxHigh: { type: Number },
    minLow: { type: Number },
    timestamp: { type: String, required: true },
    percentageChange: { type: Number },
    date: { type: String, required: true },
  },
  { timestamps: true }
)

const TwoDayHighLowBreak = mongoose.model('TwoDayHighLowBreak',twoHLBreakSchema)
export default TwoDayHighLowBreak