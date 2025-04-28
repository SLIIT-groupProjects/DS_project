import express from "express";
import { 
    addMenuItem,
    getMenuItems,
    updateMenuItem,
    deleteMenuItem,
    updateMenuItemAvailability
} from "../controllers/menuItemController.js";
import { authenticateRestaurantOwner } from "../middlewares/authRestaurantMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(authenticateRestaurantOwner);

router.post("/", addMenuItem);
router.get("/", getMenuItems);
router.put("/:id", updateMenuItem);
router.delete("/:id", deleteMenuItem);
router.patch("/:id/availability", updateMenuItemAvailability);

export default router;
