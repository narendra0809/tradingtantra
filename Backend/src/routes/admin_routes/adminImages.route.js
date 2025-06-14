import express from "express";
import verifyAdmin from "../../middlewares/verifyAdmin.middleware.js";
import { uploadAdminImages } from "../../controllers/adminControllers/adminImage.controller.js";

const router = express.Router();

router
  .route("/image-upload", verifyAdmin)
  .post(uploadAdminImages)
  .delete(uploadAdminImages);

export default router;
