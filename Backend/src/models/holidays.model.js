import mongoose from "mongoose";
const { Schema } = mongoose;

const MarketHolidaySchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    holiday_type: {
      type: String,
      enum: ["TRADING_HOLIDAY", "SETTLEMENT_HOLIDAY"],
      required: true,
    },
    closed_exchanges: {
      type: [String],

      required: true,
    },
  },
  { timestamps: true }
);

const MarketHoliday = mongoose.model("MarketHoliday", MarketHolidaySchema);

export default MarketHoliday;
