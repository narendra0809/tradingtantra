import mongoose from "mongoose";

const TradDateSchema = new mongoose.Schema({
  dateRange: {
    type: String,
    enum: ["long", "short"],
    required: true,
  },
  entryDate: {
    type: Date,
    required: true,
  },
  exitDate: {
    type: Date,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  entryPrice: {
    type: Number,
    required: true,
  },
  exitPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  profitLossPercentage: {
    type: Number,
    required: true,
  },
  totalProfitOrLoss: {
    type: Number,
    required: true,
  },
  img: {
    type: String,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const TradDate = mongoose.model("TradDate", TradDateSchema);
export default TradDate;
