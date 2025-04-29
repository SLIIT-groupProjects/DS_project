import RestaurantOwner from "../models/RestaurantOwner.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Generate JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register restaurant owner
export const registerRestaurantOwner = async (req, res) => {
    try {
        const { name, email, password, phone, verificationDocuments } = req.body;
        
        // Check if email already exists
        const existingOwner = await RestaurantOwner.findOne({ email });
        if (existingOwner) {
            return res.status(400).json({ message: "Email already registered" });
        }
        
        // Create new restaurant owner
        const restaurantOwner = new RestaurantOwner({
            name,
            email,
            password,
            phone,
            verificationDocuments
        });
        
        await restaurantOwner.save();
        
        // Generate token
        const token = generateToken(restaurantOwner._id, "restaurant_owner");
        
        res.status(201).json({
            message: "Registration successful. Awaiting verification.",
            token,
            user: {
                id: restaurantOwner._id,
                name: restaurantOwner.name,
                email: restaurantOwner.email,
                role: "restaurant_owner",
                isVerified: restaurantOwner.isVerified
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
};

// Login restaurant owner
export const loginRestaurantOwner = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find restaurant owner by email
        const restaurantOwner = await RestaurantOwner.findOne({ email });
        if (!restaurantOwner) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        
        // Compare passwords
        const isMatch = await bcrypt.compare(password, restaurantOwner.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        
        // Generate token
        const token = generateToken(restaurantOwner._id, "restaurant_owner");
        
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: restaurantOwner._id,
                name: restaurantOwner.name,
                email: restaurantOwner.email,
                role: "restaurant_owner",
                isVerified: restaurantOwner.isVerified
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
};

// Get restaurant owner profile
export const getRestaurantOwnerProfile = async (req, res) => {
    try {
        const restaurantOwner = await RestaurantOwner.findById(req.user.id).select("-password");
        if (!restaurantOwner) {
            return res.status(404).json({ message: "Restaurant owner not found" });
        }
        
        res.status(200).json(restaurantOwner);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving profile", error: error.message });
    }
};
