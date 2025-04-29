import { registerUser, loginUser } from "../services/authCustomerService.js";
import Customer from "../models/User.js";

// Register a new user
export const register = async (req, res) => {
    try {
        const { name, address, phone, email, password } = req.body;
        const { user, token } = await registerUser({ name, address, phone, email, password });
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Login the user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await loginUser({ email, password });
        res.status(200).json({
            message: "Login successful",
            token,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get logged customer's details
export const getCustomerDetails = async (req, res) => {
    try {
        const user = req.user;  
        const customer = await Customer.findById(user.id); 
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.status(200).json({
            name: customer.name,
            address: customer.address,
            phone: customer.phone,
            email: customer.email,
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving customer details", error });
    }
};
