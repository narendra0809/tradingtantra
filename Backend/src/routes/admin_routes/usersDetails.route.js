import express from "express";
import verifyAdmin from "../../middlewares/verifyAdmin.middleware.js";

import { getTotalUsersData } from "../../controllers/adminControllers/usersDetails.controller.js";

const router = express.Router();

router.get("/get-users", verifyAdmin, getTotalUsersData);

export default router;
