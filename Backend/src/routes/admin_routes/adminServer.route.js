import express from "express";
import verifyAdmin from "../../middlewares/verifyAdmin.middleware.js";
import { restartServer } from "../../controllers/adminControllers/adminServer.controller.js";

const router = express.Router();

router.post("/restart-server", verifyAdmin, restartServer);

export default router;
