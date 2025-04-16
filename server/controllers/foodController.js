import Food from "../models/Food.js";

// Upload Food items with Image
export const addFood = async (req, res) => {
    try{
        const { name, restaurant, price, sizes, imageUrl} = req.body;

        if (!req.file && !imageUrl) {
            return res.status(400).json({ message: "Food image is required" });
        }

        const newFood = new Food({
            name, 
            restaurant, 
            price,
            sizes: sizes || ["Regular", "Large"],
            imageUrl
        });

        await newFood.save();
        res.status(201).json({ message: "Food item added successfully", food: newFood});
    }catch(error){
        res.status(500).json({ message: "Error adding food item", error});
    }
};

// Retrieve food items
export const getFoods = async (req, res) => {
    try{
        const foods = await Food.find();
        res.status(200).json(foods);
    }catch(error){
        res.status(500).json({ message:  "Error retrieving food items", error});
    }
};

// Retrieve a single food item by ID
export const getFoodById = async (req, res) => {
    try {
        const { id } = req.params;
        const food = await Food.findById(id);

        if (!food) {
            return res.status(404).json({ message: "Food item not found" });
        }

        res.status(200).json(food);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving food details", error });
    }
};

// Delete a food item by ID
export const deleteFood = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFood = await Food.findByIdAndDelete(id);

        if (!deletedFood) {
            return res.status(404).json({ message: "Food item not found" });
        }

        res.status(200).json({ message: "Food item deleted successfully", food: deletedFood });
    } catch (error) {
        res.status(500).json({ message: "Error deleting food item", error });
    }
};