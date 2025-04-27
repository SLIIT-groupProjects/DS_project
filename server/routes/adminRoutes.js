import express from "express";
import { 
    getAllRestaurants,
    verifyRestaurant,
    getAllUsers,
    getAllRestaurantOwners,
    getPendingVerifications,
    verifyRestaurantOwner,
    getAllTransactions,
    updateTransactionStatus,
    getAllAdmins
} from "../controllers/adminController.js";
import { authenticateAdmin } from "../middlewares/authRestaurantMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(authenticateAdmin);

// Restaurant management
router.get("/restaurants", getAllRestaurants);
router.put("/restaurants/:restaurantId/verify", verifyRestaurant);

// User management
router.get("/users", getAllUsers);
router.get("/restaurant-owners", getAllRestaurantOwners);
router.get("/pending-verifications", getPendingVerifications);
router.put("/restaurant-owners/:ownerId/verify", verifyRestaurantOwner);

// Financial transactions
router.get("/transactions", getAllTransactions);
router.put("/transactions/:transactionId/status", updateTransactionStatus);

// Admin management
router.get("/admins", getAllAdmins);

export default router;
