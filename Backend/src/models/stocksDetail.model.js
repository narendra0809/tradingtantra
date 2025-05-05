import mongoose from "mongoose";

const stocksDetailSchema = new mongoose.Schema(
  {
    SECURITY_ID: { type: String, trim: true },
    UNDERLYING_SYMBOL: { type: String, trim: true },
    SYMBOL_NAME: { type: String, trim: true },
    DISPLAY_NAME: { type: String, trim: true },
    SECTOR:{ type: [String], trim: true },
    INDEX:{ type: [String], trim: true },

  },
  { timestamps: true }
);

const StocksDetail = mongoose.model("StockDetail", stocksDetailSchema);
export default StocksDetail;
