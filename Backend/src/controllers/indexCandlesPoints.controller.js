import { isMarketTime } from "../jobs/workers/FiveMinData.js";
import IndexCandles from "../models/indexCandles.model.js";
import {
  formatDateString,
  getFormattedTime,
  getPreviousDate,
} from "../utils/dateUtils.js";

export const getAllIndexPoints = async (req, res) => {
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

  const formattedTime = isMarketTime() ? getFormattedTime() : "03:27:00 PM";
  const currentTimestamp = `${currentDateStr}, ${formattedTime}`;
  const previousTimestamp = `${previousDateStr}, 03:27:00 PM`;

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

  const indexPoints = {};
  for (const [indexName, values] of Object.entries(indexs)) {
    const pts = Math.round(values.currentClose - values.lastClose);
    const per =
      ((values.currentClose - values.lastClose) / values.lastClose) * 100;
    const newIdx = indexName == "MIDCPNIFTY" ? "MIDCAP" : indexName;
    indexPoints[newIdx] = {
      pts,
      per: per.toFixed(2),
    };
  }
  console.log("IDX PTS  :", indexPoints);
  res.status(200).json(indexPoints);
};
