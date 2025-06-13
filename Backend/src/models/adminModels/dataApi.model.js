import mongoose from "mongoose";

const DataApiSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const DataApi = mongoose.model("dataapi", DataApiSchema);
export default DataApi;
