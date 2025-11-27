import express from "express";
import { createCheckoutSession } from "../controllers/payment.controller.js";

const router = express.Router();
router.post("/create-payment-intent", createCheckoutSession );

export default router;