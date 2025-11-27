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
        default: 0,   // average rating
    },

    // optional: detailed ratings
    ratingDetails: [
        {
            userId: { 
                type: mongoose.Schema.Types.ObjectId, ref: "User" },
            rating: { 
                type: Number, min: 1, max: 5 },
            review: { type: String }
        }
    ]
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
