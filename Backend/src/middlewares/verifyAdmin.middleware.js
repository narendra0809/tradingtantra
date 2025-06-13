import jwt from "jsonwebtoken";
import Admin from "../models/adminModels/admin.model.js";

const verifyAdmin = async (req, res, next) => {
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

    const adminId = decodedToken?.adminId;

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized! Please sign in." });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Error in verifyAdmin middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

export default verifyAdmin;
