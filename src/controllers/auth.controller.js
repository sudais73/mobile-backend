import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Product from '../models/product.model.js'
import 'dotenv/config'
import { getUserIdFromToken } from "../utils/getUserId.js";

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
    const userId = getUserIdFromToken(req)
    const user = await User.findById(userId).select("-password");
    res.json(user, userId);
    console.log('====================================');
    console.log(user, userId);
    console.log('====================================');
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};





export const addToCart = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    
    const { productId, quantity } = req.body;
    console.log('====================================');
    console.log("productid", productId);
    console.log('====================================');

    // Validate productId
    if (!productId) {
      return res.status(400).json({ msg: "Product ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Find existing item in cart
    const existingItemIndex = user.cartData.findIndex(item => 
      item.productId === productId
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      user.cartData[existingItemIndex].quantity += quantity || 1;
    } else {
      // Add new item to cart
      user.cartData.push({
        productId: productId,
        quantity: quantity || 1
      });
    }

    await user.save();

  
    res.status(200).json({ 
      msg: "Product added to cart", 
      cartData:user.cartData
    });

  } catch (error) {
    console.error("Add to cart error:", error);

    res.status(500).json({ msg: "Server error", error: error.message });
  }
};



export const removeFromCart = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req)
  
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ msg: "productId is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.cartData = user.cartData.filter(item => {
      const id = item.productId?.toString();
      return id !== productId.toString();
    });

    await user.save();

   

    res.json({
      msg: "Item removed",
      cart: user.cartData
    });

  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ msg: error.message });
  }
};

export const updateCartQty = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req)
  
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

   

    res.json({
      msg: "Quantity updated",
      cartData: user.cartData
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};



export const getCart = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Extract all product IDs from the cart
    const productIds = user.cartData.map(item => item.productId);
    
    // Fetch all products at once (more efficient than individual queries)
    const products = await Product.find({ _id: { $in: productIds } });
    
    // Create a map for quick lookup by product ID
    const productMap = {};
    products.forEach(product => {
      productMap[product._id.toString()] = {
        id: product._id,
        title:product.title,
        name: product.name,
        price: product.price,
        description: product.description,
        image: product.image,

      };
    });
    
    // Combine cart items with product details
    const cartWithDetails = user.cartData.map(cartItem => {
      const product = productMap[cartItem.productId.toString()];
      
      // If product not found (e.g., was deleted), still return cart item but mark it
      if (!product) {
        return {
          ...cartItem.toObject ? cartItem.toObject() : cartItem,
          productDetails: null,
          productExists: false,
          message: "Product not found or has been removed"
        };
      }
      
      return {
        ...cartItem.toObject ? cartItem.toObject() : cartItem,
        productDetails: product,
        productExists: true,
        // Calculate subtotal for this item
        subtotal: product.price * cartItem.quantity
      };
    });
    
    // Calculate cart totals
    const cartSummary = {
      items: cartWithDetails.length,
      totalQuantity: cartWithDetails.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: cartWithDetails.reduce((sum, item) => {
        if (item.productExists && item.subtotal) {
          return sum + item.subtotal;
        }
        return sum;
      }, 0),
    };
    
    res.json({
      cartItems: cartWithDetails,
      summary: cartSummary,
      success: true
    });

  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ 
      msg: "Server error", 
      error: error.message,
      success: false 
    });
  }
};

// clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req)

    const user = await User.findById(userId);
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
