import mongoose from "mongoose";

const tenMinCandlesSchema = new mongoose.Schema({
    securityId: { type: String, required: true },
    timestamp:[String],
    open: [Number],
    high: [Number],
    low: [Number],
    close: [Number],

});

const TenMinCandles = mongoose.model("TenMinCandles", tenMinCandlesSchema);
export default TenMinCandles;
