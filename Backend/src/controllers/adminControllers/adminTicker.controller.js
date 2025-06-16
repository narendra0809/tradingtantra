import mongoose from "mongoose";
import Ticker from "../../models/adminModels/ticker.model.js";

export const addTicker = async (req, res) => {
  try {
    const { proName, description } = req.body;
    await Ticker.create({ proName, description });
    res.status(200).json({ success: true, message: "Ticker Added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "internal server error" });
  }
};

export const deleteTicker = async (req, res) => {
  try {
    const { id } = req.query;
    const _id = new mongoose.Types.ObjectId(id);
    await Ticker.findByIdAndDelete(_id);
    res.status(200).json({ success: true, message: "ticker deleted !" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "internal server error" });
  }
};
export const editTicker = async (req, res) => {
  try {
    const { id, proName, description } = req.body;
    const _id = new mongoose.Types.ObjectId(id);
    await Ticker.findByIdAndUpdate(_id, { proName, description });
    res.status(200).json({ success: true, message: "ticker deleted !" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "internal server error" });
  }
};

export const getTicker = async (req, res) => {
  try {
    const tickers = await Ticker.find().select("proName description");
    res.status(200).json({ success: true, tickers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "internal server error" });
  }
};
