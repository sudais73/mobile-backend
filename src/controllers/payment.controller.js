import Stripe from "stripe";
import Order from "../models/order.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) return res.status(400).json({ msg: "Order ID required" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    const lineItems = order.items.map(item => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.title },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.MOBILE_APP_URL}/payment-success?orderId=${orderId}`,
      cancel_url: `${process.env.MOBILE_APP_URL}/payment-cancel`,
      metadata: { orderId },
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error("Payment error full:", err); // log full object
    res.status(500).json({ msg: "Payment failed", error: err.message });
  }
};
