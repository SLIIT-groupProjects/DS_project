import AssignedOrder from '../models/AssignedOrder.js';
import DeliveryPerson from '../models/DeliveryPerson.js';
import { calculateDistance } from '../utils/geo.js';
import { sendNotification } from '../services/notifyService.js';

//Get nearby orders (within 5km of delivery person)

export const getAvailableOrders = async (req, res) => {
    try {
        const deliveryPerson = await DeliveryPerson.findById(req.user._id);

        if (!deliveryPerson) {
            return res.status(404).json({ message: 'Delivery person not found' });
        }

        const allOrders = await AssignedOrder.find({ status: 'pending' });

        const nearbyOrders = allOrders.filter(order => {
            return calculateDistance(order.customerLocation, deliveryPerson.location) <= 5;
        });

        res.status(200).json({ orders: nearbyOrders });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

//Accept and assign an order

export const acceptOrder = async (req, res) => {
    try {
        const deliveryPerson = await DeliveryPerson.findById(req.user._id);
        const orderId = req.params.orderId;

        const order = await AssignedOrder.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Order already assigned or completed' });
        }

        order.deliveryPerson = deliveryPerson._id;
        order.status = 'accepted';

        await order.save();

        // // Send SMS and Email notifications
        // sendNotification({
        //   to: {
        //     phone: deliveryPerson.phone,
        //     email: deliveryPerson.email,
        //     name: deliveryPerson.name
        //   },
        //   orderId: order._id,
        //   type: 'assigned',
        //   customerLocation: order.customerLocation
        // });

        res.status(200).json({ message: 'Order accepted and assigned', order });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
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

        res.status(200).json({ message: 'Order status updated', order });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const completeOrder = async (req, res) => {
    try {
        const order = await AssignedOrder.findById(req.params.orderId);

        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Make sure this delivery person owns the order
        if (String(order.deliveryPerson) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        order.status = 'delivered';
        await order.save();

        res.status(200).json({ message: 'Order marked as delivered', order });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
