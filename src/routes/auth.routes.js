import express from "express";
import { getUser, login, register,addToCart,removeFromCart,updateCartQty,getCart, clearCart } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/add-to-cart", protect, addToCart);
router.post("/remove-fromcart", protect, removeFromCart);
router.post("/update-cart", protect, updateCartQty);
router.get("/get-cart-data", protect, getCart);
router.post("/clear-cart", protect, clearCart);


router.get("/me", protect, getUser);

export default router;
