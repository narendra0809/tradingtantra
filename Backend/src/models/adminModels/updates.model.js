import mongoose from "mongoose";

const UpdatesSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    category: {
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

const Update = mongoose.model("updates", UpdatesSchema);
export default Update;
