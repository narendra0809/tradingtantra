import { buildOptionClockPayload } from "../services/optionClock.service.js";
import { getModelForUnderlying } from "./OptionDataController.js";

export const getOptionClockData = async (req, res) => {
  try {
    const { index, expiry, startTime, endTime } = req.query;
    if (!index || !expiry)
      return res
        .status(401)
        .json({ success: false, message: "Invalid index and expiry" });

    const data = await buildOptionClockPayload({
      index,
      expiry,
      startTime,
      endTime,
    });

    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Data not found" });

    res.status(200).json({
      success: true,
      message: "Data fetched successfully !",
      optionClockData: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ success: false, message: "Data not found" });
  }
};

export const getClockExpiriesByIndex = async (req, res) => {
  try {
    const indexes = ["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY", "SENSEX"];
    const expiriesByIndex = {};

    const promises = indexes.map(async (index) => {
      try {
        const Model = getModelForUnderlying(index);
        const expiries = await Model.distinct("expiry", {
          underlyingName: index,
        });
        const frontendIndex = {
          NIFTY: "Nifty50",
          BANKNIFTY: "BankNifty",
          FINNIFTY: "FinNifty",
          MIDCPNIFTY: "Midcap",
          SENSEX: "Sensex",
        }[index];

        expiriesByIndex[frontendIndex] = expiries.sort().reverse();
      } catch (error) {
        console.error(`Error fetching expiries for ${index}:`, error);
        expiriesByIndex[
          {
            NIFTY: "Nifty50",
            BANKNIFTY: "BankNifty",
            FINNIFTY: "FinNifty",
            MIDCPNIFTY: "Midcap",
            SENSEX: "Sensex",
          }[index]
        ] = [];
      }
    });

    await Promise.all(promises);

    res.json({
      success: true,
      message: "All expiries fetched successfully!",
      expiriesByIndex,
    });
  } catch (error) {
    console.error("Error in getClockExpiriesByIndex:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch expiries",
    });
  }
};
