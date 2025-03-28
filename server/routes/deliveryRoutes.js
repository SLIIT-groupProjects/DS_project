import express from 'express';
import { getAvailableOrders, acceptOrder, updateOrderStatus } from '../controllers/deliveryController.js';
import authDeliveryMiddleware from '../middlewares/authDeliveryMiddleware.js';

const router = express.Router();

router.get('/orders', authDeliveryMiddleware, getAvailableOrders);
router.post('/orders/:orderId/accept', authDeliveryMiddleware, acceptOrder);
router.patch("/update/:orderId/status", authDeliveryMiddleware, updateOrderStatus);

export default router;