import IndexCandles from "../models/indexCandles.model.js";

export const getIndexCandlesData = async (req, res) => {
  try {
    const response = await IndexCandles.find();
    if (response.length === 0) {
      throw new Error("Error while fetching index candles");
    }
    res.status(200).send(response);
  } catch (error) {
    console.log("Error while fetching index candles : ", error);
    res.status(500).send("internal server error");
  }
};
