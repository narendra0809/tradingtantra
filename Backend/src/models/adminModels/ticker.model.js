import mongoose from "mongoose";

const TickerSchema = new mongoose.Schema(
  {
    proName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Ticker = mongoose.model("ticker", TickerSchema);
export default Ticker;
