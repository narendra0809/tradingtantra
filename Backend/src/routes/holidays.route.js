import express from "express";
import { getAllHolidays } from "../controllers/holidays.controller.js";

const router = express.Router();

router.get("/get-holidays", getAllHolidays);

export default router;
