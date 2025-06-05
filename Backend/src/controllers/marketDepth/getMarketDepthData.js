import {
  getDayHighBreak,
  getDayLowBreak,
  getStocksData,
  getTopGainersAndLosers,
  previousDaysVolume,
} from "./marketDepth.controller.js";

export const marketDepth = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token missing" });
    }

    const [
      turnOverData,
      dayHighData,
      gainersLosers,
      dayLowData,
      prevVolumeData,
    ] = await Promise.all([
      getStocksData(),
      getDayHighBreak(),
      getTopGainersAndLosers(),
      getDayLowBreak(),
      previousDaysVolume(),
    ]);

    const response = {
      turnOver: turnOverData || [],
      dayHighBreak: dayHighData?.dayHighBreak || [],
      topGainersAndLosers: {
        topGainers: gainersLosers?.topGainers || [],
        topLosers: gainersLosers?.topLosers || [],
      },
      dayLowBreak: dayLowData?.dayLowBreak || [],
      previousDaysVolume: prevVolumeData.previousDayVolumeData || [],
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in marketDepth API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
