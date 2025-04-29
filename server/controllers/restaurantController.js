import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";

// Create a new restaurant
export const createRestaurant = async (req, res) => {
    try {
        const { name, address, phone, email, cuisine, logo, openingHours } = req.body;
        const ownerId = req.user.id;
        
        // Check if restaurant with this email already exists
        const existingRestaurant = await Restaurant.findOne({ email });
        if (existingRestaurant) {
            return res.status(400).json({ message: "Restaurant with this email already exists" });
        }
        
        // Create new restaurant
        const restaurant = new Restaurant({
            name,
            owner: ownerId,
            address,
            phone,
            email,
            cuisine,
            logo,
            openingHours
        });
        
        await restaurant.save();
        
        res.status(201).json({
            message: "Restaurant created successfully",
            restaurant
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating restaurant", error: error.message });
    }
};

// Get restaurant by owner
export const getRestaurantByOwner = async (req, res) => {
    try {
        const ownerId = req.user.id;
        
        const restaurant = await Restaurant.findOne({ owner: ownerId });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        
        res.status(200).json(restaurant);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving restaurant", error: error.message });
    }
};

// Update restaurant details
export const updateRestaurant = async (req, res) => {
    try {
        const { name, address, phone, cuisine, logo, openingHours, isAvailable } = req.body;
        const ownerId = req.user.id;
        
        const restaurant = await Restaurant.findOne({ owner: ownerId });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        
        // Update fields
        if (name) restaurant.name = name;
        if (address) restaurant.address = address;
        if (phone) restaurant.phone = phone;
        if (cuisine) restaurant.cuisine = cuisine;
        if (logo) restaurant.logo = logo;
        if (openingHours) restaurant.openingHours = openingHours;
        if (isAvailable !== undefined) restaurant.isAvailable = isAvailable;
        
        await restaurant.save();
        
        res.status(200).json({
            message: "Restaurant updated successfully",
            restaurant
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating restaurant", error: error.message });
    }
};

// Get restaurant orders
export const getRestaurantOrders = async (req, res) => {
    try {
        const ownerId = req.user.id;
        
        // First get the restaurant
        const restaurant = await Restaurant.findOne({ owner: ownerId });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        
        // Find all orders that contain items from this restaurant
        const orders = await Order.find({ 
            "items.restaurantId": restaurant._id 
        }).sort({ createdAt: -1 });
        
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving orders", error: error.message });
    }
};

// Update restaurant availability
export const updateAvailability = async (req, res) => {
    try {
        const { isAvailable } = req.body;
        const ownerId = req.user.id;
        
        const restaurant = await Restaurant.findOne({ owner: ownerId });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        
        restaurant.isAvailable = isAvailable;
        await restaurant.save();
        
        res.status(200).json({
            message: `Restaurant is now ${isAvailable ? 'available' : 'unavailable'}`,
            restaurant
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating availability", error: error.message });
    }
};
