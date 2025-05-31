// src/routes/optionClock.js
import express from "express";
import OptionDataController from "../controllers/OptionDataController.js";

const router = express.Router();

// Route to fetch option data
router.get("/option-data", OptionDataController.getOptionData);

router.get(
  "/option-data/underlying",
  OptionDataController.getOptionDataByUnderlying
);

export default router; // Use default export
