import MarketDetailData from "../models/marketData.model.js";
import StocksDetail from "../models/stocksDetail.model.js";

const getStocks = async (req, res) => {
  try {
    const stocks = await StocksDetail.find();

    if (!stocks) {
      return res.status(404).json({ message: "No stocks found" });
    }
    res.status(200).json(stocks);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// new logic that return previous data if today data not avail for turnover with optimized code
const getStocksData = async () => {
  try {
    // Step 1: Get the latest **unique** date
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 })
      .select("date")
      .lean();

    if (!latestEntry) {
      return { success: false, message: "No stock data available" };
    }
    // console.log("latestEntry", latestEntry);

    const latestDate = latestEntry.date;

    // Step 2: Find the **most recent past available date** (ignoring holidays)
    let previousDayDate = null;

    const previousDayEntry = await MarketDetailData.findOne(
      { date: { $lt: latestDate } } // Find entry before latest date
    )
      .sort({ date: -1 }) // Sort again to get the latest available past entry
      .select("date")
      .lean();

    if (!previousDayEntry) {
      return { success: false, message: "No previous data found!" };
    }

    if (previousDayEntry) {
      previousDayDate = previousDayEntry.date;
    }

    // Step 3: Fetch stock data for the latest date
    const stocksData = await MarketDetailData.find({ date: latestDate }).lean();

    if (!stocksData.length) {
      return {
        success: false,
        message: "No stock data available for the latest date",
      };
    }

    // Step 4: Fetch previous day's stock data (if available)
    let previousDayMap = new Map();
    if (previousDayDate) {
      const previousDayData = await MarketDetailData.find({
        date: previousDayDate,
      }).lean();
      previousDayMap = new Map(
        previousDayData.map((stock) => [stock.securityId, stock])
      );
    }

    console.log("emekdeb🙌");
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
      const previousStock = previousDayMap.get(stock.securityId);
      const dayClose = previousStock?.data?.[0].dayClose;
      const latestTradePrice = stock?.data?.[0].latestTradedPrice;

      // Change Percentage Calculation
      const changePercentage =
        dayClose && dayClose !== 0
          ? parseFloat(
              (((latestTradePrice - dayClose) / dayClose) * 100).toFixed(2)
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
      .sort((a, b) => b.turnover - a.turnover)
      .slice(0, 30);

    return { success: true, message: "Stock data retrieved", data: sortedData };
  } catch (error) {
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
    // Step 1: Find the most recent available date
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 }) // Get the latest date
      .select("date");

    if (!latestEntry) {
      return { success: false, message: "No stock data available" };
    }

    const latestDate = latestEntry.date;

    // Step 2: Fetch all data for the latest available date
    const latestData = await MarketDetailData.find({ date: latestDate });

    if (latestData.length === 0) {
      return {
        success: false,
        message: "No stock data available for the latest date",
      };
    }

    // Step 3: Find the most recent previous available date
    const previousDayEntry = await MarketDetailData.findOne(
      { date: { $lt: latestDate } },
      { date: 1 }
    ).sort({ date: -1 });

    if (!previousDayEntry) {
      return { success: false, message: "No previous stock data available" };
    }

    const previousDayDate = previousDayEntry.date;

    // Fetch previous day's stock data
    const yesterdayData = await MarketDetailData.find({
      date: previousDayDate,
    });

    // Step 4: Map previous day's closing prices
    const yesterdayMap = new Map();
    yesterdayData.forEach((entry) => {
      yesterdayMap.set(entry.securityId, entry.data?.dayClose[0] || 0);
    });

    const gainers = [];
    const losers = [];

    // Step 5: Get stock details
    const stockIds = latestData.map((entry) => entry.securityId);
    const stockDetailsMap = new Map();

    const stockDetails = await StocksDetail.find(
      { SECURITY_ID: { $in: stockIds } },
      {
        UNDERLYING_SYMBOL: 1,
        SYMBOL_NAME: 1,
        SECURITY_ID: 1,
        INDEX: 1,
        SECTOR: 1,
      }
    );

    stockDetails.forEach((stock) => {
      stockDetailsMap.set(stock.SECURITY_ID, stock);
    });

    // Step 6: Compute gainers & losers
    latestData.forEach((todayEntry) => {
      const prevClose = yesterdayMap.get(todayEntry.securityId);
      if (!prevClose || prevClose === 0) return;

      const latestPrice = todayEntry.data?.latestTradedPrice[0] || 0;

      if (latestPrice === 0) return;
      const percentageChange =
        prevClose && prevClose !== 0
          ? parseFloat(
              (((latestPrice - prevClose) / prevClose) * 100).toFixed(2)
            )
          : 0;
      const stockDetail = stockDetailsMap.get(todayEntry.securityId) || {};
      const result = {
        securityId: todayEntry.securityId,
        stockSymbol: stockDetail.UNDERLYING_SYMBOL || "N/A",
        stockName: stockDetail.SYMBOL_NAME || "N/A",
        sector: stockDetail.SECTOR || "N/A",
        index: stockDetail.INDEX || "N/A",
        lastTradePrice: latestPrice,
        previousClosePrice: prevClose,
        percentageChange: percentageChange.toFixed(2),
        turnover: todayEntry.turnover,
        xElement: todayEntry.xelement,
      };

      if (percentageChange > 0) {
        gainers.push(result);
      } else {
        losers.push(result);
      }
    });

    gainers.sort((a, b) => b.percentageChange - a.percentageChange);
    losers.sort((a, b) => a.percentageChange - b.percentageChange);

    return {
      success: true,
      topGainers: gainers.slice(0, 30),
      topLosers: losers.slice(0, 30),
    };
  } catch (error) {
    console.error("Error fetching top gainers & losers:", error);
    return {
      success: false,
      message: "Error fetching top gainers & losers",
      error: error.message,
    };
  }
};

// give the previous data if today data not avail
const getDayHighBreak = async (req, res) => {
  try {
    // Step 1: Find the most recent date available in the database
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 }) // Get the latest date
      .select("date");

    if (!latestEntry) {
      return { message: "Not enough data to calculate day high break" };
    }

    const latestDate = latestEntry.date;

    // Step 2: Fetch all entries that match this date
    const todayData = await MarketDetailData.find({ date: latestDate });

    if (todayData.length === 0) {
      return { message: "No data available for the latest saved date" };
    }
    const previousDayEntry = await MarketDetailData.findOne(
      { date: { $lt: latestDate } },
      { date: 1 }
    ).sort({ date: -1 });

    if (!previousDayEntry) {
      return { success: false, message: "No previous stock data available" };
    }

    const previousDayDate = previousDayEntry.date;

    // Fetch previous day's stock data
    const previousDayData = await MarketDetailData.find({
      date: previousDayDate,
    });
    const yesterdayMap = new Map();
    previousDayData.forEach((entry) => {
      yesterdayMap.set(entry.securityId, entry.data?.dayClose?.[0] || 0);
    });
    const stocksDetail = await StocksDetail.find();

    if (!stocksDetail) {
      return {
        success: false,
        message: "Not enough data to calculate day high break",
      };
    }
    let filteredData = todayData.map((data) => ({
      latestPrice: parseFloat(data.data.latestTradedPrice[0].toFixed(2)),
      dayHigh: parseFloat(data.data.dayHigh?.[0].toFixed(2)),
      securityId: data.securityId,
      turnover: data.turnover,
      todayOpen: parseFloat(data.data.dayOpen?.[0].toFixed(2)),
      xElement: data.xelement,
    }));
    const dayHighBreak = filteredData
      .map((data) => {
        const dayHigh = data.dayHigh;
        const changePrice = dayHigh * 0.005;
        const latestPrice = data.latestPrice;
        const dayClose = yesterdayMap.get(data.securityId);
        if (latestPrice >= dayHigh - changePrice) {
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
            } = stock.toObject();

            const percentageChange = (
              ((latestPrice - dayClose) / dayClose) *
              100
            ).toFixed(2);

            const percentageDifference = (
              ((dayHigh - latestPrice) / latestPrice) *
              100
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
      .sort((a, b) => a.percentageDifference - b.percentageDifference);

    return { success: true, dayHighBreak: dayHighBreak.slice(0, 30) };
  } catch (error) {
    // console.log(error);
    return { message: "Server error", error: error.message };
  }
};

// give the previous data if today data not avail
const getDayLowBreak = async (req, res) => {
  try {
    // Step 1: Find the most recent date available in the database
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 }) // Get the latest date
      .select("date");

    if (!latestEntry) {
      return { message: "Not enough data to calculate day low break" };
    }

    const latestDate = latestEntry.date;

    // Step 2: Fetch all entries that match this date
    const todayData = await MarketDetailData.find({ date: latestDate });

    if (todayData.length === 0) {
      return {
        success: false,
        message: "No data available for the latest saved date",
      };
    }

    // console.log("Total entries found for latest date:", todayData.length);
    const previousDayEntry = await MarketDetailData.findOne(
      { date: { $lt: latestDate } },
      { date: 1 }
    ).sort({ date: -1 });

    if (!previousDayEntry) {
      return { success: false, message: "No previous stock data available" };
    }

    const previousDayDate = previousDayEntry.date;

    // Fetch previous day's stock data
    const previousDayData = await MarketDetailData.find({
      date: previousDayDate,
    });
    const yesterdayMap = new Map();
    previousDayData.forEach((entry) => {
      yesterdayMap.set(entry.securityId, entry.data?.dayClose[0] || 0);
    });
    const stocksDetail = await StocksDetail.find();

    if (!stocksDetail) {
      return {
        success: false,
        message: "Not enough data to calculate day low break",
      };
    }

    let filteredData = todayData.map((data) => ({
      latestPrice: parseFloat(data.data.latestTradedPrice?.[0].toFixed(2)),
      dayLow: parseFloat(data.data.dayLow?.[0].toFixed(2)),
      securityId: data.securityId,
      turnover: data.turnover,
      xElement: data.xelement,
    }));

    const dayLowBreak = filteredData
      .map((data) => {
        const changePrice = data.dayLow * 0.005;
        const latestPrice = data.latestPrice;
        const dayLow = data.dayLow;
        const previousClose = yesterdayMap.get(data.securityId);
        if (latestPrice <= dayLow + changePrice) {
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
            } = stock.toObject();

            const percentageChange = (
              ((latestPrice - previousClose) / previousClose) *
              100
            ).toFixed(2);

            const percentageDifference = (
              ((dayLow - latestPrice) / latestPrice) *
              100
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
      .sort((a, b) => b.percentageDifference - a.percentageDifference);
    return { success: true, dayLowBreak: dayLowBreak.slice(0, 30) };
  } catch (error) {
    // console.log(error);
    return { message: "Server error", error: error.message };
  }
};

// new controller for previousdayVloume
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
      const todayOpen = data?.dayOpen?.[0] || 0;

      const stock = stocksDetailsMap.get(securityId);
      const previousDayData = prevDayDataMap.get(securityId);
      const previousDayClose = previousDayData?.data?.dayClose?.[0] || 0;

      const percentageChange = previousDayClose
        ? ((latestTradedPrice - previousDayClose) / previousDayClose) * 100
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
      const yesterdayClose = yesterdayMap.get(securityId) || 0;
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
  sectorStockData,
};
