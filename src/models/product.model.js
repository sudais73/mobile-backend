import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: { 
    type: String },
    price: {
         type: Number,
         required: true },
    image: { 
    type: String },

    // Rating
    rating: {
        type: Number,
        default: 0,   
    }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product
