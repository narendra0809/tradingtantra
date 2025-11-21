import {
  BankNiftyOptionChain,
  FinniftyOptionChain,
  MidcpNiftyOptionChain,
  NiftyOptionChain,
  SensexOptionChain,
} from "../models/optionChain.model.js";
import { buildOptionInsiderPayload } from "../services/optionInsider.service.js";

const indexWiseModels = {
  NIFTY: NiftyOptionChain,
  BANKNIFTY: BankNiftyOptionChain,
  FINNIFTY: FinniftyOptionChain,
  MIDCPNIFTY: MidcpNiftyOptionChain,
  SENSEX: SensexOptionChain,
};

export const getOptionInsiderData = async (req, res) => {
  try {
    const { index, expiry, interval } = req.query;
    if (!index)
      return res.status(400).json({ success: false, message: "Missing index" });

    const payload = await buildOptionInsiderPayload({
      index,
      expiry,
      interval,
    });

    res.json({
      success: true,
      ...payload,
    });
  } catch (error) {
    console.error("Error in OptionInsider controller:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getExpiriesByIndex = async (req, res) => {
  try {
    const result = {};
    for (const key in indexWiseModels) {
      const Model = indexWiseModels[key];
      const allExpiries = await Model.distinct("expiry", {
        underlyingName: key,
      });
      result[key] = allExpiries || [];
    }
    res.status(200).json({
      success: true,
      message: "Expiries fetched",
      expiriesByIndex: result,
    });
  } catch (error) {
    console.error("Error fetching expiries:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
