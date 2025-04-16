<<<<<<< HEAD
import express from "express"
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authCustomerRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
=======
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/ds.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import authDeliveryRoutes from './routes/authDeliveryRoutes.js';
import assignOrderRoutes from './routes/assignOrderRoutes.js'
>>>>>>> 88c4d419d1b13680505a3c029eff5406190298f9

dotenv.config();
connectDB();

const app = express();
<<<<<<< HEAD

// Middlewares
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(helmet());
app.use(morgan("dev"));

// Condition to determine which service to run based on environment variable or port
if (process.env.SERVICE_TYPE === "auth") {
    // Auth Service Routes
    app.use("/api/auth", authRoutes);
    const PORT = process.env.PORT || 5002;
    app.listen(PORT, () => console.log(`Auth service is running on port ${PORT}`));
} else if (process.env.SERVICE_TYPE === "food") {
    // Food Service Routes
    app.use("/api/foods", foodRoutes);
    const PORT = process.env.PORT || 5003;
    app.listen(PORT, () => console.log(`Food service is running on port ${PORT}`));
}else if (process.env.SERVICE_TYPE === "cart") {
    // Cart Service Routes
    app.use("/api/cart", cartRoutes);
    const PORT = process.env.PORT || 5004;
    app.listen(PORT, () => console.log(`Food service is running on port ${PORT}`));
}else if (process.env.SERVICE_TYPE === "order") {
    // Order Service Routes
    app.use("/api/orders", orderRoutes);
    app.use("/api/ratings", ratingRoutes);
    const PORT = process.env.PORT || 5005;
    app.listen(PORT, () => console.log(`Food service is running on port ${PORT}`));
}else {
    console.log("Invalid SERVICE_TYPE specified.");
}

/*
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ratings", ratingRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
*/
=======
app.use(cors());
app.use(express.json());

app.use('/api/authDelivery', authDeliveryRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/assignOrder', assignOrderRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Delivery Service running on port ${PORT}`));
>>>>>>> 88c4d419d1b13680505a3c029eff5406190298f9
