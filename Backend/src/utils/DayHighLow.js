import MarketDetailData from "../models/marketData.model.js";
import StocksDetail from "../models/stocksDetail.model.js";

const getDayHighBreak = async () => {
  try {
    // Step 1: Find the most recent date available in the database
    const latestEntry = await MarketDetailData.findOne()
      .sort({ date: -1 }) // Get the latest date
      .select("date");

    if (!latestEntry) {
      return ({success:false, message: "Not enough data to calculate day high break" });
    }

    const latestDate = latestEntry.date;
    // console.log("Latest available date:", latestDate);

    // Step 2: Fetch all entries that match this date
    const todayData = await MarketDetailData.find({ date: latestDate });

    if (todayData.length === 0) {
      return ({ message: "No data available for the latest saved date" });
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
      return ({success:false, message: "Not enough data to calculate day high break" });
    }
    let filteredData = todayData.map((data) => ({
      latestPrice: parseFloat(data.data.latestTradedPrice[0].toFixed(2)),
      dayHigh: parseFloat(data.data.dayHigh?.[0].toFixed(2)),
      securityId: data.securityId,
      turnover: data.turnover,
      todayOpen: parseFloat(data.data.dayOpen?.[0].toFixed(2)),
      xElement: data.xelement,
    }));
    // console.log("today data", todayData);
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
              ((dayHigh - latestPrice ) / latestPrice) *
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

    // console.log("dayHighBreak:", dayHighBreak);
    return ({ dayHighBreak });
  } catch (error) {
    // console.log(error);
     return ({ message: "Server error", error: error.message });
  }
};


const getDayLowBreak = async () => {
    try {
      // Step 1: Find the most recent date available in the database
      const latestEntry = await MarketDetailData.findOne()
        .sort({ date: -1 }) // Get the latest date
        .select("date");
  
      if (!latestEntry) {
        return ({ message: "Not enough data to calculate day low break" });
      }
  
      const latestDate = latestEntry.date;
      // console.log("Latest available date:", latestDate);
  
      // Step 2: Fetch all entries that match this date
      const todayData = await MarketDetailData.find({ date: latestDate });
  
      if (todayData.length === 0) {
        return ({ message: "No data available for the latest saved date" });
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
        yesterdayMap.set(entry.securityId, entry.data?.dayClose || 0);
      });
      const stocksDetail = await StocksDetail.find();
  
      if (!stocksDetail) {
        return ({ message: "Not enough data to calculate day low break" });
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
                ((dayLow - latestPrice ) / latestPrice) *
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
        .sort((a, b) => a.percentageChange - b.percentageChange);
  
      // console.log("dayLowBreak:", dayLowBreak);
     return ({ dayLowBreak });
    } catch (error) {
      // console.log(error);
       return ({ message: "Server error", error: error.message });
    }
  };


  export {getDayHighBreak, getDayLowBreak}