import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import sendEmail from "../utils/email.js";
import axios from "axios";
import UserSubscription from "../models/userSubscription.model.js";
import { oauth2client } from "../config/googleConfig.js";

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
  const { email, password, forceLogin } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not Exist, please sign up",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 🔥 CHECK EXISTING SESSION
    // If user has a session AND we are not forcing a login
    if (user.sessionId && !forceLogin) {
      return res.status(409).json({
        success: false,
        code: "ALREADY_LOGGED_IN",
        message: "You are logged in on another device. Logout there and login here?",
      });
    }

    // 🔥 CREATE NEW SESSION (This invalidates the old one)
    const sessionId = crypto.randomUUID();
    user.sessionId = sessionId;
    user.lastActiveAt = new Date();
    await user.save();

    const subscribed = await UserSubscription.findOne({
      userId: user._id,
      status: "active",
      endDate: { $gt: Date.now() },
    });

    // Embed sessionId in token
    const token = jwt.sign(
      { userId: user._id, sessionId },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "300m" }
    );

    res
      .cookie("accessToken", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 60 * 1000,
      })
      .json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          isSubscribed: !!subscribed,
          darkMode: user.darkMode,
        },
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// LOGOUT CONTROLLER
const logout = async (req, res) => {
  try {
    const user = req.user;

    await User.findByIdAndUpdate(user._id, { isLoggedIn: false });

    res
      .status(200)
      .clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
      .json({
        success: true,
        message: "logged out successfully",
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error in logging out",
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
    console.log(JSON.stringify(error));
    return res.status(500).json({
      success: false,
      message: "Internal server error in sending otp",
    });
  }
};

 const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid Email" });
    }

    // OTP expired
    if (!user.otpExpiry || Date.now() > user.otpExpiry) {
      return res
        .status(400)
        .json({ success: false, message: "OTP expired" });
    }

    // OTP mismatch
    if (otp !== user.otp) {
      return res
        .status(400)
        .json({ success: false, message: "OTP does not match" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // clear otp
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error in password changing",
    });
  }
};


export const verifyOtpForResetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
      errors: errors.array(),
    });
  }

  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // OTP mismatch
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP expired
    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



const googleLogin = async (req, res) => {
  const { code } = req.query;
  const googleRes = await oauth2client.getToken(code);
  oauth2client.setCredentials(googleRes.tokens);

  try {
    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );
    console.log(userRes.data);
    const { email, name, given_name, family_name, id } = userRes.data;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email: email,
        displayName: name,
        firstName: given_name,
        lastName: family_name,
        googleId: id,
      });
      await user.save();
    }
    const token = jwt.sign(
      { userId: user._id, displayName: user.displayName },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    const subscribed = await UserSubscription.findOne({
      userId: user._id,
      status: "active",
      endDate: { $gt: Date.now() },
    });
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
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
          isSubscribed: subscribed ? true : false,
        },
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  signUp,
  logIn,
  logout,
  sendOtpForResetPassword,
  resetPassword,
  googleLogin,
  getMe,
};
