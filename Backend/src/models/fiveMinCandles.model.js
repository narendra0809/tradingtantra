import mongoose from "mongoose";

const fiveMinCandlesSchema = new mongoose.Schema({
  securityId: { type: String, required: true },
 timestamp:[String],
    open: [Number],
    high: [Number],
    low: [Number],
    close: [Number],
});

const FiveMinCandles = mongoose.model("FiveMinCandles", fiveMinCandlesSchema);
export default FiveMinCandles;