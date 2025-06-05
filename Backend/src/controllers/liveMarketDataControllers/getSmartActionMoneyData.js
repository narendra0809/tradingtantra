import MomentumStockFiveMin from "../../models/momentumStockFiveMin.model.js";
import MomentumStockTenMin from "../../models/momentumStockTenMin.model.js";
import IntradayReversalFiveMin from "../../models/fiveMinMomentumSignal.model.js";
import DailyMomentumSignal from "../../models/dailyMomentumSignal.model.js";
import DailyRangeBreakouts from "../../models/dailyRangeBreakout.model.js";
import HighLowReversal from "../../models/highLowReversal.model.js";
import TwoDayHighLowBreak from "../../models/twoDayHighLowBreak.model.js";

export const getSmartMoneyActionData = async (req, res) => {
  try {
    const result = await Promise.allSettled([
      fetchMomentumFiveMins(),
      fetchMomentumTenMins(),
      fetchIntradayReversalFiveMins(),
      fetchIntradayReversalDaily(),
      fetchDailyRangeBreakout(),
      fetchDataHighLowReversal(),
      fetchTwoDayHighLowBreak(),
    ]);
    if (result) {
      res.send(result);
    }
  } catch (error) {
    console.log("Error in getSmartMoneyActionData : ", error);
  }
};

export const fetchMomentumFiveMins = async () => {
  try {
    const updatedDataFromDB = await MomentumStockFiveMin.find(
      {},
      {
        securityId: 1,
        symbol_name: 1,
        symbol: 1,
        momentumType: 1,
        timestamp: 1,
        percentageChange: 1,
        previousHigh: 1,
        previousLow: 1,
        previousOpen: 1,
        previousClose: 1,
        currentOpen: 1,
        currentClose: 1,
        _id: 0,
      }
    ).sort({ updatedAt: -1 });
    return { momentumFiveMins: updatedDataFromDB };
  } catch (error) {
    console.log("Error in fetching five mins data : ", error);
  }
};

export const fetchMomentumTenMins = async () => {
  try {
    const allMomentumStocks = await MomentumStockTenMin.find(
      {},
      {
        securityId: 1,
        symbol_name: 1,
        symbol: 1,
        momentumType: 1,
        timestamp: 1,
        percentageChange: 1,
        previousHigh: 1,
        previousLow: 1,
        previousOpen: 1,
        previousClose: 1,
        currentOpen: 1,
        currentClose: 1,
        _id: 0,
      }
    ).sort({ updatedAt: -1 });
    return { momentumTenMins: allMomentumStocks };
  } catch (error) {
    console.log("Error in fetching ten mins :", error);
  }
};

export const fetchIntradayReversalFiveMins = async () => {
  try {
    const allMomentumStocks = await IntradayReversalFiveMin.find(
      {},
      {
        type: 1,
        securityId: 1,
        stockSymbol: 1,
        stockName: 1,
        overAllPercentageChange: 1,
        timestamp: 1,
        _id: 0,
      }
    ).sort({ updatedAt: -1 });
    return { intradayReversalFiveMin: allMomentumStocks };
  } catch (error) {
    console.log("Error in fetching intraday reversal five mins  :", error);
  }
};

export const fetchIntradayReversalDaily = async () => {
  try {
    const fullData = await DailyMomentumSignal.find(
      {},
      {
        type: 1,
        securityId: 1,
        stockSymbol: 1,
        stockName: 1,
        percentageChange: 1,
        timestamp: 1,
        _id: 0,
      }
    ).sort({ updatedAt: -1 });
    return { intradayReversalDaily: fullData };
  } catch (error) {
    console.log("Error in fetching intraday reversal daily : ", error);
  }
};
export const fetchDailyRangeBreakout = async () => {
  try {
    const fullData = await DailyRangeBreakouts.find(
      {},
      {
        type: 1,
        securityId: 1,
        stockSymbol: 1,
        stockName: 1,
        percentageChange: 1,
        timestamp: 1,
        _id: 0,
      }
    ).sort({ updatedAt: -1 });
    return { dailyRangeBreakout: fullData };
  } catch (error) {
    console.log("Error in fetching daily range breakout : ", error);
  }
};

export const fetchDataHighLowReversal = async () => {
  try {
    const data = await HighLowReversal.find(
      {},
      {
        securityId: 1,
        symbolName: 1,
        underlyingSymbol: 1,
        type: 1,
        timestamp: 1,
        reversalPrice: 1,
        percentageChange: 1,
        date: 1,
        rangeHigh: 1,
        rangeLow: 1,
        secondCandle: 1,
        thirdCandle: 1,
        fourthCandle: 1,
        _id: 0,
      }
    )
      .sort({ updatedAt: -1 })
      .lean();
    return { dailyHighLowReversal: data };
  } catch (error) {
    console.log("Erorr in fetching high low reversal :", error);
  }
};

export const fetchTwoDayHighLowBreak = async () => {
  try {
    const data = await TwoDayHighLowBreak.find(
      {},
      {
        securityId: 1,
        symbolName: 1,
        underlyingSymbol: 1,
        type: 1,
        timestamp: 1,
        breakPrice: 1,
        percentageChange: 1,
        date: 1,
        _id: 0,
      }
    )
      .sort({ updatedAt: -1 })
      .lean();
    return { twoDayHighLowBreak: data };
  } catch (error) {
    console.log("Error in fetching two day high low : ", error);
  }
};
