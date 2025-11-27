import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { createOrder, getUserOrders, updateOrderStatus } from '../controllers/order.controller.js';

const router = express.Router();

// Sample route for creating an order
router.post('/create', protect, createOrder);

// Sample route for fetching user orders
router.get('/my-orders', protect, getUserOrders);

router.post('/update-payment',updateOrderStatus);

export default router;