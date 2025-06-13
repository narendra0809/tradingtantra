import { getSubcriptionValidity } from "../controllers/subcriptionValidity.controller.js";
import express from "express";

const router = express.Router();

router.get("/subcription-end-date", getSubcriptionValidity);

export default router;
