import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
     type: String,
      required: true },
  email:    { 
    type: String, 
    required: true,
     unique: true },
  password: { 
    type: String, 
    required: true },

  // Cart Structure
  cartData: [
    {
      productId: { 
        // type: mongoose.Schema.Types.ObjectId, 
        // ref: "Product"
        type:Number
       },
      quantity: { 
        type: Number, 
        default: 1 },
    }
  ]
}, { timestamps: true }, {minimize: false});

export default mongoose.model("User", userSchema);
