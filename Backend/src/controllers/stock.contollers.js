import MarketDetailData from "../models/marketData.model.js";
import StocksDetail from "../models/stocksDetail.model.js";

// 1. Basic stock list retrieval
const getStocks = async (req, res) => {
  try {
    const stocks = await StocksDetail.find();
    res.status(stocks.length ? 200 : 404).json(
      stocks.length 
        ? stocks 
        : { message: "No stocks found" }
    );
  } catch (error) {
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

// 2. Main stock data with same-day calculations
const getStocksData = async () => {
  try {
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date")
      .lean();

    if (!latestEntry) return { success: false, message: "No stock data available" };

    const stocksData = await MarketDetailData.find({ date: latestEntry.date }).lean();
    if (!stocksData.length) return { 
      success: false, 
      message: "No data for latest date" 
    };

    const stockDetails = await StocksDetail.find(
      { SECURITY_ID: { $in: stocksData.map(e => e.securityId) } },
      { _id: 0, SECURITY_ID: 1, UNDERLYING_SYMBOL: 1, SYMBOL_NAME: 1, DISPLAY_NAME: 1, INDEX: 1, SECTOR: 1 }
    ).lean();

    const stockDetailsMap = new Map(stockDetails.map(s => [s.SECURITY_ID, s]));

    const response = stocksData.map(stock => {
      const detail = stockDetailsMap.get(stock.securityId) || {};
      const latestPrice = stock?.data?.[0]?.latestTradedPrice || 0;
      const dayClose = stock?.data?.[0]?.dayClose || 0;
      const changePercentage = dayClose ? 
        parseFloat((((latestPrice - dayClose) / dayClose) * 100).toFixed(2)) : 0;

      return {
        SECURITY_ID: stock.securityId,
        INDEX: detail.INDEX || "N/A",
        SECTOR: detail.SECTOR || "N/A",
        UNDERLYING_SYMBOL: detail.UNDERLYING_SYMBOL || "N/A",
        SYMBOL_NAME: detail.SYMBOL_NAME || "N/A",
        DISPLAY_NAME: detail.DISPLAY_NAME || "N/A",
        latestPrice,
        previousClose: dayClose,
        turnover: stock.turnover,
        changePercentage,
        xElement: stock.xelement
      };
    });

    return { 
      success: true, 
      data: response.sort((a, b) => b.turnover - a.turnover).slice(0, 30) 
    };
  } catch (error) {
    return { 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    };
  }
};

// 3. Top gainers and losers (same-day version)
const getTopGainersAndLosers = async () => {
  try {
    const latestEntry = await MarketDetailData.findOne().sort({ date: -1 });
    if (!latestEntry) return { success: false, message: "No stock data available" };

    const latestData = await MarketDetailData.find({ date: latestEntry.date });
    if (!latestData.length) return { 
      success: false, 
      message: "No data for latest date" 
    };

    const stockDetails = await StocksDetail.find(
      { SECURITY_ID: { $in: latestData.map(e => e.securityId) } },
      { UNDERLYING_SYMBOL: 1, SYMBOL_NAME: 1, SECURITY_ID: 1, INDEX: 1, SECTOR: 1 }
    );

    const stockMap = new Map(stockDetails.map(s => [s.SECURITY_ID, s]));

    const results = latestData.map(entry => {
      const detail = stockMap.get(entry.securityId) || {};
      const latestPrice = entry.data?.latestTradedPrice?.[0] || 0;
      const dayClose = entry.data?.dayClose?.[0] || 0;
      const change = dayClose ? 
        parseFloat((((latestPrice - dayClose) / dayClose) * 100).toFixed(2)) : 0;

      return {
        securityId: entry.securityId,
        stockSymbol: detail.UNDERLYING_SYMBOL || "N/A",
        stockName: detail.SYMBOL_NAME || "N/A",
        sector: detail.SECTOR || "N/A",
        index: detail.INDEX || "N/A",
        lastTradePrice: latestPrice,
        previousClosePrice: dayClose,
        percentageChange: change,
        turnover: entry.turnover,
        xElement: entry.xelement
      };
    });

    const gainers = results
      .filter(r => r.percentageChange > 0)
      .sort((a, b) => b.percentageChange - a.percentageChange)
      .slice(0, 30);

    const losers = results
      .filter(r => r.percentageChange < 0)
      .sort((a, b) => a.percentageChange - b.percentageChange)
      .slice(0, 30);

    return { success: true, topGainers: gainers, topLosers: losers };
  } catch (error) {
    return { 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    };
  }
};

// 4. Day high breakouts (same-day version)
const getDayHighBreak = async () => {
  try {
    const latestEntry = await MarketDetailData.findOne().sort({ date: -1 });
    if (!latestEntry) return { success: false, message: "No data available" };

    const todayData = await MarketDetailData.find({ date: latestEntry.date });
    if (!todayData.length) return { 
      success: false, 
      message: "No data for latest date" 
    };

    const stocksDetail = await StocksDetail.find();
    if (!stocksDetail.length) return { 
      success: false, 
      message: "No stock details available" 
    };

    const dayHighBreaks = todayData
      .map(data => {
        const latestPrice = data.data?.latestTradedPrice?.[0] || 0;
        const dayHigh = data.data?.dayHigh?.[0] || 0;
        const dayClose = data.data?.dayClose?.[0] || 0;
        const threshold = dayHigh * 0.005;

        if (latestPrice >= dayHigh - threshold) {
          const stock = stocksDetail.find(s => s.SECURITY_ID === data.securityId);
          if (!stock) return null;

          const percentageChange = dayClose ? 
            ((latestPrice - dayClose) / dayClose * 100).toFixed(2) : 0;
          const percentageDifference = 
            ((dayHigh - latestPrice) / latestPrice * 100).toFixed(2);

          return {
            securityId: data.securityId,
            latestPrice,
            dayHigh,
            turnover: data.turnover,
            xElement: data.xelement,
            stock: {
              UNDERLYING_SYMBOL: stock.UNDERLYING_SYMBOL,
              SYMBOL_NAME: stock.SYMBOL_NAME,
              DISPLAY_NAME: stock.DISPLAY_NAME,
              SECTOR: stock.SECTOR,
              INDEX: stock.INDEX
            },
            percentageChange,
            percentageDifference
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.percentageDifference - b.percentageDifference)
      .slice(0, 30);

    return { success: true, dayHighBreak: dayHighBreaks };
  } catch (error) {
    return { 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    };
  }
};

// 5. Day low breakouts (same-day version)
const getDayLowBreak = async () => {
  try {
    const latestEntry = await MarketDetailData.findOne().sort({ date: -1 });
    if (!latestEntry) return { success: false, message: "No data available" };

    const todayData = await MarketDetailData.find({ date: latestEntry.date });
    if (!todayData.length) return { 
      success: false, 
      message: "No data for latest date" 
    };

    const stocksDetail = await StocksDetail.find();
    if (!stocksDetail.length) return { 
      success: false, 
      message: "No stock details available" 
    };

    const dayLowBreaks = todayData
      .map(data => {
        const latestPrice = data.data?.latestTradedPrice?.[0] || 0;
        const dayLow = data.data?.dayLow?.[0] || 0;
        const dayClose = data.data?.dayClose?.[0] || 0;
        const threshold = dayLow * 0.005;

        if (latestPrice <= dayLow + threshold) {
          const stock = stocksDetail.find(s => s.SECURITY_ID === data.securityId);
          if (!stock) return null;

          const percentageChange = dayClose ? 
            ((latestPrice - dayClose) / dayClose * 100).toFixed(2) : 0;
          const percentageDifference = 
            ((dayLow - latestPrice) / latestPrice * 100).toFixed(2);

          return {
            securityId: data.securityId,
            latestPrice,
            dayLow,
            turnover: data.turnover,
            xElement: data.xelement,
            stock: {
              UNDERLYING_SYMBOL: stock.UNDERLYING_SYMBOL,
              SYMBOL_NAME: stock.SYMBOL_NAME,
              DISPLAY_NAME: stock.DISPLAY_NAME,
              SECTOR: stock.SECTOR,
              INDEX: stock.INDEX
            },
            percentageChange,
            percentageDifference
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b.percentageDifference - a.percentageDifference)
      .slice(0, 30);

    return { success: true, dayLowBreak: dayLowBreaks };
  } catch (error) {
    return { 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    };
  }
};

// 6. Volume analysis (same-day version)

const previousDaysVolume = async (socket) => {
  try {
    const uniqueTradingDaysDates = await MarketDetailData.aggregate([
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } },
      { $limit: 2 },
    ]);

    console.log(uniqueTradingDaysDates, "unique");
    if (!uniqueTradingDaysDates || uniqueTradingDaysDates.length < 2) {
      return { success: false, message: "No stock data available" };
    }

    const latestDate = uniqueTradingDaysDates[0]._id;
    const previousDayDate = uniqueTradingDaysDates[1]._id;

    const todayData = await MarketDetailData.find(
      { date: latestDate },
      {
        securityId: 1,
        data: 1,
        _id: 0,
      }
    );

    // console.log('todatdata',todayData)

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

    const yesterdayData = await MarketDetailData.find(
      { date: previousDayDate },
      {
        securityId: 1,
        data: 1,
        _id: 0,
      }
    );

    const prevDayDataMap = new Map();
    yesterdayData.forEach((data) => {
      prevDayDataMap.set(data.securityId, data);
    });

    const stocksDetail = await StocksDetail.find(
      {},
      {
        SECURITY_ID: 1,
        UNDERLYING_SYMBOL: 1,
        SYMBOL_NAME: 1,
        DISPLAY_NAME: 1,
        _id: 0,
      }
    );

    const stocksDetailsMap = new Map();
    stocksDetail.forEach((stock) => {
      stocksDetailsMap.set(stock.SECURITY_ID, {
        UNDERLYING_SYMBOL: stock.UNDERLYING_SYMBOL,
        SYMBOL_NAME: stock.SYMBOL_NAME,
        DISPLAY_NAME: stock.DISPLAY_NAME,
      });
    });

    let previousVolumesMap = {};
    previousData.forEach(({ securityId, data }) => {
      const volume = data?.[0]?.volume || 0;

      if (!previousVolumesMap[securityId]) {
        previousVolumesMap[securityId] = [];
      }
      previousVolumesMap[securityId].push(volume);
    });

    let bulkUpdates = [];
    // console.log(todayData,'today')
    const combinedData = todayData.map(({ securityId, data }) => {
      const todayVolume = data?.volume?.[0] || 0;
      // console.log(todayVolume,'today')
      const latestTradedPrice = data?.latestTradedPrice?.[0] || 0;
      const dayclosey = data?.dayClose?.[0] || 0;
      const todayOpen = data?.dayOpen?.[0] || 0;

      const stock = stocksDetailsMap.get(securityId);
      const previousDayData = prevDayDataMap.get(securityId);
      const previousDayClose = previousDayData?.data?.dayClose?.[0] || 0;

      const percentageChange = dayclosey
        ? ((latestTradedPrice - dayclosey) / dayclosey) * 100
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
        percentageChange,
      };
    });

    if (bulkUpdates.length > 0) {
      await MarketDetailData.bulkWrite(bulkUpdates);
    }
    // Sort combinedData by xElement in descending order
    combinedData.sort((a, b) => b.xElement - a.xElement);

    return { success: true, combinedData: combinedData.slice(0, 30) };
  } catch (error) {
    // console.error(error, 'pd reeoe');
    return { success: false, message: "Error in calculating volume data" };
  }
};

// 7. Sector-wise analysis (same-day version)
const sectorStockData = async (req, res) => {
  try {
    // 1️⃣ Find the latest stock entry date
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date");
    if (!latestEntry) return { message: "No stock data available" };
    // res.status(404).json({ message: "No stock data available" });

    const latestDate = latestEntry.date;
    // console.log("Latest available date:", latestDate);

    // 2️⃣ Get latest stock data for the latest date
    const latestData = await MarketDetailData.find({ date: latestDate });
    if (latestData.length === 0) {
      return { message: "No stock data available for the latest date" };
    }

    // 3️⃣ Find previous day's stock data
    const previousDayEntry = await MarketDetailData.findOne({
      date: { $lt: latestDate },
    }).sort({ date: -1 });

    if (!previousDayEntry)
      return { message: "No previous stock data available" };

    const previousDayDate = previousDayEntry.date;

    const yesterdayData = await MarketDetailData.find(
      {
        date: previousDayDate,
      },
      {
        securityId: 1,
        data: 1,
        _id: 0,
      }
    );

    // 4️⃣ Create a map of yesterday's closing prices
    const yesterdayMap = new Map();
    yesterdayData.forEach((entry) => {
      yesterdayMap.set(entry.securityId, entry.data?.dayClose[0] || 0);
    });

    // 5️⃣ Fetch stock details (sector, index, etc.)
    const stocksDetail = await StocksDetail.find(
      {},
      {
        SECURITY_ID: 1,
        INDEX: 1,
        SECTOR: 1,
        UNDERLYING_SYMBOL: 1,
        _id: 0,
      }
    );
    if (!stocksDetail) {
      return { message: "No stock details available" };
    }

    // 6️⃣ Create a stock details map
    const stockmap = new Map();
    stocksDetail.forEach((entry) => {
      stockmap.set(entry.SECURITY_ID, {
        INDEX: entry.INDEX || [],
        SECTOR: entry.SECTOR || [],
        UNDERLYING_SYMBOL: entry.UNDERLYING_SYMBOL,
      });
    });

    // 7️⃣ Process stock data
    const combinedData = latestData.map((entry) => {
      const { securityId, data, xelement } = entry;
      const todayopen = data?.dayOpen || 0;
      const latestTradedPrice = data?.latestTradedPrice[0] || 0;
      const yesterdayClose = data?.dayClose[0] || 0;
      const stockdata = stockmap.get(securityId) || { INDEX: [], SECTOR: [] };
      const volume = data?.volume || 0;
      const sectors = Array.isArray(stockdata.SECTOR)
        ? stockdata.SECTOR
        : [stockdata.SECTOR];
      const indices = Array.isArray(stockdata.INDEX)
        ? stockdata.INDEX
        : [stockdata.INDEX];

      // Calculate percentage change
      const percentageChange = todayopen
        ? ((latestTradedPrice - yesterdayClose) / yesterdayClose) * 100
        : 0;

      return {
        securityId,
        yesterdayClose,
        volume,
        percentageChange,
        xelement,
        ...stockdata,
        SECTOR: sectors.filter(Boolean), // Remove null/undefined values
        INDEX: indices.filter(Boolean), // Remove null/undefined values
      };
    });

    // 8️⃣ Organize data sector-wise and index-wise
    const sectorWiseData = {};

    combinedData.forEach((stock) => {
      // Categorize by SECTOR
      stock.SECTOR.forEach((sector) => {
        if (!sectorWiseData[sector]) sectorWiseData[sector] = [];
        sectorWiseData[sector].push(stock);
      });

      // Categorize by INDEX
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
    return {
      success: true,
      latestDate,
      previousDayDate,
      sectorWiseData,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Server error", error };
    // res.status(500).json({ message: "Server error", error });
  }
};

export {
  getStocks,
  getStocksData,
  getTopGainersAndLosers,
  getDayHighBreak,
  getDayLowBreak,
  previousDaysVolume,
  sectorStockData
};