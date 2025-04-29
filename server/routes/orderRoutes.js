import express from "express";
import { confirmOrder, getOrderDetails, getCustomerOrders, deleteOrder, submitRating, updateOrderStatus } from "../controllers/orderController.js";
import { authenticateUser } from "../middlewares/authCustomerMiddleware.js"; 

const router = express.Router();

// Protect all order routes using authenticateUser middleware
router.post("/confirm", authenticateUser, confirmOrder);  
router.get("/:orderId", authenticateUser, getOrderDetails);  
router.get("/", authenticateUser, getCustomerOrders);  
router.delete("/:orderId", authenticateUser, deleteOrder); 
router.put("/:orderId/rating", authenticateUser, submitRating);
router.patch("/:orderId/status", authenticateUser, updateOrderStatus);

export default router;
