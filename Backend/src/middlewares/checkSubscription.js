import UserSubscription from "../models/userSubscription.model.js";
import jwt from "jsonwebtoken";

const checkSubscription = async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication token missing"));
  
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (!decodedToken) return next(new Error("Invalid token"));
  
      // Check active subscription
      const subscription = await UserSubscription.findOne({
        userId: decodedToken.userId,
        status: "active",
        endDate: { $gt: Date.now() },
      });
  
      if (!subscription) {
        return next(new Error("Subscription required")); // 🔥 This triggers `connect_error`
      }
  
      socket.user = { id: decodedToken.userId };
      next();
    } catch (error) {
      next(new Error("Error checking subscription"));
    }
  };
  

export default checkSubscription;
