import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },

  // Cart Structure
  cartData: [
    {
      productId: { 
        type: String,
        // ref: "Product",  
        required: true
      },
      quantity: { 
        type: Number, 
        default: 1,
        min: 1
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { 
  timestamps: true, 
  minimize: false 
});

export default mongoose.model("User", userSchema);