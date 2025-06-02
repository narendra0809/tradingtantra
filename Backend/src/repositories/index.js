import mongoose from "mongoose";
import {
  formateDate,
  getCurrentFetchDate,
  getPreviousDate,
  getPrevousFetchDate,
} from "../utils/dateUtils.js";
import {
  NiftyOptionChain,
  BankNiftyOptionChain,
  FinniftyOptionChain,
  MidcpNiftyOptionChain,
  SensexOptionChain,
} from "../models/optionChain.model.js";

const modelMap = {
  NIFTY: NiftyOptionChain,
  BANKNIFTY: BankNiftyOptionChain,
  FINNIFTY: FinniftyOptionChain,
  MIDCPNIFTY: MidcpNiftyOptionChain,
  SENSEX: SensexOptionChain,
};
import dotenv from "dotenv";
dotenv.config();

const connectDBTemp = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      "mongodb://localhost:27017/"
    );
    console.log(`MongoDB Connected ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log(`Error in connecting to database`, error);
    process.exit(1);
  }
};

export async function saveOptionChainData(
  underlyingName,
  underlyingScrip,
  underlyingSeg,
  expiry
) {
  try {
    await connectDBTemp();

    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB not connected!");
    }

    // const Model = modelMap[underlyingName];
    // if (!Model) {
    //   throw new Error(`Model not found for ${underlyingName}`);
    // }

    // const timestamp = convertToIST(Date.now());
    // const previousTimestamp = "5/30/2025,  9:48:00 AM";
    // const previousFetchDate = getPrevousFetchDate();
    // const currentFetchDate = getCurrentFetchDate();

    const Model = modelMap[underlyingName];
    if (!Model) return;
    const now = new Date();
    const dayOfWeek = now.getDay();

    const daysBack = dayOfWeek === 1 ? 3 : 1;

    const referenceDate = getPreviousDate(now, daysBack);
    const timestamp = "6/2/2025,  3:00:00 PM";
    const oldTimestamp = timestamp.split(",");
    oldTimestamp[0] = formateDate(referenceDate);
    const previousTimestamp = oldTimestamp.join(",");
    const previousFetchDate = getPrevousFetchDate();
    const currentFetchDate = getCurrentFetchDate();

    console.log("Previous TimeStamp : ", previousTimestamp);

    const [existingDoc] = await Model.find({
      underlyingName,
      timestamp,
      expiry,
    });
    console.log(existingDoc);

    // if (existingDoc) {
    //   const updatedDoc = await Model.findOneAndUpdate(
    //     {
    //       _id: existingDoc._id,
    //     },
    //     {
    //       $set: {
    //         underlyingName,
    //         underlyingScrip,
    //         underlyingSeg,
    //         expiry,
    //         fetchDate: currentFetchDate,
    //         timestamp,
    //         lastPrice: 1000,
    //         strikeData: [],
    //         updatedAt: new Date(),
    //       },
    //     },
    //     {
    //       upsert: true,
    //       new: true,
    //     }
    //   );
    //   console.log("Updated Doc :", updatedDoc);
    // }
    console.log(
      `Successfully updated option chain for ${underlyingName}, expiry ${expiry}`
    );
  } catch (error) {
    console.error(
      `Failed to save option chain for ${underlyingName}: ${error.message}`
    );
  }
}

saveOptionChainData("BANKNIFTY", 24, "asdsad", "2025-06-26");

// const now = new Date();
// const dayOfWeek = now.getDay();

// const daysBack = dayOfWeek === 1 ? 3 : 1;

// const referenceDate = getPreviousDate(now, daysBack);
// const timestamp = convertToIST(Date.now());
// const oldTimestamp = timestamp.split(",");
// oldTimestamp[0] = formateDate(referenceDate);
// const previousTimestamp = oldTimestamp.join(",");
// console.log(previousTimestamp);
