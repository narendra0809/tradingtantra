import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import sendEmail from "../utils/email.js";
import UserSubscription from "../models/userSubscription.model.js";

//signup controller

const signUp = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, firstname, lastname } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "User Already exist" });

    let hashedPassword = undefined;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const displayName = email.split("@")[0];
    user = new User({
      email,
      password: hashedPassword,
      firstName: firstname,
      lastName: lastname,
      displayName,
    });

    const newUser = await user.save();
    newUser.password = undefined;
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(201).json({
      success: true,
      token,
      newUser,
    });
  } catch (error) {
    // console.error("Login error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// login controller

const logIn = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  // console.log(email, password);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not Exist, please sign up" });
    }
    // console.log('here.....👍')
    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
    } else {
      return res.status(400).json({ error: "Please sign in with Google" });
    }

    let isSubscribed = false;

    const subscribed = await UserSubscription.findOne({
      userId: user._id,
      status: "active",
      endDate: { $gt: Date.now() },
    });

    if (!subscribed) {
      isSubscribed = false;
    }else{
      isSubscribed = true
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, //for one day
    };

    res
      .status(200)
      .cookie("accessToken", token, options)
      .json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          isSubscribed
        },
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error in login" });
  }
};

//logout

const logout = async (req, res) => {
  try {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, //for one day
    };

    res.status(200).clearCookie("accessToken", options).json({
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

//reset password

const sendOtpForResetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid Email!" });
    }

    let generateOtp = Math.floor(100000 + Math.random() * 900000).toString();

    let expTime = Date.now() + 5 * 60 * 1000;

    user.otp = generateOtp;
    user.otpExpiry = expTime;

    const updatedUser = await user.save({ validateBeforeSave: false });

    await sendEmail(updatedUser.email, generateOtp);

    res.status(200).json({ success: true, message: "otp successfully send!" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error in sending otp",
    });
  }
};

const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { password, otp } = req.body;

    const loggedInUser = req.user;

    // console.log("logged", loggedInUser);

    const user = await User.findOne({ email: loggedInUser.email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid Email!" });
    }

    if (Date.now() > user.otpExpiry) {
      return res.status(401).json({ success: false, message: "otp expire" });
    }

    if (otp !== user.otp) {
      return res
        .status(401)
        .json({ success: false, message: "otp does not match" });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;

    let hashedPassword;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    user.password = hashedPassword;

    await user.save({ validateBeforeSave: false });

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully!" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error in password changing",
    });
  }
};

export { signUp, logIn, logout, sendOtpForResetPassword, resetPassword };
