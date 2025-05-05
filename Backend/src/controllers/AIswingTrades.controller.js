import ContractionModel from "../models/Contraction.model.js";
import DailyCandleReversalModel from "../models/dailyCandleRevarsal.model.js";
import CandleBreakoutBreakdown from "../models/candlebreakout.model.js";
import FiveDayRangeBreakerModel from "../models/fiveDayRangeBreacker.model.js";
import TenDayRangeBreakerModel from "../models/tenDayRangeBreacker.model.js";

const FiveDayBO = async (req, res) => {
  try {
    const data = await FiveDayRangeBreakerModel.find(
      {},
      {
        _id: 0,
        SYMBOL_NAME: 1,
        UNDERLYING_SYMBOL: 1,
        type: 1,
        timestamp: 1,
        percentageChange: 1,
      }
    ).lean();

    if (!data) {
      res.status(404).json({ success: false, message: "No data found" });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const TenDayBO = async (req, res) => {
  try {
    const data = await TenDayRangeBreakerModel.find(
      {},
      {
        _id: 0,
        SYMBOL_NAME: 1,
        UNDERLYING_SYMBOL: 1,
        type: 1,
        timestamp: 1,
        persentageChange: 1,
      }
    ).lean();

    if (!data) {
      res.status(404).json({ success: false, message: "No data found" });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const AICandleReversal = async (req, res) => {
  try {
    const data = await DailyCandleReversalModel.find(
      {},
      {
        _id: 0,
        SYMBOL_NAME: 1,
        UNDERLYING_SYMBOL: 1,
        type: 1,
        timestamp: 1,
        persentageChange: 1,
      }
    );

    if (!data) {
      res.status(404).json({ success: false, message: "No data found" });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


const AICandleBreakers = async (req, res) => {
  try {
    // 1. Fetch data with proper projection and sorting
    const data = await CandleBreakoutBreakdown.find(
      {},
      {
        _id: 0,
        UNDERLYING_SYMBOL: 1,
        SYMBOL_NAME: 1,
        trend: 1,
        timestamp: 1,
        persentageChange: 1,
        fstPreviousDayChange: 1
      }
    )
    .sort({ timestamp: -1 }) // Newest first
    .lean();

    // 2. Handle empty data case
    if (!data || data.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No candle breakout data found" 
      });
    }

    // 3. Transform data to match expected frontend format
    const formattedData = data.map(item => ({
      stockSymbol: item.UNDERLYING_SYMBOL,
      stockName: item.SYMBOL_NAME,
      type: item.trend,
      timestamp: item.timestamp,
      percentageChange: item.persentageChange,
      previousDayChange: item.fstPreviousDayChange // Additional useful field
    }));

    // 4. Return successful response
    return res.status(200).json({ 
      success: true, 
      count: formattedData.length,
      data: formattedData 
    });

  } catch (error) {
    console.error("AICandleBreakers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch candle breakers data",
      error: error.message
    });
  }
};

const AIContractionDB = async (req, res) => {
  try {
    const data = await ContractionModel.find(
      {},
      {
        _id: 0,
        SYMBOL_NAME: 1,
        UNDERLYING_SYMBOL: 1,
        timestamp: 1,
      }
    ).lean();

    if (!data) {
      res.status(404).json({ success: false, message: "No data found" });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export {
  FiveDayBO,
  TenDayBO,
  AICandleReversal,
  AICandleBreakers,
  AIContractionDB,
};
