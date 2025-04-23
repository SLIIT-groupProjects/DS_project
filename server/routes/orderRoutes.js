import express from "express";
import { 
  createOrder, 
  getUserOrders, 
  getRestaurantOrders, 
  updateOrderStatus, 
  getRestaurantStats,
  confirmOrder,
  getOrderDetails,
  getCustomerOrders,
  deleteOrder,
  submitRating 
} from "../controllers/orderController.js";
import { protect, restrictTo } from "../middleware/auth.js";
import { authenticateUser } from "../middlewares/authCustomerMiddleware.js"; 

const router = express.Router();

// Public route to confirm order (customer)
router.post("/confirm", authenticateUser, confirmOrder);  

// Protected routes for authenticated users
router.use(protect);  // Applying the protection middleware for authenticated routes

// Customer routes
router.get("/my-orders", getUserOrders); // Get customer's orders
router.get("/:orderId", getOrderDetails); // Get specific order details for customer
router.get("/", getCustomerOrders); // Get all orders for logged-in customer
router.delete("/:orderId", deleteOrder); // Delete order (customer)

// Restaurant owner/admin routes (restricted access)
router.use(restrictTo('restaurant_owner', 'admin'));  // Restrict to restaurant owners or admins

// Restaurant owner/admin routes for managing orders
router.post("/", createOrder); // Create new order (restaurant owner)
router.get("/restaurant/:restaurantId", getRestaurantOrders); // Get restaurant's orders
router.get("/restaurant/:restaurantId/stats", getRestaurantStats); // Get restaurant stats
router.patch("/:orderId/status", updateOrderStatus); // Update order status (restaurant owner)

// Rating and review submission (Customer)
router.put("/:orderId/rating", authenticateUser, submitRating);

export default router;
