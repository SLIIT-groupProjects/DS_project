import Admin from "../models/Admin.js";
import Restaurant from "../models/Restaurant.js";
import RestaurantOwner from "../models/RestaurantOwner.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

// Get all restaurants
export const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find().populate("owner", "name email phone");
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving restaurants", error: error.message });
    }
};

// Verify a restaurant
export const verifyRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        
        restaurant.isVerified = true;
        await restaurant.save();
        
        // Also verify the restaurant owner
        await RestaurantOwner.findByIdAndUpdate(restaurant.owner, { isVerified: true });
        
        res.status(200).json({
            message: "Restaurant verified successfully",
            restaurant
        });
    } catch (error) {
        res.status(500).json({ message: "Error verifying restaurant", error: error.message });
    }
};

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving users", error: error.message });
    }
};

// Get all restaurant owners
export const getAllRestaurantOwners = async (req, res) => {
    try {
        const restaurantOwners = await RestaurantOwner.find().select("-password");
        res.status(200).json(restaurantOwners);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving restaurant owners", error: error.message });
    }
};

// Get all pending verifications
export const getPendingVerifications = async (req, res) => {
    try {
        const pendingOwners = await RestaurantOwner.find({ isVerified: false }).select("-password");
        res.status(200).json(pendingOwners);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving pending verifications", error: error.message });
    }
};

// Verify a restaurant owner
export const verifyRestaurantOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;
        
        const owner = await RestaurantOwner.findById(ownerId);
        if (!owner) {
            return res.status(404).json({ message: "Restaurant owner not found" });
        }
        
        owner.isVerified = true;
        await owner.save();
        
        // Also verify the restaurant if it exists
        await Restaurant.updateMany({ owner: ownerId }, { isVerified: true });
        
        res.status(200).json({
            message: "Restaurant owner verified successfully",
            owner
        });
    } catch (error) {
        res.status(500).json({ message: "Error verifying restaurant owner", error: error.message });
    }
};

// Get all transactions
export const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate("restaurantId", "name")
            .populate("orderId");
        
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving transactions", error: error.message });
    }
};

// Update transaction status
export const updateTransactionStatus = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { status } = req.body;
        
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }
        
        transaction.status = status;
        await transaction.save();
        
        res.status(200).json({
            message: "Transaction status updated successfully",
            transaction
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating transaction status", error: error.message });
    }
};

// Get all admins - Add this missing function
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select("-password");
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving admins", error: error.message });
    }
};
