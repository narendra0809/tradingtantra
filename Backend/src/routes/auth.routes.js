import express from "express";
import {
  googleLogin,
  logIn,
  logout,
  resetPassword,
  sendOtpForResetPassword,
  signUp,
} from "../controllers/auth.controllers.js";

import { check } from "express-validator";
import verifyUser from "../middlewares/verifyUser.middleware.js";
import {
  editDisplayName,
  updatePassword,
} from "../controllers/userUpdate.controller.js";
import { addTrade, getAddedTrade } from "../controllers/tradDate.controller.js";
const router = express.Router();

router.post(
  "/signup",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
    check("firstname", "first name is required").not().isEmpty(),
    check("lastname", "last name is required").not().isEmpty(),
  ],

  signUp
);

router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  logIn
);

router.post(
  "/updatepassword",
  [
    check("newPassword", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
    check("oldPassword", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  verifyUser,
  updatePassword
);

//routes for logout

router.post("/logout", verifyUser, logout);

//route for the password reset

router.post(
  "/otp",
  [check("email", "Please include a valid email").isEmail()],
  verifyUser,
  sendOtpForResetPassword
);

router.post(
  "/forgot",
  [
    check("otp", "otp must be at least 6 digits").isLength({
      min: 6,
    }),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  verifyUser,
  resetPassword
);

//display name change route
router.post(
  "/edit-display-name",
  check("displayName", "Display name is required").not().isEmpty(),
  verifyUser,
  editDisplayName
);
//add trad

router.post(
  "/add-trade",
  [
    check("dateRange", "Date range is required and must be 'long' or 'short'")
      .not()
      .isEmpty()
      .isIn(["long", "short"]),
    check("entryDate", "Entry date is required and must be a valid date")
      .not()
      .isEmpty()
      .isISO8601()
      .toDate(),
    check("exitDate", "Exit date is required and must be a valid date")
      .not()
      .isEmpty()
      .isISO8601()
      .toDate(),
    check("symbol", "Symbol is required").not().isEmpty().trim(),
    check("entryPrice", "Entry price is required and must be a positive number")
      .not()
      .isEmpty(),
    check("exitPrice", "Exit price is required and must be a positive number")
      .not()
      .isEmpty(),
    check("quantity", "Quantity is required and must be a positive integer")
      .not()
      .isEmpty(),
  ],
  verifyUser,
  addTrade
);

//get trade
router.post(
  "/get-trade",
  [
    check("fromDate", "Entry date is required and must be a valid date")
      .not()
      .isEmpty()
      .isISO8601()
      .toDate(),
    check("toDate", "Exit date is required and must be a valid date")
      .not()
      .isEmpty()
      .isISO8601()
      .toDate(),
  ],
  verifyUser,
  getAddedTrade
);

//gooole auth
router.get("/google", googleLogin);

export default router;
