import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import 'dotenv/config';
import axios from 'axios';
import { getUserIdFromToken } from "../utils/getUserId.js";

const JWT_SECRET = process.env.JWT_SECRET || "my_jwt_secret";

// ------------------------ AUTH ROUTES ------------------------
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });

    res.json({ msg: "User registered", user });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        cartData: user.cartData,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ------------------------ UTILS ------------------------
const fetchProduct = async (productId) => {
  try {
    const { data } = await axios.get(`https://fakestoreapi.com/products/${productId}`);
    return data;
  } catch (err) {
    console.error(`Failed to fetch product ${productId}:`, err.message);
    // Fallback product in case external API fails
    return { title: "Unknown product", price: 0, _id: productId };
  }
};

const buildFullCart = async (cartData) => {
  const fullCart = await Promise.all(
    cartData.map(async (item) => {
      try {
        const product = await fetchProduct(item.productId);
        return { product, quantity: item.quantity };
      } catch {
        return { product: { title: "Unknown product", price: 0, _id: item.productId }, quantity: item.quantity };
      }
    })
  );
  return fullCart.filter(Boolean);
};

// ------------------------ CART ROUTES ------------------------
export const getCart = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const fullCart = await buildFullCart(user.cartData);
    res.json(fullCart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ msg: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { productId, quantity = 1 } = req.body;

    if (!productId) return res.status(400).json({ msg: "productId is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const existingItem = user.cartData.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cartData.push({ productId, quantity });
    }

    await user.save();
    const fullCart = await buildFullCart(user.cartData);

    res.json({ msg: "Added to cart", cartData: fullCart });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ msg: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ msg: "productId is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.cartData = user.cartData.filter(item => item.productId !== productId);
    await user.save();

    const fullCart = await buildFullCart(user.cartData);
    res.json({ msg: "Item removed", cart: fullCart });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ msg: error.message });
  }
};

export const updateCartQty = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { productId, quantity } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const item = user.cartData.find(item => item.productId === productId);
    if (!item) return res.status(404).json({ msg: "Item not in cart" });

    item.quantity = quantity;
    await user.save();

    const fullCart = await buildFullCart(user.cartData);
    res.json({ msg: "Quantity updated", cartData: fullCart });
  } catch (error) {
    console.error("Update cart qty error:", error);
    res.status(500).json({ msg: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.cartData = [];
    await user.save();
    res.json({ msg: "Cart cleared" });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ msg: error.message });
  }
};
