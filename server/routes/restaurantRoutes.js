import express from "express";
import { 
    createRestaurant,
    getRestaurantByOwner,
    updateRestaurant,
    getRestaurantOrders,
    updateAvailability
} from "../controllers/restaurantController.js";
import { authenticateRestaurantOwner } from "../middlewares/authRestaurantMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(authenticateRestaurantOwner);

router.post("/", createRestaurant);
router.get("/", getRestaurantByOwner);
router.put("/", updateRestaurant);
router.get("/orders", getRestaurantOrders);
router.put("/availability", updateAvailability);

export default router;
