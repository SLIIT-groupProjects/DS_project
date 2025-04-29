import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticateRestaurantOwner = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        if (decoded.role !== "restaurant_owner") {
            return res.status(403).json({ error: "Access denied. Not a restaurant owner." });
        }
        req.user = decoded;  // Attach the decoded token to the request object
        next();
    } catch (error) {
        res.status(400).json({ error: "Invalid token." });
    }
};

export const authenticateAdmin = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        if (decoded.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Not an admin." });
        }
        req.user = decoded;  // Attach the decoded token to the request object
        next();
    } catch (error) {
        res.status(400).json({ error: "Invalid token." });
    }
};
