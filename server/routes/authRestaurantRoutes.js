import express from "express";
import { 
    registerRestaurantOwner, 
    loginRestaurantOwner, 
    getRestaurantOwnerProfile 
} from "../controllers/authRestaurantController.js";
import { authenticateRestaurantOwner } from "../middlewares/authRestaurantMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerRestaurantOwner);
router.post("/login", loginRestaurantOwner);

// Protected routes
router.get("/profile", authenticateRestaurantOwner, getRestaurantOwnerProfile);

export default router;
