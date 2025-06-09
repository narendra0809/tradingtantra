import mongoose from "mongoose";

const IndexCandlesSchema = new mongoose.Schema(
  {
    indexName: { type: String, required: true },
    securityId: { type: String },
    interval: { type: String, required: true },
    open: { type: Number, required: true },
    high: { type: Number, required: true },
    low: { type: Number, required: true },
    close: { type: Number, required: true },
    lastClose: { type: Number },
    timestamp: { type: String, required: true },
  },
  { timestamps: true }
);

const IndexCandles = mongoose.model("indexcandles", IndexCandlesSchema);
export default IndexCandles;
