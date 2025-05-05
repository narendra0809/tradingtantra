

import express from "express";
import { createSubscriptionPlan } from "../controllers/subscriptionPlan.controllers.js";

const router = express.Router();

router.post('/create-plan',createSubscriptionPlan)

export default router