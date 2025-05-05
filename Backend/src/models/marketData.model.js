import mongoose, { Mongoose } from "mongoose";

const MarketDataSchema = new mongoose.Schema(
  {
    securityId: String,
    turnover: {
      type: String,
    },
    xelement: Number,
    data: {
      responseCode: Number,
      latestTradedPrice: Number,
      lastTradedQty: Number,
      lastTradeTime: Number,
      avgTradePrice: Number,
      volume: Number,
      totalSellQty: Number,
      totalBuyQty: Number,
      openInterest: Number,
      highestOpenInterest: Number,
      lowestOpenInterest: Number,
      dayOpen: Number,
      dayClose: Number,
      dayHigh: Number,
      dayLow: Number,
     
    },
    stockId: { type: mongoose.Schema.Types.ObjectId, ref: "StocksDetail" },
    date: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: "3024000s" }, //auto delete entries after 21 days
  },

  { timestamps: true }
);

const MarketDetailData = mongoose.model("MarketDetailData", MarketDataSchema);
export default MarketDetailData;
