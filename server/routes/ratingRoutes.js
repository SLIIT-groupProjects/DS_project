// ratingRoutes.js
import express from "express";
import { submitRating, getOrderRatings } from "../controllers/ratingController.js";
import { authenticateUser } from "../middlewares/authCustomerMiddleware.js"; // Import the auth middleware

const router = express.Router();

// Protect routes using authenticateUser middleware
router.post("/submit", authenticateUser, submitRating);  // Submit rating
router.get("/", authenticateUser, getOrderRatings);  // Get all ratings

export default router;
