import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
});

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true },
    status: {
        type: String,
        enum: ["Pending", "Delivered", "Cancelled"],
        default: "Pending",
    },
    paid: { type: Boolean, default: false },
}, { timestamps: true });

const Order = mongoose.model("Order", OrderSchema);

export default Order;
