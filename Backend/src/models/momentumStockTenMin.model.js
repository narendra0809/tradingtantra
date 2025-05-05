import mongoose from "mongoose";
const momentumStockSchemaTenMin = new mongoose.Schema(
  {
    securityId: { type: String, required: true, unique: true },
    symbol_name: { type: String, required: true },
    symbol: { type: String, required: true },
    currentHigh: { type: Number, required: true },
    currentLow: { type: Number, required: true },
    previousHigh: { type: Number, required: true },
    previousLow: { type: Number, required: true },
    momentumType: {
      type: String,
      enum: ["Bullish", "Bearish"],
      required: true,
    },
    priceChange: { type: Number, required: true },
    percentageChange: { type: Number },
    sector: { type: [String], required: true }, // Array of strings
    index: { type: [String], required: true }, // Array of strings
    timestamp: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
); // Adds createdAt & updatedAt fields

const MomentumStockTenMin = mongoose.model(
  "MomentumStockTenMin",
  momentumStockSchemaTenMin
);

export default MomentumStockTenMin;
