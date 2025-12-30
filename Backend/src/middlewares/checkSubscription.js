import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import UserSubscription from "../models/userSubscription.model.js";

const checkSubscription = async (socket, next) => {
  try {
    // 🔑 get token (cookie first, fallback auth.token)
    const token =
      socket.handshake.headers.cookie
        ?.split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1] ||
      socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("UNAUTHORIZED"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new Error("USER_NOT_FOUND"));
    }

    // 🔥 SESSION TAKEOVER CHECK
    if (user.sessionId !== decoded.sessionId) {
      return next(new Error("SESSION_TAKEN_OVER"));
    }

    // 🔥 SUBSCRIPTION CHECK
    const subscription = await UserSubscription.findOne({
      userId: user._id,
      status: "active",
      endDate: { $gt: new Date() },
    });

    if (!subscription) {
      return next(new Error("SUBSCRIPTION_REQUIRED"));
    }

    // 🔄 update activity (optional but recommended)
    user.lastActiveAt = new Date();
    await user.save();

    // attach user to socket
    socket.user = {
      userId: user._id,
      sessionId: user.sessionId,
      subscriptionId: subscription._id,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new Error("TOKEN_EXPIRED"));
    }
    return next(new Error("INVALID_TOKEN"));
  }
};

export default checkSubscription;
