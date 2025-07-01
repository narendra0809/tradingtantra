// import { isMarketTime } from "../jobs/workers/FiveMinData.js";
// import IndexCandles from "../models/indexCandles.model.js";
import { getFormattedTime } from "../utils/dateUtils.js";

// export const getAllIndexPoints = async (req, res) => {
//   const now = new Date();
//   const dayOfWeek = now.getDay();

//   let currentDateObj, previousDateObj;

//   if (dayOfWeek === 0) {
//     currentDateObj = new Date(now);
//     currentDateObj.setDate(now.getDate() - 2);
//     previousDateObj = new Date(currentDateObj);
//     previousDateObj.setDate(currentDateObj.getDate() - 1);
//   } else if (dayOfWeek === 6) {
//     currentDateObj = new Date(now);
//     currentDateObj.setDate(now.getDate() - 1);
//     previousDateObj = new Date(currentDateObj);
//     previousDateObj.setDate(currentDateObj.getDate() - 1);
//   } else if (dayOfWeek === 1) {
//     currentDateObj = now;
//     previousDateObj = new Date(now);
//     previousDateObj.setDate(now.getDate() - 3);
//   } else {
//     currentDateObj = now;
//     previousDateObj = getPreviousDate(now);
//   }

//   const currentDateStr = formatDateString(currentDateObj);
//   const previousDateStr = formatDateString(previousDateObj);

//   const formattedTime = isMarketTime() ? getFormattedTime() : "03:27:00 PM";
//   const currentTimestamp = `${currentDateStr}, ${formattedTime}`;
//   const previousTimestamp = `${previousDateStr}, 03:27:00 PM`;

//   const result = await IndexCandles.find({
//     $or: [{ timestamp: previousTimestamp }, { timestamp: currentTimestamp }],
//     interval: "3m",
//   });

//   const indexs = {
//     NIFTY: { currentClose: 0, lastClose: 0 },
//     BANKNIFTY: { currentClose: 0, lastClose: 0 },
//     FINNIFTY: { currentClose: 0, lastClose: 0 },
//     MIDCPNIFTY: { currentClose: 0, lastClose: 0 },
//     SENSEX: { currentClose: 0, lastClose: 0 },
//   };

//   result.forEach((doc) => {
//     if (doc.timestamp === currentTimestamp) {
//       indexs[doc.indexName].currentClose = doc.close;
//     } else if (doc.timestamp === previousTimestamp) {
//       indexs[doc.indexName].lastClose = doc.close;
//     }
//   });

//   const indexPoints = {};
//   for (const [indexName, values] of Object.entries(indexs)) {
//     const pts = Math.round(values.currentClose - values.lastClose);
//     const per =
//       ((values.currentClose - values.lastClose) / values.lastClose) * 100;
//     const newIdx = indexName == "MIDCPNIFTY" ? "MIDCAP" : indexName;
//     indexPoints[newIdx] = {
//       pts,
//       per: per.toFixed(2),
//     };
//   }
//   console.log("IDX PTS  :", indexPoints);
//   res.status(200).json(indexPoints);
// };
import { isMarketTime } from "../jobs/workers/FiveMinData.js";
import IndexCandles from "../models/indexCandles.model.js";
import { formatDateString, getPreviousDate } from "../utils/dateUtils.js";

export const getAllIndexPoints = async (req, res) => {
  // const now = new Date();
  // const dayOfWeek = now.getDay();
  // let currentDateObj, previousDateObj;

  // // Helper function to get the last trading day
  // const getLastTradingDay = (date) => {
  //   const day = date.getDay();
  //   if (day === 0) {
  //     // Sunday: Return Friday
  //     const friday = new Date(date);
  //     friday.setDate(date.getDate() - 2);
  //     return friday;
  //   } else if (day === 6) {
  //     // Saturday: Return Friday
  //     const friday = new Date(date);
  //     friday.setDate(date.getDate() - 1);
  //     return friday;
  //   } else if (day === 1) {
  //     // Monday: Return Friday
  //     const friday = new Date(date);
  //     friday.setDate(date.getDate() - 3);
  //     return friday;
  //   } else {
  //     // Other days: Return previous day
  //     return getPreviousDate(date);
  //   }
  // };
  // const currentDateStr = formatDateString(currentDateObj);
  // const previousDateStr = formatDateString(previousDateObj);
  const now = new Date();
  const dayOfWeek = now.getDay();

  let currentDateObj, previousDateObj;

  if (dayOfWeek === 0) {
    currentDateObj = new Date(now);
    currentDateObj.setDate(now.getDate() - 2);
    previousDateObj = new Date(currentDateObj);
    previousDateObj.setDate(currentDateObj.getDate() - 1);
  } else if (dayOfWeek === 6) {
    currentDateObj = new Date(now);
    currentDateObj.setDate(now.getDate() - 1);
    previousDateObj = new Date(currentDateObj);
    previousDateObj.setDate(currentDateObj.getDate() - 1);
  } else if (dayOfWeek === 1) {
    currentDateObj = now;
    previousDateObj = new Date(now);
    previousDateObj.setDate(now.getDate() - 3);
  } else {
    currentDateObj = now;
    previousDateObj = getPreviousDate(now);
  }

  const currentDateStr = formatDateString(currentDateObj);
  const previousDateStr = formatDateString(previousDateObj);
  // Use 3:27 PM as the default time for both timestamps to ensure consistency
  const currTime = isMarketTime() ? getFormattedTime() : "03:27:00 PM";
  const currentTimestamp = `${currentDateStr}, ${currTime}`;
  const previousTimestamp = `${previousDateStr}, 03:27:00 PM`;

  console.log(currentTimestamp);
  console.log(previousTimestamp);

  const result = await IndexCandles.find({
    $or: [{ timestamp: previousTimestamp }, { timestamp: currentTimestamp }],
    interval: "3m",
  });

  const indexs = {
    NIFTY: { currentClose: 0, lastClose: 0 },
    BANKNIFTY: { currentClose: 0, lastClose: 0 },
    FINNIFTY: { currentClose: 0, lastClose: 0 },
    MIDCPNIFTY: { currentClose: 0, lastClose: 0 },
    SENSEX: { currentClose: 0, lastClose: 0 },
  };

  result.forEach((doc) => {
    if (doc.timestamp === currentTimestamp) {
      indexs[doc.indexName].currentClose = doc.close;
    } else if (doc.timestamp === previousTimestamp) {
      indexs[doc.indexName].lastClose = doc.close;
    }
  });

  console.log("Results : ", result);

  const indexPoints = {};
  for (const [indexName, values] of Object.entries(indexs)) {
    const pts = Math.round(values.currentClose - values.lastClose);
    const per =
      ((values.currentClose - values.lastClose) / values.lastClose) * 100;
    const newIdx = indexName === "MIDCPNIFTY" ? "MIDCAP" : indexName;
    indexPoints[newIdx] = {
      pts,
      per: per.toFixed(2),
    };
  }
  console.log("IDX PTS  :", indexPoints);
  res.status(200).json(indexPoints);
};
