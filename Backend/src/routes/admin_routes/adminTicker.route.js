import express from "express";
import verifyAdmin from "../../middlewares/verifyAdmin.middleware.js";

import {
  addTicker,
  deleteTicker,
  editTicker,
  getTicker,
} from "../../controllers/adminControllers/adminTicker.controller.js";
const router = express.Router();

router.post("/add-ticker", verifyAdmin, addTicker);
router.get("/get-tickers", verifyAdmin, getTicker);
router.put("/edit-ticker", verifyAdmin, editTicker);
router.delete("/delete-ticker", verifyAdmin, deleteTicker);

export default router;
