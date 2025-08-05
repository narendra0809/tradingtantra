import mongoose from "mongoose";
import { StocksDetail1 } from "../../models/stocksDetail.model.js";

export const getStockDetails = async (req, res) => {
  try {
    const stockData = await StocksDetail1.find();
    if (stockData.length === 0) {
      res
        .status(400)
        .json({ success: false, message: "No stock data found !" });
    }
    res.status(200).json({ success: true, stocks: stockData });
  } catch (error) {
    console.log(error);
  }
};

export const addStockDetail = async (req, res) => {
  try {
    const stockData = req.body;
    const stock = new StocksDetail1(stockData);
    await stock.save();
    res
      .status(201)
      .json({ success: true, message: "Stock added successfully", stock });
  } catch (error) {
    console.log(error);
  }
};

export const updateStockDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const stockData = req.body;
    if (!id) {
      res.status(404).json({ success: false, message: "stock id not found !" });
    }
    const _id = new mongoose.Types.ObjectId(id);
    const stock = await StocksDetail1.findByIdAndUpdate({ _id }, stockData, {
      new: true,
    });
    res
      .status(201)
      .json({ success: true, message: "Stock updated successfully", stock });
  } catch (error) {
    console.log(error);
  }
};

export const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(404).json({ success: false, message: "stock id not found !" });
    }
    await StocksDetail1.findByIdAndDelete({ _id: id });
    res
      .status(201)
      .json({ success: true, message: "Stock deleted successfully" });
  } catch (error) {
    console.log(error);
  }
};
