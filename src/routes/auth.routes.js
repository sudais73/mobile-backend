import express from "express";
import { getUser, login, register,addToCart,removeFromCart,updateCartQty,getCart, clearCart } from "../controllers/auth.controller.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/add-to-cart", addToCart);
router.post("/remove-fromcart", removeFromCart);
router.post("/update-cart", updateCartQty);
router.get("/get-cart-data", getCart);
router.post("/clear-cart", clearCart);


router.get("/me", getUser);

export default router;
