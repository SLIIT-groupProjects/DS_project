import express from "express";
import { addFood, getFoods, getFoodById, deleteFood} from "../controllers/foodController.js";

const router = express.Router();

router.post("/", addFood);
router.get("/", getFoods);
router.get("/:id", getFoodById);
router.delete("/:id", deleteFood);

export default router;