import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { 
  getDashboardStats, 
  getRecentOrders, 
  getRecentRestaurants,
  getUsersList,
  updateUserStatus
} from '../controllers/adminController.js';

const router = express.Router();

// All routes are protected and restricted to admin
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/orders/recent', getRecentOrders);
router.get('/restaurants/recent', getRecentRestaurants);

// User management routes
router.get('/users', getUsersList);
router.patch('/users/:id/status', updateUserStatus);

export default router;
