import express from "express";
import { register, login, getCustomerDetails } from "../controllers/authCustomerController.js";
import { authenticateUser } from "../middlewares/authCustomerMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Use the authenticateUser middleware to protect the route
router.get("/customers/me", authenticateUser, getCustomerDetails);  

export default router;
