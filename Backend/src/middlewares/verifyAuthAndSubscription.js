import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import UserSubscription from "../models/userSubscription.model.js";

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 min

/**
 * Unified middleware that verifies both authentication and subscription
 * Returns 401 for auth failures, 403 for subscription failures
 */
const verifyAuthAndSubscription = async (req, res, next) => {
  try {
    // 1. AUTH CHECK - Get and verify token
    const token = req.cookies?.accessToken;
    if (!token) {
      return res.status(401).json({ 
        code: "UNAUTHORIZED",
        message: "Unauthorized - No token provided" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ 
        code: "USER_NOT_FOUND",
        message: "User not found" 
      });
    }

    // 2. SESSION CHECK - Verify session hasn't been taken over
    if (user.sessionId !== decoded.sessionId) {
      return res.status(401).json({
        code: "SESSION_TAKEN_OVER",
        message: "Someone logged in from another device",
      });
    }

    // 3. INACTIVITY CHECK
    if (
      user.lastActiveAt &&
      Date.now() - new Date(user.lastActiveAt).getTime() > INACTIVITY_LIMIT
    ) {
      user.sessionId = null;
      await user.save();
      return res
        .status(401)
        .clearCookie("accessToken")
        .json({ 
          code: "SESSION_EXPIRED",
          message: "Session expired due to inactivity" 
        });
    }

    // 4. SUBSCRIPTION CHECK
    const subscription = await UserSubscription.findOne({
      userId: user._id,
      status: "active",
      endDate: { $gt: new Date() },
    });

    if (!subscription) {
      return res.status(403).json({
        code: "SUBSCRIPTION_REQUIRED",
        message: "Active subscription required to access this resource",
      });
    }

    // 5. Update activity timestamp
    user.lastActiveAt = new Date();
    await user.save();

    // 6. Attach user and subscription to request
    req.user = user;
    req.subscription = subscription;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        code: "TOKEN_EXPIRED",
        message: "Token expired" 
      });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        code: "INVALID_TOKEN",
        message: "Invalid token" 
      });
    }
    return res.status(401).json({ 
      code: "AUTH_ERROR",
      message: "Authentication error" 
    });
  }
};

export default verifyAuthAndSubscription;


