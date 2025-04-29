// orderController.js
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import AssignedOrder from "../models/AssignedOrder.js";
import Food from "../models/Food.js";
import { handleNewOrderAssignment } from './assignOrderController.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Confirm Order
export const confirmOrder = async (req, res) => {
    try {
        const { address, phone, deliveryOption, scheduledDate, scheduledTime, items, paymentIntentId, orderId } = req.body;
        const customerId = req.user.id;

        console.log("Received order confirmation request:", {
            address, phone, deliveryOption,
            items: items.length,
            hasPaymentIntent: !!paymentIntentId,
            hasOrderId: !!orderId
        });

        // Only update status if orderId and paymentIntentId are present
        if (orderId && paymentIntentId) {
            try {
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
                console.log("Payment Intent:", paymentIntent);
                console.log("Payment Intent Status:", paymentIntent.status);

                if (paymentIntent.status === 'succeeded') {
                    try {
                        // Update status to 'paid' after payment success
                        console.log(`Updating order status to 'paid' for orderId: ${orderId}`);
                        const updatedOrder = await Order.findByIdAndUpdate(
                            orderId,
                            {
                                status: 'paid',
                                paymentIntentId: paymentIntent.id, // <-- SAVE the paymentIntentId
                                paymentStatus: paymentIntent.status // (optional but useful for future)
                            },
                            { new: true }
                        );
                        console.log("Order status updated to paid in database:", updatedOrder);

                        if (updatedOrder.deliveryOption === "standard") {
                            console.log("Assigning delivery for PAID order:", updatedOrder._id);
                            await handleNewOrderAssignment(updatedOrder._id);
                            console.log("Order assignment completed after payment");
                        }

                        return res.status(200).json({
                            message: "Order status updated to paid and assigned",
                            orderId: updatedOrder._id,
                            status: updatedOrder.status,
                            totalPayable: updatedOrder.totalPayable
                        });
                    } catch (dbError) {
                        console.error("Database update error:", dbError);
                        return res.status(500).json({
                            message: "Error updating order status in database",
                            error: dbError.message
                        });
                    }
                } else {
                    return res.status(400).json({
                        message: "Payment not successful",
                        status: paymentIntent.status
                    });
                }
            } catch (stripeErr) {
                console.error("Stripe Error:", stripeErr);
                console.error("Payment Intent ID:", paymentIntentId);
                return res.status(400).json({
                    message: "Payment verification failed",
                    error: stripeErr.message
                });
            }
        }

        // Otherwise, create initial order with pending status (no paymentIntentId)
        const totalPayable = items.reduce((total, item) =>
            total + (item.price * item.quantity), 0);

        console.log("Calculated total payable:", totalPayable);

        // Create initial order with pending status
        let scheduledDateTime = null;
        if (deliveryOption === "schedule" && scheduledDate && scheduledTime) {
            try {
                scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
                console.log("Scheduled time parsed:", scheduledDateTime);
            } catch (dateError) {
                console.error("Date parsing error:", dateError);
                return res.status(400).json({
                    message: "Invalid date or time format",
                    error: dateError.message
                });
            }
        }

        const orderData = {
            customerId,
            address,
            phone,
            items,
            totalPayable,
            status: 'pending',
            deliveryOption,
            scheduledTime: scheduledDateTime
        };

        console.log("Creating order with data:", orderData);
        const order = await Order.create(orderData);
        console.log("Order created:", order._id);

        // Send a successful response before trying to clear cart and assign delivery
        // This ensures the client gets a response even if the follow-up tasks fail
        res.status(201).json({
            message: "Order created successfully",
            orderId: order._id,
            totalPayable: order.totalPayable
        });

        // Clear cart and assign delivery in background
        try {
            const cartDeleteResult = await Cart.deleteOne({ customerId });
            console.log("Cart deletion result:", cartDeleteResult);

        } catch (cartError) {
            console.error("Post-order operations error:", cartError);
            // Don't send error response as we've already sent a success response
        }
    } catch (error) {
        console.error("Order confirmation error:", error);
        res.status(500).json({
            message: "Error confirming order",
            error: error.message
        });
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

export const updateOrderStatus = async (orderId, status) => {
    try {
        // Update order status in database
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: status },
            { new: true }
        );

        if (!updatedOrder) {
            throw new Error("Order not found");
        }

        console.log(`Order status updated to ${status} in database`);
        return updatedOrder;
    } catch (error) {
        console.error("Error updating order status in database:", error);
        throw error;
    }
};

//Get Order details of the logged customer
export const getCustomerOrders = async (req, res) => {
    try {
        console.log("⏳ Starting getCustomerOrders for user:", req.user.id);
        const customerId = req.user.id; // Get customerId from the JWT token (authenticated user)

        // First, simply try to get orders without any additional processing
        let orders;
        try {
            orders = await Order.find({ customerId }).sort({ createdAt: -1 });
            console.log(`✅ Found ${orders.length} orders for customer`);
        } catch (findErr) {
            console.error("❌ Error finding orders:", findErr);
            return res.status(500).json({
                message: "Error finding customer orders",
                error: findErr.message
            });
        }

        // Process orders one by one with detailed error handling
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            console.log(`🔄 Processing order ${i + 1}/${orders.length}: ${order._id}`);

            try {
                // Convert the ObjectId to string for consistency
                const orderIdString = order._id.toString();
                console.log(`🔍 Looking for assigned order with orderId: ${orderIdString}`);

                const assigned = await AssignedOrder.findOne({ orderId: orderIdString });

                if (assigned) {
                    console.log(`✅ Found assigned order with status: ${assigned.status}`);
                    if (order.status !== "paid" && order.status !== "completed") {
                        if (assigned.status !== order.status) {
                            console.log(`🔄 Updating order status from ${order.status} to ${assigned.status}`);
                            order.status = assigned.status;
                            await order.save();

                            // Ensure we include latest payment status
                            const freshOrder = await Order.findById(order._id);
                            orders[i] = freshOrder;
                        }
                    }
                } else {
                    console.log(`ℹ️ No assigned order found for order ID: ${orderIdString}`);
                }
            } catch (orderErr) {
                console.error(`❌ Error processing order ${order._id}:`, orderErr);
                // Continue processing other orders
            }
        }

        console.log("✅ All orders processed successfully");
        res.status(200).json(orders);
    } catch (error) {
        console.error("❌ Uncaught error in getCustomerOrders:", error);
        res.status(500).json({
            message: "Error retrieving customer orders",
            error: error.message || "Unknown error"
        });
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
