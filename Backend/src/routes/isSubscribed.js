
import express from "express";
import verifyUser from "../middlewares/verifyUser.middleware.js";
import isSubscribed from "../controllers/isUserSubscribed.js";


const router = express.Router();

router.get('/is-subscribed', verifyUser, isSubscribed)


export default router