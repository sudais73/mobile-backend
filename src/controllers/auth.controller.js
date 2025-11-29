import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import 'dotenv/config'
import axios from 'axios'

const JWT_SECRET = process.env.JWT_SECRET || "my_jwt_secret";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check exist
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashed,
    });

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
console.log('====================================');
console.log(user);
console.log('====================================');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

    const token = jwt.sign({ id: user._id, user }, JWT_SECRET, { expiresIn: "7d" });

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

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};





const fetchProduct = async (productId) => {
  const { data } = await axios.get(
    `https://fakestoreapi.com/products/${productId}`
  );
  return data;
};

const buildFullCart = async (cartData) => {
  return Promise.all(
    cartData.map(async (item) => ({
      product: await fetchProduct(item.productId),
      quantity: item.quantity
    }))
  );
};


export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const existingItem = user.cartData.find(
      item => item.productId === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      user.cartData.push({
        productId,
        quantity: quantity || 1
      });
    }

    await user.save();

    // Build full cart response
    const fullCart = await buildFullCart(user.cartData);

    return res.json({
      msg: "Added to cart",
      cartData: fullCart
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};



export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.cartData = user.cartData.filter(
      item => item.productId.toString() !== productId.toString()
    );

    await user.save();

    const fullCart = await buildFullCart(user.cartData);

    res.json({
      msg: "Item removed",
      cart: fullCart
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};


export const updateCartQty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const item = user.cartData.find(
      item => item.productId.toString() === productId.toString()
    );

    if (!item)
      return res.status(404).json({ msg: "Item not in cart" });

    item.quantity = quantity;

    await user.save();

    const fullCart = await buildFullCart(user.cartData);

    res.json({
      msg: "Quantity updated",
      cartData: fullCart
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};



export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const fullCart = await buildFullCart(user.cartData);

    res.json(fullCart);

  } catch (error) {
    console.log('====================================');
    console.log(error.message);
    console.log('====================================');
    res.status(500).json({ msg: error.message });
  }
};

// clear cart
export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    user.cartData = [];
    await user.save();
    res.json({ msg: "Cart cleared" });
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    res.status(500).json({ msg: error.message });
  }
};  
