import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Database Connections
import connectDB from "./config/db.js";

// Delivery Service Routes
import deliveryRoutes from "./routes/deliveryRoutes.js";
import authDeliveryRoutes from "./routes/authDeliveryRoutes.js";
import assignOrderRoutes from "./routes/assignOrderRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

// Other Microservices Routes
import authRoutes from "./routes/authCustomerRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// Restaurant Management Routes
import authRestaurantRoutes from "./routes/authRestaurantRoutes.js";
import authAdminRoutes from "./routes/authAdminRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import menuItemRoutes from "./routes/menuItemRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Common Middleware
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}));
app.use(helmet());
app.use(morgan("dev"));

// Conditional Service Routing
const service = process.env.SERVICE_TYPE;

if (service === "auth") {
    app.use("/api/auth", authRoutes);
    const PORT = process.env.PORT || 5002;
    app.listen(PORT, () => console.log(`Auth service is running on port ${PORT}`));
} else if (service === "food") {
    app.use("/api/foods", foodRoutes);
    const PORT = process.env.PORT || 5003;
    app.listen(PORT, () => console.log(`Food service is running on port ${PORT}`));
} else if (service === "cart") {
    app.use("/api/cart", cartRoutes);
    const PORT = process.env.PORT || 5004;
    app.listen(PORT, () => console.log(`Cart service is running on port ${PORT}`));
} else if (service === "order") {
    app.use("/api/orders", orderRoutes);
    app.use("/api/ratings", ratingRoutes);
    app.use("/api/chat", chatRoutes);
    const PORT = process.env.PORT || 5005;
    app.listen(PORT, () => console.log(`Order service is running on port ${PORT}`));
} else if (service === "delivery") {
    app.use("/api/authDelivery", authDeliveryRoutes);
    app.use("/api/delivery", deliveryRoutes);
    app.use("/api/assignOrder", assignOrderRoutes);
    app.use("/api/chat", chatRoutes);
    const PORT = process.env.PORT || 5006;
    app.listen(PORT, () => console.log(`Delivery service is running on port ${PORT}`));
} else if (service === "restaurant") {
    app.use("/api/authRestaurant", authRestaurantRoutes);
    app.use("/api/restaurants", restaurantRoutes);
    app.use("/api/menu", menuItemRoutes);
    const PORT = process.env.PORT || 5007;
    app.listen(PORT, () => console.log(`Restaurant service is running on port ${PORT}`));
} else if (service === "payment") {
    app.use("/api/payment", paymentRoutes);
    const PORT = process.env.PORT || 5009;
    app.listen(PORT, () => console.log(`Payment service is running on port ${PORT}`));
} else if (service === "admin") {
    app.use("/api/authAdmin", authAdminRoutes);
    app.use("/api/admin", adminRoutes);
    const PORT = process.env.PORT || 5008;
    app.listen(PORT, () => console.log(`Admin service is running on port ${PORT}`));
} else {
    console.log("❌ Invalid SERVICE_TYPE specified. Please set SERVICE_TYPE in your .env file.");
}
