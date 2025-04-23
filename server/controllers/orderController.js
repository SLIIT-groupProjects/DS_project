import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Restaurant from '../models/Restaurant.js';

// Confirm Order
export const confirmOrder = async (req, res) => {
    try {
        const { address, phone, deliveryOption, scheduledDate, scheduledTime } = req.body;
        const customerId = req.user.id; // Get customerId from the JWT token (authenticated user)

        // Validate delivery option
        if (!["standard", "schedule"].includes(deliveryOption)) {
            return res.status(400).json({ message: "Invalid delivery option" });
        }

        // Validate scheduled date and time
        let scheduledDateTime = null;
        if (deliveryOption === "schedule") {
            if (!scheduledDate || !scheduledTime) {
                return res.status(400).json({ message: "Scheduled date and time are required" });
            }
            scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00Z`);
        }

        // Fetch cart items
        const cart = await Cart.findOne({ customerId }).populate("items.foodId");
        if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Cart is empty" });

        // Prepare order items
        let totalPayable = 0;
        const orderItems = cart.items.map(item => {
            const payableAmount = item.foodId.price * item.quantity;
            totalPayable += payableAmount;
            return {
                name: item.foodId.name,
                price: item.foodId.price,
                size: item.size,
                quantity: item.quantity
            };
        });

        // Set order
        const order = new Order({
            customerId,
            address,
            phone,
            items: orderItems,
            totalPayable,
            deliveryOption,
            scheduledTime: scheduledDateTime
        });

        await order.save();
        await Cart.deleteOne({ customerId });

        res.status(201).json({ message: "Order placed successfully", orderId: order._id });
    } catch (error) {
        res.status(500).json({ message: "Error confirming order", error });
    }
};

// Create new order (from the original functionality)
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

// Get Order Details
export const getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        res.status(200).json({
            address: order.address,
            phone: order.phone,
            totalPayable: order.totalPayable,
            status: order.status,
            deliveryOption: order.deliveryOption,
            scheduledTime: order.scheduledTime
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving order details", error });
    }
};

// Get User's Orders (as per original code)
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

// Get Customer Orders
export const getCustomerOrders = async (req, res) => {
    try {
        const customerId = req.user.id; // Get customerId from the JWT token (authenticated user)
        const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving customer orders", error });
    }
};

// Delete Order
export const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const customerId = req.user.id; // Get customerId from the JWT token

        const order = await Order.findOne({ _id: orderId, customerId });
        if (!order) {
            return res.status(404).json({ message: "Order not found or unauthorized" });
        }

        await Order.deleteOne({ _id: orderId });
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting order", error });
    }
};

// Update order status (from original functionality)
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

// Submit Rating and Review
export const submitRating = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { rating, review } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Update the rating and review
        order.rating = rating;
        order.review = review;
        order.isRated = true;

        await order.save();

        res.status(200).json({ message: "Rating and review submitted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error submitting rating and review", error });
    }
};

// Get restaurant stats (from original functionality)
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
