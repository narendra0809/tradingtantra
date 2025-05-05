import { Server } from "socket.io";
import {
  getDayHighBreak,
  getDayLowBreak,
  getStocksData,
  getTopGainersAndLosers,
  previousDaysVolume,
  sectorStockData,
} from "../controllers/stock.contollers.js";
import {
  AIIntradayReversalDaily,
  AIIntradayReversalFiveMins,
  AIMomentumCatcherFiveMins,
  AIMomentumCatcherTenMins,
  DailyRangeBreakout,
  DayHighLowReversal,
  twoDayHLBreak,
} from "../controllers/liveMarketData.controller.js";
 import {
  AIContraction,
  dailyCandleReversal,
  fiveDayRangeBreakers,
  tenDayRangeBreakers,
} from "../controllers/swingAnalysis.controllers.js";
import checkSubscription from "../middlewares/checkSubscription.js";
import authenticateSocket from '../middlewares/authenticateSocket.js'

let io;

async function sendData(socket) {
  try {
    //   if (!socket) {
    //     console.error("Socket instance is not available.");
    //     return;
    //   }

    console.log("Fetching and sending stock data...");
    console.log("-----------------------------------");

    const [
      response,
      dayHighBreakResponse,
      getTopGainersAndLosersResponse,
      dayLowBreakResponse,
      previousDaysVolumeResponse,
    ] = await Promise.allSettled([
      getStocksData(),
      getDayHighBreak(),
      getTopGainersAndLosers(),
      getDayLowBreak(),
      previousDaysVolume(socket),
    ]);

    if (response.status === "fulfilled") io.emit("turnOver", response.value);

    if (dayHighBreakResponse.status === "fulfilled")
      io.emit("dayHighBreak", dayHighBreakResponse.value);
    if (getTopGainersAndLosersResponse.status === "fulfilled")
      io.emit("getTopGainersAndLosers", getTopGainersAndLosersResponse.value);
    if (dayLowBreakResponse.status === "fulfilled")
      io.emit("dayLowBreak", dayLowBreakResponse.value);
    if (previousDaysVolumeResponse.status === "fulfilled")
      io.emit("previousDaysVolume", previousDaysVolumeResponse.value);

    console.log("Data sent successfully... 👍");
  } catch (error) {
    console.error("Error sending data:", error);
  }
}

async function sendSectorData() {
  try {
    //   const socket = getSocketInstance();
    //   if (!socket) {
    //     console.error("Socket instance is not available.");
    //     return;
    //   }

    console.log("Fetching and sending sector stock data...");

    const [response] = await Promise.allSettled([sectorStockData()]);

    if (response.status === "fulfilled") io.emit("sectorScope", response.value);

    console.log("Data sector sent successfully... 👍");
  } catch (error) {
    console.error("Error sending data:", error);
  }
}

async function sendSmartMoneyActionData() {
  try {
    //   const io = getSocketInstance();
    //   if (!io) {
    //     console.error("Socket instance is not available.");
    //     return;
    //   }

    console.log("Fetching and sending smart money action data stock...");

    const [
      twoDayHLBreakResponse,
      DayHighLowReversalResponse,
      DailyRangeBreakoutResponse,
      AIMomentumCatcherTenMinsResponse,
      AIMomentumCatcherFiveMinsResponse,
      AIIntradayReversalFiveMinsResponse,
      AIIntradayReversalDailyResponse,
    ] = await Promise.allSettled([
      twoDayHLBreak(),
      DayHighLowReversal(),
      DailyRangeBreakout(),
      AIMomentumCatcherTenMins(),
      AIMomentumCatcherFiveMins(),
      AIIntradayReversalFiveMins(),
      AIIntradayReversalDaily(),
    ]);

    if (twoDayHLBreakResponse.status === "fulfilled")
      io.emit("twoDayHLBreak", twoDayHLBreakResponse.value);

    if (DayHighLowReversalResponse.status === "fulfilled")
      io.emit("DayHighLowReversal", DayHighLowReversalResponse.value);

    if (DailyRangeBreakoutResponse.status === "fulfilled")
      io.emit("DailyRangeBreakout", DailyRangeBreakoutResponse.value);

    if (AIMomentumCatcherTenMinsResponse.status === "fulfilled")
      io.emit(
        "AIMomentumCatcherTenMins",
        AIMomentumCatcherTenMinsResponse.value
      );

    if (AIMomentumCatcherFiveMinsResponse.status === "fulfilled")
      io.emit(
        "AIMomentumCatcherFiveMins",
        AIMomentumCatcherFiveMinsResponse.value
      );

    if (AIIntradayReversalFiveMinsResponse.status === "fulfilled")
      io.emit(
        "AIIntradayReversalFiveMins",
        AIIntradayReversalFiveMinsResponse.value
      );

    if (AIIntradayReversalDailyResponse.status === "fulfilled")
      io.emit("AIIntradayReversalDaily", AIIntradayReversalDailyResponse.value);

    console.log("Data sent successfully... 👍");
  } catch (error) {
    console.error("Error sending data:", error);
  }
}

async function sendSwingData() {
  try {
    console.log("Fetching and sending swing  data...");

    const [
      fiveDayRangeBreakersResponse,
      tenDayRangeBreakersResponse,
      dailyCandleReversalResponse,
      AIContractionResponse,
      DailyRangeBreakoutResponse,
    ] = await Promise.allSettled([
      fiveDayRangeBreakers(),
      tenDayRangeBreakers(),
      dailyCandleReversal(),
      AIContraction(),
      DailyRangeBreakout(),
    ]);

    if (fiveDayRangeBreakersResponse.status === "fulfilled")
      io.emit("fiveDayRangeBreakers", fiveDayRangeBreakersResponse.value);
    if (tenDayRangeBreakersResponse.status === "fulfilled")
      io.emit("tenDayRangeBreakers", tenDayRangeBreakersResponse.value);
    if (dailyCandleReversalResponse.status === "fulfilled")
      io.emit("setDailyCandleReversal", dailyCandleReversalResponse.value);
    if (AIContractionResponse.status === "fulfilled")
      io.emit("AIContraction", AIContractionResponse.value);
    if (DailyRangeBreakoutResponse.status === "fulfilled")
      io.emit("DailyRangeBreakout", DailyRangeBreakoutResponse.value);

    console.log("Swing Data  successfully... 👍");
  } catch (error) {
    console.error("Error sending data:", error);
  }
}

const initializeServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(authenticateSocket);
  io.use(checkSubscription);
 
  io.on("connection", async (socket) => {
    console.log("a user connected", socket.id);

    socket.on("getMarketDepthData", async () => {
      console.log("inside get data");
      await sendData(socket);

      // console.log("user disconnected",socket.id);
    });

    socket.on("getSectorData", async () => {
      console.log("inside get data");
      await sendSectorData();

      // console.log("user disconnected",socket.id);
    });

    socket.on("getSmartMoneyActionData", async () => {
      console.log("inside get data");
      await sendSmartMoneyActionData();

      // console.log("user disconnected",socket.id);
    });
    socket.on("getSwingData", async () => {
      console.log("inside get data");

      await sendSwingData();

      // console.log("user disconnected",socket.id);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id);
    });
  });

  return io;
};

const getSocketInstance = () => {
  if (!io) {
    throw new Error("Socket instance not initialized");
  }

  return io;
};

export { initializeServer, getSocketInstance };




 
 