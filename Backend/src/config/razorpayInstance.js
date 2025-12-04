import razorpay from "razorpay";
import { getRazorpayTokens } from "../utils/getTokens.js";

const tokens = await getRazorpayTokens();

export const razorpayInstance = new razorpay({
  key_id: tokens?.RAZORPAY_KEY_ID || null,
  key_secret: tokens?.RAZORPAY_KEY_SECRET || null,
});
