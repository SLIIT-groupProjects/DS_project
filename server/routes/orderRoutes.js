import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  createOrder,
  getUserOrders,
  getRestaurantOrders,
  updateOrderStatus,
  getRestaurantStats
} from '../controllers/orderController.js';

const router = express.Router();

// Protected routes
router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getUserOrders);
router.get('/restaurant/:restaurantId', restrictTo('restaurant_owner', 'admin'), getRestaurantOrders);
router.get('/restaurant/:restaurantId/stats', restrictTo('restaurant_owner', 'admin'), getRestaurantStats);
router.patch('/:orderId/status', restrictTo('restaurant_owner', 'admin'), updateOrderStatus);

export default router;
