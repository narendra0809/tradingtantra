import mongoose from "mongoose";

const OhlcStockSchema = new mongoose.Schema(
  {
    securityId: { type: String },
    last_price: { type: Number, required: true }, // Latest traded price
    ohlc: {
      open: { type: Number, required: true },
      close: { type: Number, required: true },
      high: { type: Number, required: true },
      low: { type: Number, required: true },
    },
  },
  { timestamps: true }
);


const OhlcStocks = mongoose.model("OhlcStock", OhlcStockSchema);
export default OhlcStocks;