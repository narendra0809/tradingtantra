import express from "express";
import verifyUser from "../middlewares/verifyUser.middleware.js";
import { createOrder, verifyPayment } from "../controllers/payment.controllers.js";
import { razporpayWebhook } from "../controllers/webhook.controller.js";


const router = express.Router();


router.post('/createorder',verifyUser,createOrder);
router.post('/verify-payment',verifyPayment)

//webhook

// it is called by razorpay itself we have to give the backend url at razorpay with this route ex. http://backend.com/webhook

//It capture the event for payment if it is in state successfull, failed , pending etc.

router.post('/webhook',razporpayWebhook)



export default router;