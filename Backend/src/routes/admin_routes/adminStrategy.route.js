import express from "express";
import verifyAdmin from "../../middlewares/verifyAdmin.middleware.js";
import {
  deleteStrategy,
  editStrategy,
  getStrategy,
  postStrategy,
} from "../../controllers/adminControllers/adminStrategy.controller.js";

const router = express.Router();

router.post("/post-strategy", verifyAdmin, postStrategy);
router.put("/edit-strategy", verifyAdmin, editStrategy);
router.get("/get-strategy", verifyAdmin, getStrategy);
router.delete("/delete-strategy", verifyAdmin, deleteStrategy);

export default router;
