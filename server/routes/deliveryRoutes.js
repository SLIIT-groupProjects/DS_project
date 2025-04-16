import express from 'express';
import { getAvailableOrders, acceptOrder, updateOrderStatus, getMyAssignedOrders, completeOrder } from '../controllers/deliveryController.js';
import authDeliveryMiddleware from '../middlewares/authDeliveryMiddleware.js';

const router = express.Router();

router.get('/orders', authDeliveryMiddleware, getAvailableOrders);
router.get('/assigned', authDeliveryMiddleware, getMyAssignedOrders);
router.post('/orders/:orderId/accept', authDeliveryMiddleware, acceptOrder);
router.patch("/update/:orderId/status", authDeliveryMiddleware, updateOrderStatus);
router.patch('/:orderId/complete', authDeliveryMiddleware, completeOrder);


export default router;