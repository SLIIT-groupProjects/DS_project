import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import Restaurant from '../models/Restaurant.js';
import Order from '../models/Order.js';
import {
  getAllRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  updateMenu,
  toggleAvailability,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability
} from '../controllers/restaurantController.js';

const router = express.Router();

// Public routes
router.get('/', getAllRestaurants);

// Protected routes
router.use(protect);

// IMPORTANT: Specific routes must come BEFORE parameterized routes
// Get restaurant for logged-in restaurant owner
router.get('/my-restaurant', restrictTo('restaurant_owner'), async (req, res) => {
  try {
    // Ensure user is available
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log(`Finding restaurant for owner: ${req.user._id}`);
    
    // Find restaurant by owner ID
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'No restaurant found for this owner' });
    }
    
    res.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ message: 'Failed to fetch restaurant', error: error.message });
  }
});

// Restaurant stats endpoint
router.get('/:id/stats', async (req, res) => {
  try {
    const restaurantId = req.params.id;
    
    // Get restaurant to verify it exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Check if user is authorized to view these stats
    const isOwner = restaurant.owner && restaurant.owner.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view these stats' });
    }
    
    // Get today's start timestamp
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Count pending orders
    const pendingOrders = await Order.countDocuments({
      restaurant: restaurantId,
      status: { $in: ['pending', 'confirmed', 'preparing'] }
    });
    
    // Count completed orders today
    const completedOrders = await Order.countDocuments({
      restaurant: restaurantId,
      status: 'delivered',
      updatedAt: { $gte: today }
    });
    
    // Calculate today's revenue
    const todaysOrders = await Order.find({
      restaurant: restaurantId,
      status: 'delivered',
      updatedAt: { $gte: today }
    });
    
    const todaysRevenue = todaysOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Count menu items
    const totalMenuItems = restaurant.menu ? restaurant.menu.length : 0;
    
    // Return stats object
    res.json({
      pendingOrders,
      completedOrders,
      todaysRevenue,
      totalMenuItems
    });
  } catch (error) {
    console.error('Error fetching restaurant stats:', error);
    res.status(500).json({ message: 'Failed to retrieve restaurant statistics', error: error.message });
  }
});

// This specific route must come after all other specific routes but before the parameterized routes
router.get('/:id', getRestaurant);

// Restaurant owner and admin only routes
router.use(restrictTo('restaurant_owner', 'admin'));

router.post('/', createRestaurant);
router.patch('/:id', updateRestaurant);
router.delete('/:id', restrictTo('admin'), deleteRestaurant);
router.patch('/:id/menu', updateMenu);
router.patch('/:id/toggle-availability', toggleAvailability);

// Menu item management routes
router.post('/:id/menu', addMenuItem);
router.patch('/:id/menu/:itemId', updateMenuItem);
router.delete('/:id/menu/:itemId', deleteMenuItem);
router.patch('/:id/menu/:itemId/toggle-availability', toggleMenuItemAvailability);

export default router;
