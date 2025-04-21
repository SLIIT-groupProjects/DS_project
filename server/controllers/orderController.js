import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';

// Create new order
export const createOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress } = req.body;
    
    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurantId,
      items,
      deliveryAddress,
      total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    });

    await order.populate('restaurant');
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('restaurant')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get restaurant's orders
export const getRestaurantOrders = async (req, res) => {
  try {
    const orders = await Order.find({ restaurant: req.params.restaurantId })
      .populate('user', 'name email')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

// Get restaurant stats
export const getRestaurantStats = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    
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
};
