import mongoose from "mongoose";

const stocksWithWeightageSchema = new mongoose.Schema(
  {
    SECURITY_ID: { type: String, trim: true },
    UNDERLYING_SYMBOL: { type: String, trim: true },
    SYMBOL_NAME: { type: String, trim: true },
    DISPLAY_NAME: { type: String, trim: true },
    SECTOR: { type: [String], trim: true },
    INDEX: { type: [String], trim: true },
    WEIGHTAGE: {
      type: [String],
      trim: true,
    },
  },
  { timestamps: true }
);

const StockWithWeightage = mongoose.model(
  "stockdetails1",
  stocksWithWeightageSchema
);
export default StockWithWeightage;
