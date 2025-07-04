// import {
//   NiftyOptionChain,
//   BankNiftyOptionChain,
//   FinniftyOptionChain,
//   MidcpNiftyOptionChain,
//   SensexOptionChain,
// } from "../models/optionChain.model.js";

// // Normalize timestamp format (e.g. "5/15/2025,9:15:00AM" → "5/15/2025, 9:15:00 AM")
// const normalizeTimestamp = (timestamp) => {
//   return timestamp
//     .replace(/,+\s*/, ",  ") // double space after comma
//     .replace(/\s+(AM|PM)/, " $1") // space before AM/PM
//     .trim();
// };

// // Get the right model for the given underlying name
// const getModelForUnderlying = (underlyingName) => {
//   switch (underlyingName?.toUpperCase()) {
//     case "BANKNIFTY":
//       return BankNiftyOptionChain;
//     case "NIFTY":
//       return NiftyOptionChain;
//     case "FINNIFTY":
//       return FinniftyOptionChain;
//     case "MIDCPNIFTY":
//       return MidcpNiftyOptionChain;
//     case "SENSEX":
//       return SensexOptionChain;
//     default:
//       throw new Error(`No model found for underlyingName: ${underlyingName}`);
//   }
// };

// class OptionDataController {
//   static async getOptionData(req, res) {
//     try {
//       const { underlyingName, expiry } = req.query;

//       if (!underlyingName || !expiry) {
//         return res.status(400).json({ error: "Missing required parameters" });
//       }

//       const OptionChainModel = getModelForUnderlying(underlyingName);

//       // Step 1: Find all timestamps for this expiry and underlyingName (case-insensitive)
//       const allTimestamps = await OptionChainModel.find({
//         underlyingName: new RegExp(`^${underlyingName}$`, "i"),
//         expiry,
//       }).distinct("timestamp");

//       if (allTimestamps.length === 0) {
//         return res.status(404).json({
//           error: "No data found for the given expiry and underlyingName",
//         });
//       }

//       // Step 2: Extract date from the first timestamp
//       const datePrefix = allTimestamps[0].split(",")[0];

//       console.log(datePrefix);

//       // Step 3: Create normalized time range
//       const startTimestamp = normalizeTimestamp(`${datePrefix}, 9:15:00 AM`);
//       const endTimestamp = normalizeTimestamp(`${datePrefix}, 3:30:00 PM`);

//       console.log("Start Timestamp:", startTimestamp);
//       console.log("End Timestamp:", endTimestamp);

//       // Step 4: Fetch data between start and end timestamps
//       console.log("Expiry and underlyingName", expiry, underlyingName);
//       const intradayData = await OptionChainModel.find({
//         underlyingName: new RegExp(`^${underlyingName}$`, "i"),
//         expiry,
//         timestamp: {
//           $gte: "5/29/2025,  9:15:00 AM",
//           $lte: "5/29/2025,  3:30:00 PM",
//         },
//       })
//         .select("timestamp strikeData lastPrice")
//         .sort({ timestamp: 1 })
//         .lean();

//       console.log("Intraday Data : ", intradayData);

//       if (!intradayData.length) {
//         return res.status(404).json({
//           error: "No intraday data found in the given time range",
//         });
//       }

//       // Step 5: Send response
//       res.json({
//         count: intradayData.length,
//         data: intradayData,
//       });
//     } catch (error) {
//       console.error("[OptionDataController Error]:", error);
//       res.status(500).json({ error: "Server error" });
//     }
//   }
// }

// export default OptionDataController;

import {
  NiftyOptionChain,
  BankNiftyOptionChain,
  FinniftyOptionChain,
  MidcpNiftyOptionChain,
  SensexOptionChain,
} from "../models/optionChain.model.js";

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

// Parse timestamp into Date object for comparison
const parseTimestamp = (timestamp) => {
  const [datePart, timePart] = timestamp.split(",");
  const [time, period] = timePart.trim().split(/(?=[AP]M)/i);
  const [hours, minutes, seconds] = time.trim().split(":").map(Number);

  let hours24 = hours;
  if (period && period.toLowerCase().includes("pm") && hours24 < 12) {
    hours24 += 12;
  }
  if (period && period.toLowerCase().includes("am") && hours24 === 12) {
    hours24 = 0;
  }

  const [month, day, year] = datePart.trim().split("/").map(Number);
  return new Date(year, month - 1, day, hours24, minutes, seconds);
};

class OptionDataController {
  static async getOptionDataByUnderlying(req, res) {
    try {
      const { underlyingName } = req.query;

      if (!underlyingName) {
        return res
          .status(400)
          .json({ error: "Missing underlyingName parameter" });
      }

      const OptionChainModel = getModelForUnderlying(underlyingName);

      const data = await OptionChainModel.find({
        underlyingName: new RegExp(`^${underlyingName}$`, "i"),
      })
        .select("timestamp strikeData lastPrice expiry updatedAt")
        .sort({ timestamp: 1 })
        .lean();

      if (data.length === 0) {
        return res
          .status(404)
          .json({ error: "No data found for the given underlyingName" });
      }

      // Get unique expiries
      const expiries = [...new Set(data.map((item) => item.expiry))];
      res.json({
        count: data.length,
        expiries,
        data,
      });
    } catch (error) {
      console.error("[OptionChainController Error]:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  static async getOptionData(req, res) {
    try {
      const { underlyingName, expiry } = req.query;

      if (!underlyingName || !expiry) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const OptionChainModel = getModelForUnderlying(underlyingName);

      const allData = await OptionChainModel.find({
        underlyingName: new RegExp(`^${underlyingName}$`, "i"),
        expiry,
      })
        .select("timestamp strikeData lastPrice")
        .sort({ timestamp: 1 })
        .lean();

      if (allData.length === 0) {
        return res.status(404).json({
          error: "No data found for the given expiry and underlyingName",
        });
      }

      // Parse all timestamps to Date objects
      const dataWithDates = allData.map((item) => ({
        ...item,
        parsedTimestamp: parseTimestamp(item.timestamp),
      }));

      const firstDate = dataWithDates[0].parsedTimestamp;
      const startTime = new Date(
        firstDate.getFullYear(),
        firstDate.getMonth(),
        firstDate.getDate(),
        9,
        15,
        0
      );
      const endTime = new Date(
        firstDate.getFullYear(),
        firstDate.getMonth(),
        firstDate.getDate(),
        15,
        30,
        0
      );

      // Filter for intraday data only
      const intradayData = dataWithDates.filter(
        (item) =>
          item.parsedTimestamp >= startTime && item.parsedTimestamp <= endTime
      );

      // Get unique timestamps for response
      const uniqueTimestamps = [
        ...new Set(intradayData.map((item) => item.timestamp)),
      ];

      if (intradayData.length === 0) {
        return res.status(404).json({
          error: "No intraday data found in the given time range",
        });
      }
      console.log(intradayData);
      res.json({
        count: intradayData.length,
        data: intradayData.map(({ parsedTimestamp, ...rest }) => rest),
      });
    } catch (error) {
      console.error("[OptionDataController Error]:", error);
      res.status(500).json({ error: "Server error", details: error.message });
    }
  }
}

export default OptionDataController;
