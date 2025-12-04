import IndexCandles from "../models/indexCandles.model.js";

export const getIndexCandlesData = async (req, res) => {
  try {
    const now = new Date();
    const setTime = (date, hours, minutes = 0, seconds = 0, ms = 0) => {
      const d = new Date(date);
      d.setHours(hours, minutes, seconds, ms);
      return d;
    };
    const today915 = setTime(now, 9, 15, 0, 0);
    let start, end;

    if (now >= today915) {
      start = today915;
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      end = setTime(tomorrow, 9, 15, 0, 0);
    } else {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      start = setTime(yesterday, 9, 15, 0, 0);
      end = today915;
    }
    const candles = await IndexCandles.find({
      updatedAt: { $gte: start, $lt: end },
    }).sort({ updatedAt: 1 });
    if (!candles || candles.length === 0) {
      return res.status(404).send("No index candles found for current window");
    }
    return res.status(200).send(candles);
  } catch (error) {
    console.log("Error while fetching index candles : ", error);
    return res.status(500).send("internal server error");
  }
};
