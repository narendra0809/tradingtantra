import MarketDetailData from "../models/marketData.model.js";
import StocksDetail from "../models/stocksDetail.model.js";
import moment from 'moment-timezone';
import MarketHoliday from "../models/holidays.model.js";

const checkHoliday = async () => {
  try {
    const today = moment().tz('Asia/Kolkata');
    const dayOfWeek = today.day(); // 0 = Sunday, 6 = Saturday
    const todayDate = today.startOf('day').toDate(); // Normalize to start of day

    // Check for weekend (Saturday or Sunday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return true;
    }

    // Check for trading holiday
    const holiday = await MarketHoliday.findOne({
      date: todayDate,
      holiday_type: 'TRADING_HOLIDAY',
      closed_exchanges: { $in: ['NSE', 'BSE'] },
    }).lean();

    return !!holiday; // Return true if holiday found, false otherwise
  } catch (error) {
    console.error('Error checking holiday:', error);
    return false; // Default to false to avoid blocking execution
  }
};
const getStocks = async (req, res) => {
  try {
    const stocks = await StocksDetail.find().lean();
    if (!stocks || stocks.length === 0) {
      return res.status(404).json({ success: false, message: "No stocks found" });
    }
    res.status(200).json({ success: true, data: stocks });
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// new logic that return previous data if today data not avail for turnover with optimized code
const getStocksData = async () => {
  try {
    // Step 1: Check holiday and market hours
    const now = moment().tz('Asia/Kolkata');
    const hours = now.hours();
    const minutes = now.minutes();
    const isHoliday = await checkHoliday();
    const usePreviousDayClose =
      isHoliday ||
      hours < 9 ||
      (hours === 9 && minutes < 15) ||
      hours > 15 ||
      (hours === 15 && minutes > 40);

    // Step 2: Get the latest unique date
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date")
      .lean();

    if (!latestEntry) {
      return { success: false, message: "No stock data available" };
    }

    const latestDate = latestEntry.date;

    // Step 3: Fetch stock data for the latest date
    let stocksData = await MarketDetailData.find({ date: latestDate }).lean();
    let dataDate = latestDate;

    if (!stocksData.length) {
      // Fetch previous day's data if today's data is unavailable
      const previousDayEntry = await MarketDetailData.findOne(
        { date: { $lt: latestDate } }
      )
        .sort({ date: -1 })
        .select("date")
        .lean();

      if (!previousDayEntry) {
        return { success: false, message: "No previous data found" };
      }

      dataDate = previousDayEntry.date;
      stocksData = await MarketDetailData.find({ date: dataDate }).lean();
      if (!stocksData.length) {
        return { success: false, message: "No stock data available for the previous date" };
      }
    }

    // Step 4: Fetch close data based on holiday/market hours
    let closeData = stocksData;
    let closeDate = dataDate;

    if (usePreviousDayClose) {
      const previousDayEntry = await MarketDetailData.findOne(
        { date: { $lt: dataDate } }
      )
        .sort({ date: -1 })
        .select("date")
        .lean();

      if (!previousDayEntry) {
        return { success: false, message: "No previous stock data available" };
      }

      closeDate = previousDayEntry.date;
      closeData = await MarketDetailData.find({ date: closeDate }).lean();
    }

    const closeMap = new Map();
    closeData.forEach((entry) => {
      closeMap.set(entry.securityId, entry.data?.[0]?.dayClose || 0);
    });

    // Step 5: Fetch stock details
    const stockIds = stocksData.map((entry) => entry.securityId);
    const stockDetails = await StocksDetail.find(
      { SECURITY_ID: { $in: stockIds } },
      {
        _id: 0,
        SECURITY_ID: 1,
        UNDERLYING_SYMBOL: 1,
        SYMBOL_NAME: 1,
        DISPLAY_NAME: 1,
        INDEX: 1,
        SECTOR: 1,
      }
    ).lean();

    const stockDetailsMap = new Map(
      stockDetails.map((stock) => [stock.SECURITY_ID, stock])
    );

    // Step 6: Compute stock data with changes
    const response = stocksData.map((stock) => {
      const stockDetail = stockDetailsMap.get(stock.securityId) || {};
      const closePrice = closeMap.get(stock.securityId) || 0;
      const latestTradePrice = stock.data?.[0]?.latestTradedPrice || 0;

      const changePercentage =
        closePrice && closePrice !== 0
          ? parseFloat(
              (((latestTradePrice - closePrice) / closePrice) * 100).toFixed(2)
            )
          : 0;

      return {
        SECURITY_ID: stock.securityId,
        INDEX: stockDetail.INDEX || "N/A",
        SECTOR: stockDetail.SECTOR || "N/A",
        UNDERLYING_SYMBOL: stockDetail.UNDERLYING_SYMBOL || "N/A",
        SYMBOL_NAME: stockDetail.SYMBOL_NAME || "N/A",
        DISPLAY_NAME: stockDetail.DISPLAY_NAME || "N/A",
        turnover: stock.turnover,
        changePercentage,
      };
    });

    // Sort by turnover and return top 30 stocks
    const sortedData = response
      .sort((a, b) => parseFloat(b.turnover) - parseFloat(a.turnover))
      .slice(0, 30);

    return { success: true, message: "Stock data retrieved", data: sortedData };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return {
      success: false,
      message: "Internal server error",
      error: error.message,
    };
  }
};

//this controller give data if today data not avail it return yesterday data
const getTopGainersAndLosers = async (req, res) => {
  try {
    // Step 1: Check holiday and market hours
    const now = moment().tz('Asia/Kolkata');
    const hours = now.hours();
    const minutes = now.minutes();
    const isHoliday = await checkHoliday();
    const usePreviousDayClose =
      isHoliday ||
      hours < 9 ||
      (hours === 9 && minutes < 15) ||
      hours > 15 ||
      (hours === 15 && minutes > 40);

    // Step 2: Find the most recent available date
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date")
      .lean();

    if (!latestEntry) {
      return res.status(404).json({ success: false, message: "No stock data available" });
    }

    const latestDate = latestEntry.date;

    // Step 3: Fetch all data for the latest available date
    let latestData = await MarketDetailData.find({ date: latestDate }).lean();

    if (latestData.length === 0) {
      // Fetch previous day's data if today's data is unavailable
      const previousDayEntry = await MarketDetailData.findOne(
        { date: { $lt: latestDate } },
        { date: 1 }
      )
        .sort({ date: -1 })
        .lean();

      if (!previousDayEntry) {
        return res.status(404).json({
          success: false,
          message: "No previous stock data available",
        });
      }

      latestDate = previousDayEntry.date;
      latestData = await MarketDetailData.find({ date: latestDate }).lean();
      if (latestData.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No stock data available for the previous date",
        });
      }
    }

    // Step 4: Determine dayClose source
    let closeData = latestData;
    let closeDate = latestDate;

    if (usePreviousDayClose) {
      const previousDayEntry = await MarketDetailData.findOne(
        { date: { $lt: latestDate } },
        { date: 1 }
      )
        .sort({ date: -1 })
        .lean();

      if (!previousDayEntry) {
        return res.status(404).json({
          success: false,
          message: "No previous stock data available",
        });
      }

      closeDate = previousDayEntry.date;
      closeData = await MarketDetailData.find({ date: closeDate }).lean();
    }

    // Step 5: Map closing prices
    const closeMap = new Map();
    closeData.forEach((entry) => {
      closeMap.set(entry.securityId, entry.data?.[0]?.dayClose || 0);
    });

    const gainers = [];
    const losers = [];

    // Step 6: Get stock details
    const stockIds = latestData.map((entry) => entry.securityId);
    const stockDetails = await StocksDetail.find(
      { SECURITY_ID: { $in: stockIds } },
      {
        UNDERLYING_SYMBOL: 1,
        SYMBOL_NAME: 1,
        SECURITY_ID: 1,
        INDEX: 1,
        SECTOR: 1,
        _id: 0,
      }
    ).lean();

    const stockDetailsMap = new Map(
      stockDetails.map((stock) => [stock.SECURITY_ID, stock])
    );

    // Step 7: Compute gainers & losers
    latestData.forEach((todayEntry) => {
      const closePrice = closeMap.get(todayEntry.securityId);
      if (!closePrice || closePrice === 0) return;

      const latestPrice = todayEntry.data?.[0]?.latestTradedPrice || 0;
      if (latestPrice === 0) return;

      const percentageChange = parseFloat(
        ((latestPrice - closePrice) / closePrice) * 100
      ).toFixed(2);

      const stockDetail = stockDetailsMap.get(todayEntry.securityId) || {};
      const result = {
        securityId: todayEntry.securityId,
        stockSymbol: stockDetail.UNDERLYING_SYMBOL || "N/A",
        stockName: stockDetail.SYMBOL_NAME || "N/A",
        sector: stockDetail.SECTOR || "N/A",
        index: stockDetail.INDEX || "N/A",
        lastTradePrice: latestPrice,
        previousClosePrice: closePrice,
        percentageChange,
        turnover: todayEntry.turnover,
        xElement: todayEntry.xelement,
      };

      if (percentageChange > 0) {
        gainers.push(result);
      } else if (percentageChange < 0) {
        losers.push(result);
      }
    });

    gainers.sort((a, b) => b.percentageChange - a.percentageChange);
    losers.sort((a, b) => a.percentageChange - b.percentageChange);

    res.status(200).json({
      success: true,
      topGainers: gainers.slice(0, 30),
      topLosers: losers.slice(0, 30),
    });
  } catch (error) {
    console.error("Error fetching top gainers & losers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching top gainers & losers",
      error: error.message,
    });
  }
};

// give the previous data if today data not avail
const getDayHighBreak = async (req, res) => {
  try {
    // Step 1: Check holiday and market hours
    const now = moment().tz('Asia/Kolkata');
    const hours = now.hours();
    const minutes = now.minutes();
    const isHoliday = await checkHoliday();
    const usePreviousDayClose =
      isHoliday ||
      hours < 9 ||
      (hours === 9 && minutes < 15) ||
      hours > 15 ||
      (hours === 15 && minutes > 40);

    // Step 2: Find the most recent date available
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date")
      .lean();

    if (!latestEntry) {
      return res.status(404).json({ success: false, message: "Not enough data to calculate day high break" });
    }

    let latestDate = latestEntry.date;

    // Step 3: Fetch all entries for the latest date
    let todayData = await MarketDetailData.find({ date: latestDate }).lean();

    if (todayData.length === 0) {
      // Fetch previous day's data if today's data is unavailable
      const previousDayEntry = await MarketDetailData.findOne(
        { date: { $lt: latestDate } },
        { date: 1 }
      )
        .sort({ date: -1 })
        .lean();

      if (!previousDayEntry) {
        return res.status(404).json({
          success: false,
          message: "No previous stock data available",
        });
      }

      latestDate = previousDayEntry.date;
      todayData = await MarketDetailData.find({ date: latestDate }).lean();
      if (todayData.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No data available for the previous saved date",
        });
      }
    }

    // Step 4: Determine dayClose source
    let closeData = todayData;
    let closeDate = latestDate;

    if (usePreviousDayClose) {
      const previousDayEntry = await MarketDetailData.findOne(
        { date: { $lt: latestDate } },
        { date: 1 }
      )
        .sort({ date: -1 })
        .lean();

      if (!previousDayEntry) {
        return res.status(404).json({
          success: false,
          message: "No previous stock data available",
        });
      }

      closeDate = previousDayEntry.date;
      closeData = await MarketDetailData.find({ date: closeDate }).lean();
    }

    const closeMap = new Map();
    closeData.forEach((entry) => {
      closeMap.set(entry.securityId, entry.data?.[0]?.dayClose || 0);
    });

    // Step 5: Fetch stock details
    const stocksDetail = await StocksDetail.find().lean();

    if (!stocksDetail || stocksDetail.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Not enough data to calculate day high break",
      });
    }

    // Step 6: Process day high break
    const filteredData = todayData.map((data) => ({
      latestPrice: parseFloat(data.data?.[0]?.latestTradedPrice?.toFixed(2) || 0),
      dayHigh: parseFloat(data.data?.[0]?.dayHigh?.toFixed(2) || 0),
      dayClose: parseFloat(closeMap.get(data.securityId)?.toFixed(2) || 0),
      securityId: data.securityId,
      turnover: data.turnover,
      todayOpen: parseFloat(data.data?.[0]?.dayOpen?.toFixed(2) || 0),
      xElement: data.xelement,
    }));

    const dayHighBreak = filteredData
      .map((data) => {
        const dayHigh = data.dayHigh;
        const changePrice = dayHigh * 0.005;
        const latestPrice = data.latestPrice;
        const dayClose = data.dayClose;

        if (latestPrice >= dayHigh - changePrice && dayClose !== 0) {
          const stock = stocksDetail.find(
            (stock) => stock.SECURITY_ID === data.securityId
          );

          if (stock) {
            const {
              _id,
              createdAt,
              updatedAt,
              SECURITY_ID,
              __v,
              ...filteredStock
            } = stock;

            const percentageChange = (
              ((latestPrice - dayClose) / dayClose) * 100
            ).toFixed(2);

            const percentageDifference = (
              ((dayHigh - latestPrice) / latestPrice) * 100
            ).toFixed(2);

            return {
              ...data,
              stock: filteredStock,
              percentageChange,
              percentageDifference,
            };
          }
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => parseFloat(a.percentageDifference) - parseFloat(b.percentageDifference));

    res.status(200).json({ success: true, dayHighBreak: dayHighBreak.slice(0, 30) });
  } catch (error) {
    console.error('Error calculating day high break:', error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// give the previous data if today data not avail
const getDayLowBreak = async (req, res) => {
  try {
    // Step 1: Check holiday and market hours
    const now = moment().tz('Asia/Kolkata');
    const hours = now.hours();
    const minutes = now.minutes();
    const isHoliday = await checkHoliday();
    const usePreviousDayClose =
      isHoliday ||
      hours < 9 ||
      (hours === 9 && minutes < 15) ||
      hours > 15 ||
      (hours === 15 && minutes > 40);

    // Step 2: Find the most recent date available
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date")
      .lean();

    if (!latestEntry) {
      return res.status(404).json({ success: false, message: "Not enough data to calculate day low break" });
    }

    let latestDate = latestEntry.date;

    // Step 3: Fetch all entries for the latest date
    let todayData = await MarketDetailData.find({ date: latestDate }).lean();

    if (todayData.length === 0) {
      // Fetch previous day's data if today's data is unavailable
      const previousDayEntry = await MarketDetailData.findOne(
        { date: { $lt: latestDate } },
        { date: 1 }
      )
        .sort({ date: -1 })
        .lean();

      if (!previousDayEntry) {
        return res.status(404).json({
          success: false,
          message: "No previous stock data available",
        });
      }

      latestDate = previousDayEntry.date;
      todayData = await MarketDetailData.find({ date: latestDate }).lean();
      if (todayData.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No data available for the previous saved date",
        });
      }
    }

    // Step 4: Determine dayClose source
    let closeData = todayData;
    let closeDate = latestDate;

    if (usePreviousDayClose) {
      const previousDayEntry = await MarketDetailData.findOne(
        { date: { $lt: latestDate } },
        { date: 1 }
      )
        .sort({ date: -1 })
        .lean();

      if (!previousDayEntry) {
        return res.status(404).json({
          success: false,
          message: "No previous stock data available",
        });
      }

      closeDate = previousDayEntry.date;
      closeData = await MarketDetailData.find({ date: closeDate }).lean();
    }

    const closeMap = new Map();
    closeData.forEach((entry) => {
      closeMap.set(entry.securityId, entry.data?.[0]?.dayClose || 0);
    });

    // Step 5: Fetch stock details
    const stocksDetail = await StocksDetail.find().lean();

    if (!stocksDetail || stocksDetail.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Not enough data to calculate day low break",
      });
    }

    // Step 6: Process day low break
    const filteredData = todayData.map((data) => ({
      latestPrice: parseFloat(data.data?.[0]?.latestTradedPrice?.toFixed(2) || 0),
      dayClose: parseFloat(closeMap.get(data.securityId)?.toFixed(2) || 0),
      dayLow: parseFloat(data.data?.[0]?.dayLow?.toFixed(2) || 0),
      securityId: data.securityId,
      turnover: data.turnover,
      xElement: data.xelement,
    }));

    const dayLowBreak = filteredData
      .map((data) => {
        const changePrice = data.dayLow * 0.005;
        const latestPrice = data.latestPrice;
        const dayClose = data.dayClose;
        const dayLow = data.dayLow;

        if (latestPrice <= dayLow + changePrice && dayClose !== 0) {
          const stock = stocksDetail.find(
            (stock) => stock.SECURITY_ID === data.securityId
          );

          if (stock) {
            const {
              _id,
              createdAt,
              updatedAt,
              SECURITY_ID,
              __v,
              ...filteredStock
            } = stock;

            const percentageChange = (
              ((latestPrice - dayClose) / dayClose) * 100
            ).toFixed(2);

            const percentageDifference = (
              ((dayLow - latestPrice) / latestPrice) * 100
            ).toFixed(2);

            return {
              ...data,
              stock: filteredStock,
              percentageChange,
              percentageDifference,
            };
          }
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => parseFloat(b.percentageDifference) - parseFloat(a.percentageDifference));

    res.status(200).json({ success: true, dayLowBreak: dayLowBreak.slice(0, 30) });
  } catch (error) {
    console.error('Error calculating day low break:', error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// new controller for previousdayVloume
const previousDaysVolume = async (socket) => {
  try {
    // Step 1: Check holiday and market hours
    const now = moment().tz('Asia/Kolkata');
    const hours = now.hours();
    const minutes = now.minutes();
    const isHoliday = await checkHoliday();
    const usePreviousDayClose =
      isHoliday ||
      hours < 9 ||
      (hours === 9 && minutes < 15) ||
      hours > 15 ||
      (hours === 15 && minutes > 40);

    // Step 2: Get the latest two unique trading days
    const uniqueTradingDaysDates = await MarketDetailData.aggregate([
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } },
      { $limit: 2 },
    ]);

    if (!uniqueTradingDaysDates || uniqueTradingDaysDates.length < 2) {
      return { success: false, message: "Not enough trading days available" };
    }

    const latestDate = uniqueTradingDaysDates[0]._id;
    const previousDayDate = uniqueTradingDaysDates[1]._id;

    // Step 3: Fetch today's data
    let todayData = await MarketDetailData.find(
      { date: latestDate },
      {
        securityId: 1,
        data: 1,
        _id: 0,
      }
    ).lean();

    if (todayData.length === 0) {
      // Fetch previous day's data if today's data is unavailable
      todayData = await MarketDetailData.find(
        { date: previousDayDate },
        {
          securityId: 1,
          data: 1,
          _id: 0,
        }
      ).lean();

      if (todayData.length === 0) {
        return { success: false, message: "No stock data available for recent dates" };
      }
    }

    // Step 4: Determine dayClose source
    let closeData = todayData;
    let closeDate = latestDate;

    if (usePreviousDayClose) {
      const previousDayEntry = await MarketDetailData.findOne(
        { date: { $lt: latestDate } },
        { date: 1 }
      )
        .sort({ date: -1 })
        .lean();

      if (!previousDayEntry) {
        return { success: false, message: "No previous stock data available" };
      }

      closeDate = previousDayEntry.date;
      closeData = await MarketDetailData.find(
        { date: closeDate },
        {
          securityId: 1,
          data: 1,
          _id: 0,
        }
      ).lean();
    }

    const closeMap = new Map();
    closeData.forEach((entry) => {
      closeMap.set(entry.securityId, entry.data?.[0]?.dayClose || 0);
    });

    // Step 5: Fetch historical data in batches
    const batchSize = 1080;
    let previousData = [];
    let batchIndex = 0;
    let hasMore = true;

    while (hasMore) {
      const batch = await MarketDetailData.aggregate([
        { $match: { date: { $lt: latestDate } } },
        { $sort: { date: -1 } },
        { $skip: batchIndex * batchSize },
        { $limit: batchSize },
        {
          $project: {
            securityId: 1,
            data: 1,
            date: 1,
            _id: 0,
          },
        },
      ]);

      if (batch.length === 0) {
        hasMore = false;
      } else {
        previousData = previousData.concat(batch);
        batchIndex++;
      }
    }

    if (!previousData.length) {
      return { success: false, message: "No previous stock data available" };
    }

    // Step 6: Fetch previous day's data
    const yesterdayData = await MarketDetailData.find(
      { date: previousDayDate },
      {
        securityId: 1,
        data: 1,
        _id: 0,
      }
    ).lean();

    const prevDayDataMap = new Map();
    yesterdayData.forEach((data) => {
      prevDayDataMap.set(data.securityId, data);
    });

    // Step 7: Fetch stock details
    const stocksDetail = await StocksDetail.find(
      {},
      {
        SECURITY_ID: 1,
        UNDERLYING_SYMBOL: 1,
        SYMBOL_NAME: 1,
        DISPLAY_NAME: 1,
        _id: 0,
      }
    ).lean();

    const stocksDetailsMap = new Map();
    stocksDetail.forEach((stock) => {
      stocksDetailsMap.set(stock.SECURITY_ID, {
        UNDERLYING_SYMBOL: stock.UNDERLYING_SYMBOL,
        SYMBOL_NAME: stock.SYMBOL_NAME,
        DISPLAY_NAME: stock.DISPLAY_NAME,
      });
    });

    // Step 8: Calculate previous volumes
    let previousVolumesMap = {};
    previousData.forEach(({ securityId, data }) => {
      const volume = data?.[0]?.volume || 0;
      if (!previousVolumesMap[securityId]) {
        previousVolumesMap[securityId] = [];
      }
      previousVolumesMap[securityId].push(volume);
    });

    // Step 9: Process data and update xElement
    let bulkUpdates = [];
    const combinedData = todayData.map(({ securityId, data }) => {
      const todayVolume = data?.[0]?.volume || 0;
      const latestTradedPrice = data?.[0]?.latestTradedPrice || 0;
      const dayClose = closeMap.get(securityId) || 0;
      const todayOpen = data?.[0]?.dayOpen || 0;

      const stock = stocksDetailsMap.get(securityId);
      const previousDayData = prevDayDataMap.get(securityId);
      const previousDayClose = previousDayData?.data?.[0]?.dayClose || 0;

      const percentageChange = dayClose
        ? ((latestTradedPrice - dayClose) / dayClose) * 100
        : 0;

      const volumeHistory = previousVolumesMap[securityId] || [];
      const totalPreviousVolume = volumeHistory.reduce(
        (sum, vol) => sum + vol,
        0
      );
      const averagePreviousVolume = volumeHistory.length
        ? totalPreviousVolume / volumeHistory.length
        : 0;

      const xElement =
        averagePreviousVolume > 0 ? todayVolume / averagePreviousVolume : 0;

      bulkUpdates.push({
        updateOne: {
          filter: { securityId, date: latestDate },
          update: { $set: { xelement: xElement } },
        },
      });

      return {
        securityId,
        todayVolume,
        stock,
        totalPreviousVolume,
        averagePreviousVolume,
        xElement,
        percentageChange: parseFloat(percentageChange.toFixed(2)),
      };
    });

    // Step 10: Perform bulk update
    if (bulkUpdates.length > 0) {
      await MarketDetailData.bulkWrite(bulkUpdates);
    }

    // Sort by xElement and return top 30
    combinedData.sort((a, b) => b.xElement - a.xElement);

    return { success: true, combinedData: combinedData.slice(0, 30) };
  } catch (error) {
    console.error('Error calculating volume data:', error);
    return { success: false, message: "Error in calculating volume data", error: error.message };
  }
};

const sectorStockData = async (req, res) => {
  try {
    // Step 1: Check holiday and market hours
    const now = moment().tz('Asia/Kolkata');
    const hours = now.hours();
    const minutes = now.minutes();
    const isHoliday = await checkHoliday();
    const usePreviousDayClose =
      isHoliday ||
      hours < 9 ||
      (hours === 9 && minutes < 15) ||
      hours > 15 ||
      (hours === 15 && minutes > 40);

    // Step 2: Find the latest stock entry date
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date")
      .lean();

    if (!latestEntry) {
      return res.status(404).json({ success: false, message: "No stock data available" });
    }

    let latestDate = latestEntry.date;

    // Step 3: Get latest stock data
    let latestData = await MarketDetailData.find({ date: latestDate }).lean();

    if (latestData.length === 0) {
      // Fetch previous day's data if today's data is unavailable
      const previousDayEntry = await MarketDetailData.findOne(
        { date: { $lt: latestDate } }
      )
        .sort({ date: -1 })
        .select("date")
        .lean();

      if (!previousDayEntry) {
        return res.status(404).json({
          success: false,
          message: "No previous stock data available",
        });
      }

      latestDate = previousDayEntry.date;
      latestData = await MarketDetailData.find({ date: latestDate }).lean();
      if (latestData.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No stock data available for the previous date",
        });
      }
    }

    // Step 4: Determine dayClose source
    let closeData = latestData;
    let closeDate = latestDate;

    if (usePreviousDayClose) {
      const previousDayEntry = await MarketDetailData.findOne(
        { date: { $lt: latestDate } }
      )
        .sort({ date: -1 })
        .select("date")
        .lean();

      if (!previousDayEntry) {
        return res.status(404).json({
          success: false,
          message: "No previous stock data available",
        });
      }

      closeDate = previousDayEntry.date;
      closeData = await MarketDetailData.find(
        { date: closeDate },
        {
          securityId: 1,
          data: 1,
          _id: 0,
        }
      ).lean();
    }

    const closeMap = new Map();
    closeData.forEach((entry) => {
      closeMap.set(entry.securityId, entry.data?.[0]?.dayClose || 0);
    });

    // Step 5: Fetch stock details
    const stocksDetail = await StocksDetail.find(
      {},
      {
        SECURITY_ID: 1,
        INDEX: 1,
        SECTOR: 1,
        UNDERLYING_SYMBOL: 1,
        _id: 0,
      }
    ).lean();

    if (!stocksDetail || stocksDetail.length === 0) {
      return res.status(404).json({ success: false, message: "No stock details available" });
    }

    // Step 6: Create stock details map
    const stockMap = new Map();
    stocksDetail.forEach((entry) => {
      stockMap.set(entry.SECURITY_ID, {
        INDEX: entry.INDEX || [],
        SECTOR: entry.SECTOR || [],
        UNDERLYING_SYMBOL: entry.UNDERLYING_SYMBOL,
      });
    });

    // Step 7: Process stock data
    const combinedData = latestData.map((entry) => {
      const { securityId, data, xelement } = entry;
      const todayOpen = data?.[0]?.dayOpen || 0;
      const latestTradedPrice = data?.[0]?.latestTradedPrice || 0;
      const dayClose = closeMap.get(securityId) || 0;
      const stockData = stockMap.get(securityId) || { INDEX: [], SECTOR: [] };
      const volume = data?.[0]?.volume || 0;

      const percentageChange = dayClose
        ? parseFloat(((latestTradedPrice - dayClose) / dayClose) * 100).toFixed(2)
        : 0;

      const sectors = Array.isArray(stockData.SECTOR)
        ? stockData.SECTOR
        : [stockData.SECTOR];
      const indices = Array.isArray(stockData.INDEX)
        ? stockData.INDEX
        : [stockData.INDEX];

      return {
        securityId,
        yesterdayClose: dayClose,
        volume,
        percentageChange,
        xelement,
        ...stockData,
        SECTOR: sectors.filter(Boolean),
        INDEX: indices.filter(Boolean),
      };
    });

    // Step 8: Organize data sector-wise and index-wise
    const sectorWiseData = {};

    combinedData.forEach((stock) => {
      stock.SECTOR.forEach((sector) => {
        if (!sectorWiseData[sector]) sectorWiseData[sector] = [];
        sectorWiseData[sector].push(stock);
      });

      stock.INDEX.forEach((index) => {
        if (!sectorWiseData[index]) sectorWiseData[index] = [];
        sectorWiseData[index].push(stock);
      });
    });

    Object.keys(sectorWiseData).forEach((key) => {
      sectorWiseData[key] = sectorWiseData[key]
        .sort((a, b) => b.xelement - a.xelement)
        .slice(0, 20);
    });

    res.status(200).json({
      success: true,
      latestDate,
      previousDayDate: closeDate,
      sectorWiseData,
    });
  } catch (error) {
    console.error('Error fetching sector stock data:', error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export {
  getStocks,
  getStocksData,
  getTopGainersAndLosers,
  getDayHighBreak,
  getDayLowBreak,
  previousDaysVolume,
  sectorStockData,
};
