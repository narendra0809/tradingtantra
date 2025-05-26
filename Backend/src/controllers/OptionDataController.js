import {
  NiftyOptionChain,
  BankNiftyOptionChain,
  FinniftyOptionChain,
  MidcpNiftyOptionChain,
  SensexOptionChain,
} from "../models/optionChain.model.js";

// Normalize timestamp format (e.g. "5/15/2025,9:15:00AM" → "5/15/2025, 9:15:00 AM")
const normalizeTimestamp = (timestamp) => {
  return timestamp
    .replace(/,+\s*/, ",  ") // double space after comma
    .replace(/\s+(AM|PM)/, " $1") // space before AM/PM
    .trim();
};

// Get the right model for the given underlying name
const getModelForUnderlying = (underlyingName) => {
  switch (underlyingName?.toUpperCase()) {
    case "BANKNIFTY":
      return BankNiftyOptionChain;
    case "NIFTY":
      return NiftyOptionChain;
    case "FINNIFTY":
      return FinniftyOptionChain;
    case "MIDCPNIFTY":
      return MidcpNiftyOptionChain;
    case "SENSEX":
      return SensexOptionChain;
    default:
      throw new Error(`No model found for underlyingName: ${underlyingName}`);
  }
};

class OptionDataController {
  static async getOptionData(req, res) {
    try {
      const { underlyingName, expiry } = req.query;

      if (!underlyingName || !expiry) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const OptionChainModel = getModelForUnderlying(underlyingName);

      // Step 1: Find all timestamps for this expiry and underlyingName (case-insensitive)
      const allTimestamps = await OptionChainModel.find({
        underlyingName: new RegExp(`^${underlyingName}$`, 'i'),
        expiry
      }).distinct("timestamp");

      if (allTimestamps.length === 0) {
        return res.status(404).json({
          error: "No data found for the given expiry and underlyingName",
        });
      }

      // Step 2: Extract date from the first timestamp
      const datePrefix = allTimestamps[0].split(",")[0];

      // Step 3: Create normalized time range
      const startTimestamp = normalizeTimestamp(`${datePrefix}, 9:15:00 AM`);
      const endTimestamp = normalizeTimestamp(`${datePrefix}, 3:30:00 PM`);

      console.log("Start Timestamp:", startTimestamp);
      console.log("End Timestamp:", endTimestamp);

      // Step 4: Fetch data between start and end timestamps
      const intradayData = await OptionChainModel.find({
        underlyingName: new RegExp(`^${underlyingName}$`, 'i'),
        expiry,
        timestamp: {
          $gte: startTimestamp,
          $lte: endTimestamp,
        },
      })
        .select("timestamp strikeData lastPrice")
        .sort({ timestamp: 1 })
        .lean();

      if (!intradayData.length) {
        return res.status(404).json({
          error: "No intraday data found in the given time range",
        });
      }

      // Step 5: Send response
      res.json({
        count: intradayData.length,
        data: intradayData,
      });

    } catch (error) {
      console.error("[OptionDataController Error]:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
}

export default OptionDataController;
