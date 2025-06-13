import mongoose from "mongoose";

const OurStrategySchema = new mongoose.Schema(
  {
    thumbnail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const OurStrategy = mongoose.model("ourstrategy", OurStrategySchema);
export default OurStrategy;
