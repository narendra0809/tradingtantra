import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authenticateSocket = async (socket, next) => {
  try {
    // 🔥 Prefer cookie first (same as HTTP)
    let token =
      socket.handshake.headers.cookie
        ?.split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1] ||
      socket.handshake.auth?.token; // fallback

    if (!token) {
      return next(new Error("UNAUTHORIZED"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new Error("USER_NOT_FOUND"));
    }

    // 🔥 CRITICAL: SESSION CHECK
    if (user.sessionId !== decoded.sessionId) {
      return next(
        new Error("SESSION_TAKEN_OVER") // frontend listens for this
      );
    }

    // 🔄 update activity (optional but recommended)
    user.lastActiveAt = new Date();
    await user.save();

    // attach user to socket
    socket.user = {
      userId: user._id,
      sessionId: user.sessionId,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new Error("TOKEN_EXPIRED"));
    }

    return next(new Error("INVALID_TOKEN"));
  }
};

export default authenticateSocket;
