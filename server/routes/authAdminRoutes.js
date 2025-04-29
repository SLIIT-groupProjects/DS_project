import express from "express";
import { 
    registerAdmin, 
    loginAdmin, 
    getAdminProfile 
} from "../controllers/authAdminController.js";
import { authenticateAdmin } from "../middlewares/authAdminMiddleware.js";

const router = express.Router();

// Public routes
router.post("/login", loginAdmin);

// Protected routes
router.post("/register", authenticateAdmin, registerAdmin);
router.get("/profile", authenticateAdmin, getAdminProfile);

export default router;
