import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Transaction from '../models/Transaction.js';

// Get dashboard statistics for admin
export const getDashboardStats = async (req, res) => {
  try {
    // Get total number of restaurants
    const totalRestaurants = await Restaurant.countDocuments();
    
    // Get number of active restaurants
    const activeRestaurants = await Restaurant.countDocuments({ 
      status: 'approved',
      isActive: true 
    });
    
    // Get total number of users
    const totalUsers = await User.countDocuments();
    
    // Get total number of orders
    const totalOrders = await Order.countDocuments();
    
    // Calculate total revenue
    const allOrders = await Order.find({ status: 'delivered' });
    const revenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    res.json({
      totalRestaurants,
      activeRestaurants,
      totalUsers,
      totalOrders,
      revenue
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

// Get recent orders for admin dashboard
export const getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort('-createdAt')
      .limit(5)
      .populate('user', 'name email')
      .populate('restaurant', 'name');
    
    // Format the response
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      customer: order.user ? order.user.name : 'Guest',
      restaurant: order.restaurant ? order.restaurant.name : 'Unknown Restaurant',
      status: order.status,
      total: order.total,
      createdAt: order.createdAt
    }));
    
    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ message: 'Error fetching recent orders' });
  }
};

// Get recent restaurant applications
export const getRecentRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .sort('-createdAt')
      .limit(5)
      .populate('owner', 'name email');
    
    // Format the response
    const formattedRestaurants = restaurants.map(restaurant => ({
      _id: restaurant._id,
      name: restaurant.name,
      owner: restaurant.owner ? restaurant.owner.name : 'Unknown',
      status: restaurant.status,
      createdAt: restaurant.createdAt
    }));
    
    res.json(formattedRestaurants);
  } catch (error) {
    console.error('Error fetching recent restaurants:', error);
    res.status(500).json({ message: 'Error fetching recent restaurants' });
  }
};

// Get users with pagination
export const getUsersList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalUsers = await User.countDocuments();
    
    // Get users with pagination
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / limit);
    
    res.json({
      users,
      totalPages,
      currentPage: page,
      totalUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Update user status (activate/deactivate)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
};
