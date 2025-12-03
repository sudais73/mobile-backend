import Order from "../models/order.model.js";
import { getUserIdFromToken } from "../utils/getUserId.js";

export async function createOrder(req, res) {
  try {
        const userId = getUserIdFromToken(req)
    
    const { items, total } = req.body;

    const newOrder = new Order({
      userId,  
      items,
      total,
    });

    await newOrder.save();

    console.log("Order created:", newOrder);

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });

  } catch (error) {
    console.log("Order error:", error);
    res.status(500).json({ msg: error.message });
  }
}

export async function getUserOrders(req, res) {
  try {
        const userId = getUserIdFromToken(req)
    const orders = await Order.find({ userId });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.log('====================================');
    console.log(error);
    console.log('====================================');
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    await Order.findByIdAndUpdate({_id:orderId}, { paid: true });
    await order.save();
    return res.json({ success: true, msg: "Order status updated to paid" });
  } catch (error) {
    console.log("Update order status error:", error);
    throw error;
    
  }
  
}