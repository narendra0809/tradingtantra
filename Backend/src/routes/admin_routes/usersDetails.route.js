import express from "express";
import verifyAdmin from "../../middlewares/verifyAdmin.middleware.js";

import {
  getActiveUsersByMonths,
  getTotalUsersData,
} from "../../controllers/adminControllers/usersDetails.controller.js";

const router = express.Router();

router.get("/get-users", verifyAdmin, getTotalUsersData);

router.get("/get-activeusers-month", verifyAdmin, getActiveUsersByMonths);

export default router;
