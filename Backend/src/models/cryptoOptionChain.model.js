import mongoose from "mongoose";

const cryptoOptionChainSchema = new mongoose.Schema(
  {
    underlyingName: { type: String, required: true }, // BTC, ETH
    expiry: { type: String, required: true },
    fetchDate: { type: Date, required: false },
    timestamp: { type: String, required: true },
    lastPrice: { type: Number, required: true }, // underlying spot price
    strikeData: [
      {
        strikePrice: { type: Number, required: true },
        optionType: { type: String, enum: ["CE", "PE"], required: true },
        impliedVolatility: Number,
        lastPrice: Number,
        oi: Number,
        previousClosePrice: Number,
        previousOi: Number,
        previousVolume: Number,
        volume: Number,
      },
    ],
  },
  { timestamps: true }
);

cryptoOptionChainSchema.index(
  { underlyingName: 1, timestamp: 1, expiry: 1 },
  { unique: true }
);

export const BtcOptionChain = mongoose.model(
  "BtcOptionChain",
  cryptoOptionChainSchema
);
export const EthOptionChain = mongoose.model(
  "EthOptionChain",
  cryptoOptionChainSchema
);
export const SolOptionChain = mongoose.model(
  "SolOptionChain",
  cryptoOptionChainSchema
);
export const XrpOptionChain = mongoose.model(
  "XrpOptionChain",
  cryptoOptionChainSchema
);
