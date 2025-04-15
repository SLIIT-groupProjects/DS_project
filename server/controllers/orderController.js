// orderController.js
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

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

//Get Order details of the logged customer
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

// Method for rate the service
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
