import express from "express";
import verifyAdmin from "../../middlewares/verifyAdmin.middleware.js";
import { getTransactionDetails } from "../../controllers/adminControllers/transactionDetails.controller.js";

const router = express.Router();

router.get("/get-transactions", getTransactionDetails);

export default router;
