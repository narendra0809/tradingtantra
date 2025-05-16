import {
  NiftyOptionChain,
  BankNiftyOptionChain,
  FinniftyOptionChain,
  MidcpNiftyOptionChain,
  SensexOptionChain,
} from "../models/optionChain.model.js";

// Normalize timestamp format, e.g. "5/15/2025,9:15:00AM" to "5/15/2025, 9:15:00 AM"
const normalizeTimestamp = (timestamp) => {
  return timestamp
    .replace(/,+\s*/, ",  ") // comma ke baad **double space** set karo (jaisa DB mein hai)
    .replace(/\s+(AM|PM)/, " $1") // AM/PM se pehle ek space rahe
    .trim();
};


// Get correct MongoDB model based on underlying name
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
  // ... baaki code same ...

static async getOptionData(req, res) {
  try {
    const { underlyingName, expiry } = req.query;

    if (!underlyingName || !expiry) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const OptionChainModel = getModelForUnderlying(underlyingName);

    // Step 1: Get all timestamps for that underlying and expiry
    const allTimestamps = await OptionChainModel.find({
      underlyingName,
      expiry
    }).distinct("timestamp");

    if (allTimestamps.length === 0) {
      return res.status(404).json({ error: "No data found for the given expiry and underlyingName" });
    }

    // Step 2: Extract date prefix from timestamp (e.g., "5/15/2025")
    const datePrefix = allTimestamps[0].split(",")[0];

    // Step 3: Create normalized start and end timestamps
    const normalizeTimestamp = (timestamp) => {
      return timestamp
        .replace(/,+\s*/, ",  ") // double space after comma
        .replace(/\s+(AM|PM)/, " $1") // space before AM/PM
        .trim();
    };

    const startTimestamp = normalizeTimestamp(`${datePrefix}, 9:15:00 AM`);
    const endTimestamp = normalizeTimestamp(`${datePrefix}, 3:30:00 PM`);
    console.log("Start Timestamp:", startTimestamp);
    console.log("End Timestamp:", endTimestamp);

    // Step 4: Fetch data between 9:15 AM and 3:30 PM
    const intradayData = await OptionChainModel.find({
      underlyingName,
      expiry,
      
    })
      .select("timestamp strikeData lastPrice") // Optional: only return needed fields
      .sort({ timestamp: 1 })
      .lean();

    if (!intradayData.length) {
      return res.status(404).json({ error: "No intraday data found in the given time range" });
    }

    // Step 5: Return the response
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
