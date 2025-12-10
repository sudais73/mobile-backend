import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./src/routes/auth.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
import connectDB from "./src/config/db.js";
import paymentRoutes from './src/routes/payment.routes.js';

const app = express();
const allowedOrigins = [
  "http://localhost:8081",   // local dev
  "https://ecommerce-mobile-app-rn.netlify.app"  // deployed frontend
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json());




app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/payments', paymentRoutes);


app.get("/", (req, res) => res.send("API Running 123..."));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
