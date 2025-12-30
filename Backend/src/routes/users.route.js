import express from "express";
import verifyUser from "../middlewares/verifyUser.middleware.js";
import { toggleTheme } from "../controllers/userUpdate.controller.js";

const router = express.Router();

router.post("profile/edit-profile",verifyUser);
router.put("/profile/toggle/theme",verifyUser,toggleTheme);

export default router