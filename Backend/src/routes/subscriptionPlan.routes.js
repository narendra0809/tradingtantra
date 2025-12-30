

import express from "express";
import { createSubscriptionPlan } from "../controllers/subscriptionPlan.controllers.js";
import verifyUser from "../middlewares/verifyUser.middleware.js";

const router = express.Router();

router.post('/create-plan',verifyUser,createSubscriptionPlan)

export default router