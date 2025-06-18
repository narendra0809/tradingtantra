import express from "express";
import verifyUser from "../middlewares/verifyUser.middleware.js";
import verifyAdmin from "../middlewares/verifyAdmin.middleware.js";
import feedback, { getFeedbacks } from "../controllers/feedback.controller.js";

const router = express.Router();

router.post("/post-feedback", verifyUser, feedback);
router.get("/admin/get-feedbacks", verifyAdmin, getFeedbacks);

export default router;
