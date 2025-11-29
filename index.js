import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./src/routes/auth.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
import connectDB from "./src/config/db.js";
import paymentRoutes from './src/routes/payment.routes.js';

const app = express();
app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type, Authorization"
}));

app.use(express.json());




app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/payments', paymentRoutes);


app.get("/", (req, res) => res.send("API Running..."));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
// tGdzDP3qCTMJEdMe