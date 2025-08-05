import express from "express";
import verifyAdmin from "../../middlewares/verifyAdmin.middleware.js";
import {
  addStockDetail,
  deleteStock,
  getStockDetails,
  updateStockDetail,
} from "../../controllers/adminControllers/stockController.js";

const router = express.Router();

//Stock Details Route :
router.get("/stock-detials", verifyAdmin, getStockDetails);
router.post("/add-stock", verifyAdmin, addStockDetail);
router.patch("/update-stock/:id", verifyAdmin, updateStockDetail);
router.delete("/delete-stock/:id", verifyAdmin, deleteStock);

export default router;
