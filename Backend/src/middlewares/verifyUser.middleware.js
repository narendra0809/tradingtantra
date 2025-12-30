import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 min

const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(401).json({ message: "User not found" });

    // 🔥 SESSION CHECK (The Critical Part)
    // If the session ID in DB doesn't match the token, it means a new login happened elsewhere
    if (user.sessionId !== decoded.sessionId) {
      return res.status(401).json({
        code: "SESSION_TAKEN_OVER", // Frontend listens for this specific code
        message: "Someone logged in from another device",
      });
    }

    // 🔥 INACTIVITY CHECK
    if (
      user.lastActiveAt &&
      Date.now() - new Date(user.lastActiveAt).getTime() > INACTIVITY_LIMIT
    ) {
      user.sessionId = null;
      await user.save();
      return res
        .status(401)
        .clearCookie("accessToken")
        .json({ message: "Session expired due to inactivity" });
    }

    // 🔄 Update activity
    user.lastActiveAt = new Date();
    await user.save();

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default verifyUser;