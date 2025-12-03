import express from 'express';
import { createOrder, getUserOrders, updateOrderStatus } from '../controllers/order.controller.js';

const router = express.Router();

// Sample route for creating an order
router.post('/create', createOrder);

// Sample route for fetching user orders
router.get('/my-orders', getUserOrders);

router.post('/update-payment',updateOrderStatus);

export default router;