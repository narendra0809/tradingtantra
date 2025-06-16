import MarketHoliday from "../models/holidays.model.js";

export const getAllHolidays = async (req, res) => {
  try {
    const holidays = await MarketHoliday.find();
    if (!holidays) {
      res.status(403).json({ success: false, message: "No holidays found" });
    }
    res.status(200).json({ success: true, holidays });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "internal server error" });
  }
};
