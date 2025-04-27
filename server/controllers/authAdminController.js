import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Generate JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register admin (should be a protected operation in a real app)
export const registerAdmin = async (req, res) => {
    try {
        const { name, email, password, permissions } = req.body;
        
        // Check if email already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Email already registered" });
        }
        
        // Create new admin
        const admin = new Admin({
            name,
            email,
            password,
            permissions: permissions || {
                manageRestaurants: true,
                manageUsers: true,
                manageTransactions: true
            }
        });
        
        await admin.save();
        
        res.status(201).json({
            message: "Admin registration successful",
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: "admin",
                permissions: admin.permissions
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
};

// Login admin
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find admin by email
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        
        // Compare passwords
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        
        // Generate token
        const token = generateToken(admin._id, "admin");
        
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: "admin",
                permissions: admin.permissions
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
};

// Get admin profile
export const getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id).select("-password");
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving profile", error: error.message });
    }
};
