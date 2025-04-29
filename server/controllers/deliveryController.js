import AssignedOrder from '../models/AssignedOrder.js';
import DeliveryPerson from '../models/DeliveryPerson.js';
import Order from '../models/Order.js';
import { calculateDistance } from '../utils/geo.js';
import { sendNotification } from '../services/notifyService.js';

//Get nearby orders (within 5km of delivery person)

export const getAvailableOrders = async (req, res) => {
    try {
        const deliveryPerson = await DeliveryPerson.findById(req.user._id);

        if (!deliveryPerson) {
            return res.status(404).json({ message: 'Delivery person not found' });
        }

        const allAssignedOrders = await AssignedOrder.find({ status: 'pending' });

        const filteredOrders = [];

        for (const assignedOrder of allAssignedOrders) {
            const mainOrder = await Order.findById(assignedOrder.orderId);

            if (mainOrder && mainOrder.status === 'paid') {
                // Step 3: Check distance
                const isNearby = calculateDistance(assignedOrder.customerLocation, deliveryPerson.location) <= 5;
                if (isNearby) {
                    filteredOrders.push(assignedOrder);
                }
            }
        }

        res.status(200).json({ orders: filteredOrders });

    } catch (err) {
        console.error("Error in getAvailableOrders:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

//Accept and assign an order

export const acceptOrder = async (req, res) => {
    try {
        const deliveryPerson = await DeliveryPerson.findById(req.user._id);
        if (!deliveryPerson) {
            return res.status(404).json({ message: 'Delivery person not found' });
        }

        const orderId = req.params.orderId;
        const assignedOrder = await AssignedOrder.findById(orderId);
        if (!assignedOrder) {
            return res.status(404).json({ message: 'Assigned Order not found' });
        }

        if (assignedOrder.status !== 'pending') {
            return res.status(400).json({ message: 'Order already assigned or accepted' });
        }

        assignedOrder.deliveryPerson = deliveryPerson._id;
        assignedOrder.status = 'accepted';
        await assignedOrder.save();

        // Update Main Order Status
        const mainOrder = await Order.findById(assignedOrder.orderId);
        if (mainOrder) {
            mainOrder.status = 'accepted';
            await mainOrder.save();
        }

        res.status(200).json({ message: 'Order accepted and updated', order: assignedOrder });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
//         const order = await AssignedOrder.findById(orderId);

//         if (!order) {
//             return res.status(404).json({ message: 'Order not found' });
//         }

//         if (order.status !== 'pending') {
//             return res.status(400).json({ message: 'Order already assigned or completed' });
//         }

//         // Update the assigned order
//         order.deliveryPerson = deliveryPerson._id;
//         order.status = 'accepted';
//         await order.save();

//         // Update the main order
//         try {
//             const mongoose = require('mongoose');
//             const { ObjectId } = mongoose.Types;

//             let mainOrderId;
//             try {
//                 mainOrderId = new ObjectId(order.orderId);
//             } catch (convErr) {
//                 return res.status(200).json({
//                     message: 'Order accepted, but could not update main order',
//                     order
//                 });
//             }

//             const mainOrder = await Order.findById(mainOrderId);
//             if (mainOrder) {
//                 mainOrder.status = 'accepted';
//                 await mainOrder.save();
//             }
//         } catch (err) {
//             // Continue without failing if main order update fails
//         }

//         return res.status(200).json({ message: 'Order accepted and assigned', order });

//     } catch (err) {
//         return res.status(500).json({ message: 'Server error', error: err.message });
//     }
// };
// export const acceptOrder = async (req, res) => {
//     try {
//         console.log("🔄 Starting acceptOrder with orderId:", req.params.orderId);

//         const deliveryPerson = await DeliveryPerson.findById(req.user._id);
//         if (!deliveryPerson) {
//             return res.status(404).json({ message: 'Delivery person not found' });
//         }

//         const orderId = req.params.orderId;
//         const order = await AssignedOrder.findById(orderId);

//         if (!order) {
//             console.log("❌ Order not found");
//             return res.status(404).json({ message: 'Order not found' });
//         }

//         console.log("✅ Found order with status:", order.status);

//         if (order.status !== 'pending') {
//             return res.status(400).json({ message: 'Order already assigned or completed' });
//         }

//         // Update the assigned order
//         order.deliveryPerson = deliveryPerson._id;
//         order.status = 'accepted';
//         await order.save();
//         console.log("✅ Updated assigned order status to 'accepted'");

//         // Find the main order using the converted ObjectId
//         try {
//             console.log("🔍 Looking for main order with ID:", order.orderId);

//             // Import the ObjectId constructor
//             const mongoose = require('mongoose');
//             const { ObjectId } = mongoose.Types;

//             // Convert string to ObjectId if it's a valid MongoDB ObjectId string
//             let mainOrderId;
//             try {
//                 mainOrderId = new ObjectId(order.orderId);
//                 console.log("✅ Successfully converted to ObjectId");
//             } catch (convErr) {
//                 console.log("⚠️ Could not convert to ObjectId:", convErr.message);
//                 return res.status(200).json({
//                     message: 'Order accepted, but could not update main order',
//                     order
//                 });
//             }

//             const mainOrder = await Order.findById(mainOrderId);
//             if (mainOrder) {
//                 mainOrder.status = 'accepted';
//                 await mainOrder.save();
//                 console.log("✅ Updated main order status to 'accepted'");
//             } else {
//                 console.log("⚠️ Main order not found with ID:", order.orderId);
//             }
//         } catch (err) {
//             console.log("⚠️ Error updating main order:", err.message);
//             // Continue without failing the whole request
//         }

//         // Return success response even if main order update failed
//         return res.status(200).json({ message: 'Order accepted and assigned', order });

//     } catch (err) {
//         console.error("❌ Uncaught error in acceptOrder:", err.message);
//         return res.status(500).json({ message: 'Server error', error: err.message });
//     }
// };
export const getMyAssignedOrders = async (req, res) => {
    try {
        const assignedOrders = await AssignedOrder.find({
            deliveryPerson: req.user._id,
            status: { $in: ['accepted', 'pickedUp'] }
        });
        res.status(200).json({ orders: assignedOrders });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


// Update status (e.g., pickedUp, delivered)

export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['accepted', 'pickedUp', 'delivered'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status update' });
        }

        const order = await AssignedOrder.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (String(order.deliveryPerson) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Unauthorized access to order' });
        }

        order.status = status;
        await order.save();

        //Sync main Order status
        const mainOrder = await Order.findById(order.orderId);
        if (mainOrder) {
            mainOrder.status = status;
            await mainOrder.save();
        }

        res.status(200).json({ message: 'Order status updated', order });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const completeOrder = async (req, res) => {
    try {
        const assignedOrder = await AssignedOrder.findById(req.params.orderId);
        if (!assignedOrder) {
            return res.status(404).json({ message: 'Assigned Order not found' });
        }

        if (String(assignedOrder.deliveryPerson) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        assignedOrder.status = 'delivered';
        await assignedOrder.save();

        // Update Main Order Status
        const mainOrder = await Order.findById(assignedOrder.orderId);
        if (mainOrder) {
            mainOrder.status = 'delivered';
            await mainOrder.save();
        }

        res.status(200).json({ message: 'Order marked as delivered', order: assignedOrder });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
//     try {
//         const order = await AssignedOrder.findById(req.params.orderId);

//         if (!order) return res.status(404).json({ message: 'Order not found' });

//         // Make sure this delivery person owns the order
//         if (String(order.deliveryPerson) !== String(req.user._id)) {
//             return res.status(403).json({ message: 'Unauthorized' });
//         }

//         order.status = 'delivered';
//         await order.save();

//         // Update main order - using the same approach as in markOrderAsPickedUp
//         try {
//             const mongoose = require('mongoose');
//             const { ObjectId } = mongoose.Types;

//             let mainOrderId;
//             try {
//                 // Handle orderId whether it's already an ObjectId or a string
//                 mainOrderId = typeof order.orderId === 'string' ? new ObjectId(order.orderId) : order.orderId;
//             } catch (convErr) {
//                 return res.status(200).json({
//                     message: 'Order delivered, but could not update main order',
//                     order
//                 });
//             }

//             const mainOrder = await Order.findById(mainOrderId);
//             if (mainOrder) {
//                 mainOrder.status = 'delivered';
//                 await mainOrder.save();
//             }
//         } catch (err) {
//             // Continue without failing if main order update fails
//             console.error('Error updating main order:', err);
//         }

//         res.status(200).json({ message: 'Order marked as delivered', order });
//     } catch (err) {
//         res.status(500).json({ message: 'Server error', error: err.message });
//     }
// };
export const markOrderAsPickedUp = async (req, res) => {
    try {
        const { orderId } = req.params;
        const assignedOrder = await AssignedOrder.findById(orderId);
        if (!assignedOrder) {
            return res.status(404).json({ message: 'Assigned Order not found' });
        }

        if (String(assignedOrder.deliveryPerson) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        if (assignedOrder.status !== 'accepted') {
            return res.status(400).json({ message: 'Order is not in accepted state' });
        }

        assignedOrder.status = 'pickedUp';
        await assignedOrder.save();

        //  Update Main Order Status
        const mainOrder = await Order.findById(assignedOrder.orderId);
        if (mainOrder) {
            mainOrder.status = 'pickedUp';
            await mainOrder.save();
        }

        res.status(200).json({ message: 'Order marked as picked up', order: assignedOrder });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
// export const markOrderAsPickedUp = async (req, res) => {
//     try {
//         const { orderId } = req.params;
//         console.log("🔍 Pickup request for:", orderId);

//         const order = await AssignedOrder.findById(orderId);
//         if (!order) {
//             console.log("❌ Order not found");
//             return res.status(404).json({ message: 'Order not found' });
//         }

//         console.log("👤 Requesting User:", req.user._id);
//         console.log("📦 Order's DeliveryPerson:", order.deliveryPerson);

//         if (String(order.deliveryPerson) !== String(req.user._id)) {
//             console.log("❌ Unauthorized");
//             return res.status(403).json({ message: 'Unauthorized access' });
//         }

//         if (order.status !== 'accepted') {
//             console.log("⚠️ Order is not in accepted state, current status:", order.status);
//             return res.status(400).json({ message: 'Order is not in accepted state' });
//         }

//         order.status = 'pickedUp';
//         await order.save();
//         console.log("✅ Updated assigned order status to 'pickedUp'");

//         // Find the main order using converted ObjectId
//         try {
//             console.log("🔍 Looking for main order with ID:", order.orderId);

//             // Import the ObjectId constructor
//             const mongoose = require('mongoose');
//             const { ObjectId } = mongoose.Types;

//             // Convert string to ObjectId if it's a valid MongoDB ObjectId string
//             let mainOrderId;
//             try {
//                 mainOrderId = new ObjectId(order.orderId);
//                 console.log("✅ Successfully converted to ObjectId");
//             } catch (convErr) {
//                 console.log("⚠️ Could not convert to ObjectId:", convErr.message);
//                 return res.status(200).json({
//                     message: 'Order picked up, but could not update main order',
//                     order
//                 });
//             }

//             const mainOrder = await Order.findById(mainOrderId);
//             if (mainOrder) {
//                 mainOrder.status = 'pickedUp';
//                 await mainOrder.save();
//                 console.log("✅ Updated main order status to 'pickedUp'");
//             } else {
//                 console.log("⚠️ Main order not found with ID:", order.orderId);
//             }
//         } catch (err) {
//             console.log("⚠️ Error updating main order:", err.message);
//             // Continue without failing the whole request
//         }

//         console.log("✅ Order successfully marked as picked up");
//         return res.status(200).json({ message: 'Order marked as picked up', order });

//     } catch (err) {
//         console.error("❌ Pickup error:", err.message);
//         return res.status(500).json({ message: 'Server error', error: err.message });
//     }
// };