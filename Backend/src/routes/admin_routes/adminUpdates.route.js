import express from "express";
import verifyAdmin from "../../middlewares/verifyAdmin.middleware.js";
import {
  getUpdates,
  postUpdates,
} from "../../controllers/adminControllers/adminUpdates.controller.js";
const router = express.Router();

router.post("/post-update", verifyAdmin, postUpdates);
router.get("/get-updates", getUpdates);

export default router;
