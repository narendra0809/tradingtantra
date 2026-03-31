import {
  BtcOptionChain,
  EthOptionChain,
  SolOptionChain,
  XrpOptionChain,
} from "../models/cryptoOptionChain.model.js";
import { buildCryptoOptionInsiderPayload } from "../services/cryptoOptionInsider.service.js";

const indexWiseModels = {
  BTC: BtcOptionChain,
  ETH: EthOptionChain,
  SOL: SolOptionChain,
  XRP: XrpOptionChain,
};

export const getCryptoOptionInsiderData = async (req, res) => {
  try {
    const { index, expiry, interval } = req.query;
    if (!index)
      return res.status(400).json({ success: false, message: "Missing index" });

    const payload = await buildCryptoOptionInsiderPayload({
      index,
      expiry,
      interval,
    });

    res.json({
      success: true,
      ...payload,
    });
  } catch (error) {
    console.error("Error in Crypto OptionInsider controller:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getCryptoExpiriesByIndex = async (req, res) => {
  try {
    const result = {};
    const cutoff = new Date(Date.now() - 10 * 60 * 1000); // last 10 minutes

    for (const key in indexWiseModels) {
      const Model = indexWiseModels[key];

      // Get expiries from the most recent fetch only (active options on Binance right now)
      const recentExpiries = await Model.distinct("expiry", {
        underlyingName: key,
        updatedAt: { $gte: cutoff },
      });

      if (recentExpiries.length > 0) {
        result[key] = recentExpiries.sort();
      } else {
        // Fallback: all-time expiries if no recent data
        const allExpiries = await Model.distinct("expiry", { underlyingName: key });
        result[key] = allExpiries.sort() || [];
      }
    }
    res.status(200).json({
      success: true,
      message: "Crypto expiries fetched",
      expiriesByIndex: result,
    });
  } catch (error) {
    console.error("Error fetching crypto expiries:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
