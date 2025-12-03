import mongoose from "mongoose";

const OurStrategySchema = new mongoose.Schema(
  {
    thumbnailUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const OurStrategy = mongoose.model("ourstrategy", OurStrategySchema);
export default OurStrategy;
