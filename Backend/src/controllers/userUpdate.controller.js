import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";

const updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { oldPassword, newPassword } = req.body;

    const loggedInUser = req.user;

    const user = await User.findOne({ email: loggedInUser.email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, message: "Password does not match" });
    }

    let hashedPassword;
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(newPassword, salt);
    }

    user.password = hashedPassword;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password changes successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error in changing the password",
    });
  }
};

const editDisplayName = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { displayName } = req.body;
    const loggedInUser = req.user;

    const user = await User.findOne({ email: loggedInUser.email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "unauthorized access " });
    }

    user.displayName = displayName;

    await user.save({ validateBeforeSave: false });
    res
      .status(200)
      .json({ success: true, message: "display name  changed successfully!" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error in name changing  ",
    });
  }
};

export { updatePassword, editDisplayName };
