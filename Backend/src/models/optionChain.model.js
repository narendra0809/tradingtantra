import mongoose from 'mongoose';

const optionChainSchema = new mongoose.Schema({
  underlyingName: { type: String, required: true },
  underlyingScrip: { type: Number, required: true },
  underlyingSeg: { type: String, required: true },
  expiry: { type: String, required: true },
  fetchDate: { type: Date, required: true },
  timestamp: { type: String, required: true },
  lastPrice: { type: Number, required: true },
  strikeData: [
    {
      strikePrice: { type: Number, required: true },
      optionType: { type: String, enum: ['CE', 'PE'], required: true },
      impliedVolatility: Number,
      lastPrice: Number,
      oi: Number,
      previousClosePrice: Number,
      previousOi: Number,
      previousVolume: Number,
      volume: Number,
    },
  ],
}, { timestamps: true });

optionChainSchema.index({ underlyingName: 1, timestamp: 1, expiry: 1, fetchDate: 1 }, { unique: true });

export const NiftyOptionChain = mongoose.model('NiftyOptionChain', optionChainSchema);
export const BankNiftyOptionChain = mongoose.model('BankNiftyOptionChain', optionChainSchema);
export const FinniftyOptionChain = mongoose.model('FinniftyOptionChain', optionChainSchema);
export const MidcpNiftyOptionChain = mongoose.model('MidcpNiftyOptionChain', optionChainSchema);
export const SensexOptionChain = mongoose.model('SensexOptionChain', optionChainSchema);