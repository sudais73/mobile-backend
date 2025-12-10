import express from "express";
import { addProduct, deleteProduct, getProduct, getProducts, updateProduct } from "../controllers/product.controller.js";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post("/",upload.single("image"), addProduct);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
