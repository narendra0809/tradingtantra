import mongoose from "mongoose";
import connectDB from "./src/config/db.js";
import { stocksData } from "./src/f&o.js";
import StocksDetail from "./src/models/stocksDetail.model.js";

const seedDB = async () => {
  await connectDB();

  try {
    // Trim all string values in stocksData
    const cleanedStocksData = stocksData.map((stock) => {
      return Object.fromEntries(
        Object.entries(stock).map(([key, value]) => [
          key,
          typeof value === "string" ? value.trim() : value,
        ])
      );
    });

    await StocksDetail.insertMany(cleanedStocksData);
    console.log("Database seeded successfully with trimmed data");
  } catch (error) {
    console.log("Error in seeding:", error.message);
  } finally {
    mongoose.connection.close();
  }
};
seedDB();
// const seedDB = async () => {
//   await connectDB();

//   try {
//     // Trim all string values in stocksData
//     const cleanedStocksData = dummyData.map((stock) => {
//       return Object.fromEntries(
//         Object.entries(stock).map(([key, value]) => [
//           key,
//           typeof value === "string" ? value.trim() : value,
//         ])
//       );
//     });

//     await MarketDetailData.insertMany(cleanedStocksData);
//     console.log("Database seeded successfully with trimmed data");
//   } catch (error) {
//     console.log("Error in seeding:", error.message);
//   } finally {
//     mongoose.connection.close();
//   }
// };

// seedDB();
