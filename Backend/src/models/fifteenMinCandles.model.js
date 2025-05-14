import mongoose from "mongoose";

const fifteenMinCandlesSchema = new mongoose.Schema({
  securityId: { type: String, required: true },
 timestamp:[String],
    open: [Number],
    high: [Number],
    low: [Number],
    close: [Number],
});

const FifteenMinCandles = mongoose.model("FifteenMinCandles", fifteenMinCandlesSchema);
export default FifteenMinCandles;