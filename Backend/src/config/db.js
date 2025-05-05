import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.DB_URI);
    console.log(`MongoDB Connected ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log(`Error in connecting to database`, error);
    process.exit(1);
  }
};

export default connectDB;
