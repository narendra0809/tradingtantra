import express from "express";
import verifyAdmin from "../../middlewares/verifyAdmin.middleware.js";
import {
  deleteStrategy,
  editStrategy,
  getStrategy,
  postStrategy,
} from "../../controllers/adminControllers/adminStrategy.controller.js";
import { upload } from "../../config/multer.js";

const router = express.Router();

router.post(
  "/post-strategy",
  verifyAdmin,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnailFile", maxCount: 1 },
  ]),
  postStrategy
);
router.put(
  "/edit-strategy",
  verifyAdmin,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnailFile", maxCount: 1 },
  ]),
  editStrategy
);
router.get("/get-strategy", getStrategy);
router.delete("/delete-strategy", verifyAdmin, deleteStrategy);

export default router;
