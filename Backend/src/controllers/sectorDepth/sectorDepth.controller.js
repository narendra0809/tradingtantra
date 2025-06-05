import MarketDetailData from "../../models/marketData.model.js";
import StocksDetail from "../../models/stocksDetail.model.js";

export const sectorDepth = async (req, res) => {
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
      yesterdayMap.set(entry.securityId, entry.data?.latestTradedPrice[0] || 0);
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
    res.send({
      success: true,
      latestDate,
      previousDayDate,
      sectorWiseData,
    });
  } catch (error) {
    console.error(error);
    return { success: false, message: "Server error", error };
    // res.status(500).json({ message: "Server error", error });
  }
};
