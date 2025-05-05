import mongoose from "mongoose";

const fiiDiiDataSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // Store date as string (or use Date type if needed)
  fii_buy: { type: String, required: true },
  fii_sell: { type: String, required: true },
  fii_net: { type: String, required: true },
  dii_buy: { type: String, required: true },
  dii_sell: { type: String, required: true },
  dii_net: { type: String, required: true },
});

// Convert string values to numbers before saving

const FiiDiiData = mongoose.model("FiiDiiData", fiiDiiDataSchema);

export default FiiDiiData;
