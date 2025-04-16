import AssignedOrder from '../models/AssignedOrder.js';
import Order from "../models/Order.js";
import DeliveryPerson from '../models/DeliveryPerson.js';
import { geocodeAddress } from '../utils/geocodeAddress.js';
import { calculateDistance } from '../utils/geo.js';
import { sendNotification } from '../services/notifyService.js';

export const createAssignedOrder = async (req, res) => {
    try {


        const { customerLocation } = req.body;

        if (!customerLocation || !customerLocation.lat || !customerLocation.lng) {
            return res.status(400).json({ message: 'Valid customerLocation (lat/lng) required' });
        }

        // 1. Create the order
        const newOrder = await AssignedOrder.create({
            orderId: `ORD-${Date.now()}`,
            customerLocation,
            status: 'pending'
        });

        // 2. Find nearby delivery people
        const deliveryPeople = await DeliveryPerson.find({ isAvailable: true });

        const nearby = deliveryPeople.filter(dp => {
            return calculateDistance(customerLocation, dp.location) <= 5;
        });

        // 3. Send notifications
        for (const person of nearby) {
            await sendNotification({
                to: { phone: person.phone, email: person.email },
                orderId: newOrder._id,
                type: 'assigned',
                customerLocation
            });
        }

        res.status(201).json({
            message: 'Order created and nearby delivery people notified',
            order: newOrder,
            notifiedDeliveryPeople: nearby.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const handleNewOrderAssignment = async (orderId) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) throw new Error('Order not found');

        // 1. Geocode address
        const customerLocation = await geocodeAddress(order.address);
        if (!customerLocation) throw new Error('Unable to geocode address');

        // 2. Create AssignedOrder (without deliveryPerson)
        const assignedOrder = await AssignedOrder.create({
            orderId: order._id,
            customerLocation,
            status: 'pending',
        });

        // 3. Find nearby delivery people
        const deliveryPeople = await DeliveryPerson.find({ isAvailable: true });
        const nearby = deliveryPeople.filter((dp) => {
            return calculateDistance(customerLocation, dp.location) <= 5;
        });

        // 4. Notify them
        for (const person of nearby) {
            await sendNotification({
                to: { phone: person.phone, email: person.email, name: person.name },
                orderId: order._id,
                type: 'assigned',
                customerLocation
            });
        }

        return assignedOrder;
    } catch (err) {
        console.error('Assignment error:', err.message);
        throw err;
    }
};