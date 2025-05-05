import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const verifyUser = async (req, res, next) => {
  try {
    const token = req?.cookies?.accessToken;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized! Please sign in." });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Invalid token." });
    }

    const userId = decodedToken?.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized! Please sign in." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in verifyUser middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

export default verifyUser;
