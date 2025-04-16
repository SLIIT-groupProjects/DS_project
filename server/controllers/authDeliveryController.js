import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import DeliveryPerson from '../models/DeliveryPerson.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });
};

// Register
export const registerDeliveryPerson = async (req, res) => {
    const { name, email, phone, password, location } = req.body;

    try {
        const existing = await DeliveryPerson.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newPerson = await DeliveryPerson.create({
            name,
            email,
            phone,
            password: hashedPassword,
            location
        });

        const token = generateToken(newPerson._id);
        res.status(201).json({ token, user: { ...newPerson._doc, password: undefined } });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Login
export const loginDeliveryPerson = async (req, res) => {
    const { email, password } = req.body;

    try {
        const person = await DeliveryPerson.findOne({ email });
        if (!person) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, person.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = generateToken(person._id);
        res.status(200).json({ token, user: { ...person._doc, password: undefined } });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};