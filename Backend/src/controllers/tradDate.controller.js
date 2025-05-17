import { validationResult } from "express-validator";
import TradDate from "../models/tradDate.model.js";

const addTrade = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    dateRange,
    entryDate,
    exitDate,
    symbol,
    entryPrice,
    exitPrice,
    quantity,
  } = req.body;
  const loggedInUser = req.user;

  try {
    const entryPriceNum = parseFloat(entryPrice);
    const exitPriceNum = parseFloat(exitPrice);
    if (entryPriceNum <= 0 || exitPriceNum <= 0 || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Entry price, exit price, and quantity must be positive values",
      });
    }

    const profitLossPercentage =
      ((exitPriceNum - entryPriceNum) / entryPriceNum) * 100;
    const totalProfitOrLoss = (exitPriceNum - entryPriceNum) * quantity;

    const newTrade = new TradDate({
      dateRange,
      entryDate,
      exitDate,
      symbol,
      entryPrice: entryPriceNum,
      exitPrice: exitPriceNum,
      quantity,
      profitLossPercentage,
      totalProfitOrLoss,
      userID: loggedInUser._id,
    });

    const savedTrade = await newTrade.save();

    return res.status(201).json({
      success: true,
      message: "Trade added successfully",
      trade: savedTrade,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error in add trade",
      error: error.message,
    });
  }
};

const getAddedTrade = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fromDate, toDate } = req.body;
  const loggedInUser = req.user;

  try {
    const startOfDay = new Date(fromDate);
    startOfDay.setUTCHours(0, 0, 0, 0); // Start time: 00:00:00.000Z

    const endOfDay = new Date(toDate);
    endOfDay.setUTCHours(23, 59, 59, 999); // End time: 23:59:59.999Z

    if (startOfDay > endOfDay) {
      return res.status(400).json({
        success: false,
        message: "Invalid date range: fromDate should be before toDate",
      });
    }

    const trades = await TradDate.find(
      {
        userID: loggedInUser._id,
        entryDate: { $gte: startOfDay },
        exitDate: { $lte: endOfDay },
      },
      { __v: 0, _id: 0, userID: 0 }
    ).lean();

    // if (!trades || trades.length === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     message: `No trades found where entryDate >= ${fromDate} and exitDate <= ${toDate}`,
    //   });
    // }

    let totalPL = 0;
    let totalTrade = trades.length;
    let winningTrades = 0;
    let losingTrades = 0;
    let totalWinPL = 0;
    let totalLossPL = 0;
    const allTrade = [];

    const formattedTrades = trades.map((trade) => {
      const profitLossPercentage = (
        ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) *
        100
      ).toFixed(2);

      totalPL += trade.totalProfitOrLoss;

      if (trade.totalProfitOrLoss > 0) {
        winningTrades++;
        totalWinPL += trade.totalProfitOrLoss;
      } else if (trade.totalProfitOrLoss < 0) {
        losingTrades++;
        totalLossPL += Math.abs(trade.totalProfitOrLoss); // Convert to positive for loss calculation
      }

      allTrade.push({ ...trade, profitLossPercentage });

      return {
        dateRange: trade.dateRange,
        entryDate: trade.entryDate,
        exitDate: trade.exitDate,
        symbol: trade.symbol,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        quantity: trade.quantity,
        profitLossPercentage,
        totalProfitOrLoss: trade.totalProfitOrLoss,
      };
    });

    // Sort trades by profit/loss
    const sortedTrades = [...allTrade].sort(
      (a, b) => b.totalProfitOrLoss - a.totalProfitOrLoss
    );

    const top3Winners = sortedTrades.slice(0, 3); // Top 3 winners (highest profit)
    const top3Losers = sortedTrades.slice(-3).reverse(); // Top 3 losers (highest loss)

    // Calculate avgW, avgL, and riskToReward
    const avgW = winningTrades > 0 ? totalWinPL / winningTrades : 0;
    const avgL = losingTrades > 0 ? totalLossPL / losingTrades : 0;
    const riskToReward = avgL > 0 ? (avgW / avgL).toFixed(2) : "N/A";

    const summary = {
      totalProfitLoss: totalPL,
      totalTrade,
      averagePL: totalTrade > 0 ? totalPL / totalTrade : 0,
      maxPL: Math.max(...allTrade.map((t) => t.totalProfitOrLoss)),
      minPL: Math.min(...allTrade.map((t) => t.totalProfitOrLoss)),
      avgW,
      avgL,
      riskToReward,
    };

    return res.status(200).json({
      success: true,
      message: "Trades retrieved successfully",
      trades: formattedTrades,
      summary,
      topWinnersLosers: { top3Winners, top3Losers },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching trades",
      error: error.message,
    });
  }
};

export { addTrade, getAddedTrade };
