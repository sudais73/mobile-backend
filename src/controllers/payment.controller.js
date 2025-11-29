import Stripe from "stripe";
import Order from "../models/order.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Format Stripe line items correctly
    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
        },
        unit_amount: item.price * 100, // ✔ Stripe requires "price"
      },
      quantity: item.quantity, // ✔ number of items
    }));

    // Create Stripe session
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
    console.log("Payment error:", err.message);
    res.status(500).json({ msg: "Payment failed" });
  }
};
