import connectDB from "../config/db.js";
import DataApi from "../models/adminModels/dataApi.model.js";
import PaymentKey from "../models/adminModels/paymentKeys.model.js";

await connectDB();

export const getDhanTokens = async () => {
  try {
    const [tokens] = await DataApi.find();
    if (!tokens) return null;
    return { DHAN_ACCESS_TOKEN: tokens.token, DHAN_CLIENT_ID: tokens.clientId };
  } catch (error) {
    console.error("Error fetching dhan tokens :", error);
    return null;
  }
};

export const getRazorpayTokens = async () => {
  try {
    const [tokens] = await PaymentKey.find();
    if (!tokens) return null;
    return {
      RAZORPAY_KEY_ID: tokens.key_id,
      RAZORPAY_KEY_SECRET: tokens.key_secret,
    };
  } catch (error) {
    console.error("Error fetching payment tokens :", error);
    return null;
  }
};
