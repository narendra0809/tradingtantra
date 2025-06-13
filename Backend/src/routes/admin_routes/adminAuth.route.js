import express from "express";

import {
  adminLogin,
  adminLogout,
} from "../../controllers/adminControllers/adminAuth.controller.js";
import verifyAdmin from "../../middlewares/verifyAdmin.middleware.js";
import { check } from "express-validator";

const router = express.Router();
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  adminLogin
);

router.post("/logout", verifyAdmin, adminLogout);

export default router;
