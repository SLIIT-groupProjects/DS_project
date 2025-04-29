// cartRoutes.js

import express from "express";
import { addToCart, updateCart, deleteCartItem, getCart } from "../controllers/cartController.js";
import { authenticateUser } from "../middlewares/authCustomerMiddleware.js"; // Import auth middleware

const router = express.Router();

// Use the authenticateUser middleware to protect all cart routes
router.post("/", authenticateUser, addToCart); 
router.put("/item/:cartItemId", authenticateUser, updateCart); 
router.delete("/item/:cartItemId", authenticateUser, deleteCartItem); 
router.get("/", authenticateUser, getCart); 

export default router;
