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

    const isProd =
      typeof process.env.NODE_ENV === "string" &&
      process.env.NODE_ENV.toLowerCase() === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 30 * 60 * 1000,
    };

    // In production, set a domain if provided (helps subdomain scenarios)
    if (isProd && process.env.COOKIE_DOMAIN) cookieOptions.domain = process.env.COOKIE_DOMAIN;

    res.cookie("accessToken", token, cookieOptions).json({
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
    // Clear session in DB
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        sessionId: null,
        lastActiveAt: null,
      });
    }

    res.status(200).clearCookie("accessToken").json({
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
  const { code } = req.query; // Frontend se code mila

  try {
    // 🔥 FIX 1: Token Exchange
    // Agar frontend 'postmessage' flow use kar raha hai, to redirect_uri handle karna padta hai
    const { tokens } = await oauth2client.getToken(code);
    oauth2client.setCredentials(tokens);

    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
    );

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
    } else {
        // Agar user pehle se hai par googleId nahi hai (Normal signup kiya tha)
        if(!user.googleId) user.googleId = id;
    }

    // 🔥 FIX 2: SESSION MANAGEMENT (Critical)
    // Google Login ko hum 'Force Login' maante hain (Puraana session kill)
    const sessionId = crypto.randomUUID();
    user.sessionId = sessionId;
    user.lastActiveAt = new Date();
    
    await user.save();

    const subscribed = await UserSubscription.findOne({
      userId: user._id,
      status: "active",
      endDate: { $gt: Date.now() },
    });

    // 🔥 FIX 3: Add sessionId to Token
    const token = jwt.sign(
      { 
        userId: user._id, 
        sessionId, // 🔥 Zaroori hai verifyUser middleware ke liye
        displayName: user.displayName 
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "30m" } // Match with your login expiration
    );

    const isProd =
      typeof process.env.NODE_ENV === "string" &&
      process.env.NODE_ENV.toLowerCase() === "production";

    const options = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 30 * 60 * 1000,
    };

    if (isProd && process.env.COOKIE_DOMAIN) options.domain = process.env.COOKIE_DOMAIN;

    res.status(200).cookie("accessToken", token, options).json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          isSubscribed: !!subscribed,
          darkMode: user.darkMode, // Ensure darkmode is sent
        },
      });
  } catch (error) {
    console.error("Google Login Error:", error?.response?.data || error.message);
    res.status(500).json({ 
        success: false, 
        message: "Google Login Failed. Check Redirect URI." 
    });
  }
};
export {
  signUp,
  logIn,
  logout,
  sendOtpForResetPassword,
  resetPassword,
  googleLogin,
};
