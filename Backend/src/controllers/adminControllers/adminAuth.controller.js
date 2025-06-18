import { validationResult } from "express-validator";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../../models/adminModels/admin.model.js";

export const adminLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not Exist" });
    }
    if (admin.password) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
    } else {
      return res.status(400).json({ error: "Please sign in with Google" });
    }

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "PRODUCTION",
      maxAge: 24 * 60 * 60 * 1000,
    };

    res
      .status(200)
      .cookie("adminAccessToken", token, options)
      .json({
        success: true,
        token,
        admin: {
          id: admin._id,
          email: admin.email,
        },
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Error in login" });
  }
};

export const adminLogout = async (req, res) => {
  try {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "PRODUCTION",
    };

    res.status(200).clearCookie("adminAccessToken", options).json({
      success: true,
      message: "logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error in logging out ",
    });
  }
};

export const updateAdminPassword = async (req, res) => {
  try {
    if (!req.admin || !req.admin.id)
      res.status(401).send("Unauthorized Access !");
    const { password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);
    await Admin.findByIdAndUpdate(req.admin.id, { password: hashedPass });
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log("Error while updating admin password  :", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error !" });
  }
};
