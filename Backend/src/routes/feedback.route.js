import express from "express";
import verifyUser from "../middlewares/verifyUser.middleware.js";
import feedback from "../controllers/feedback.controller.js";
 


const router = express.Router();



router.post('/feedback',verifyUser, feedback);


export default router