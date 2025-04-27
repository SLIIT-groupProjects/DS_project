import MenuItem from "../models/MenuItem.js";
import Restaurant from "../models/Restaurant.js";

// Add a new menu item
export const addMenuItem = async (req, res) => {
    try {
        const { 
            name, description, price, category, imageUrl, 
            sizes, prepTime, specialDiet, isAvailable 
        } = req.body;
        
        const ownerId = req.user.id;
        
        // Find restaurant by owner
        const restaurant = await Restaurant.findOne({ owner: ownerId });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        
        // Create new menu item
        const menuItem = new MenuItem({
            name,
            description,
            price,
            restaurant: restaurant._id,
            category,
            imageUrl,
            sizes: sizes || ["Regular", "Large"],
            prepTime: prepTime || 15,
            specialDiet: specialDiet || {
                isVegetarian: false,
                isVegan: false,
                isGlutenFree: false
            },
            isAvailable: isAvailable !== undefined ? isAvailable : true
        });
        
        await menuItem.save();
        
        res.status(201).json({
            message: "Menu item added successfully",
            menuItem
        });
    } catch (error) {
        res.status(500).json({ message: "Error adding menu item", error: error.message });
    }
};

// Get all menu items for a restaurant
export const getMenuItems = async (req, res) => {
    try {
        const ownerId = req.user.id;
        
        // Find restaurant by owner
        const restaurant = await Restaurant.findOne({ owner: ownerId });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        
        // Find all menu items for this restaurant
        const menuItems = await MenuItem.find({ restaurant: restaurant._id });
        
        res.status(200).json(menuItems);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving menu items", error: error.message });
    }
};

// Update a menu item
export const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, description, price, category, imageUrl, 
            sizes, prepTime, specialDiet, isAvailable 
        } = req.body;
        
        const ownerId = req.user.id;
        
        // Find restaurant by owner
        const restaurant = await Restaurant.findOne({ owner: ownerId });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        
        // Find menu item
        const menuItem = await MenuItem.findOne({
            _id: id,
            restaurant: restaurant._id
        });
        
        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }
        
        // Update fields
        if (name) menuItem.name = name;
        if (description) menuItem.description = description;
        if (price) menuItem.price = price;
        if (category) menuItem.category = category;
        if (imageUrl) menuItem.imageUrl = imageUrl;
        if (sizes) menuItem.sizes = sizes;
        if (prepTime) menuItem.prepTime = prepTime;
        if (specialDiet) menuItem.specialDiet = specialDiet;
        if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;
        
        await menuItem.save();
        
        res.status(200).json({
            message: "Menu item updated successfully",
            menuItem
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating menu item", error: error.message });
    }
};

// Delete a menu item
export const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user.id;
        
        // Find restaurant by owner
        const restaurant = await Restaurant.findOne({ owner: ownerId });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        
        // Find and delete menu item
        const menuItem = await MenuItem.findOneAndDelete({
            _id: id,
            restaurant: restaurant._id
        });
        
        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }
        
        res.status(200).json({
            message: "Menu item deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: "Error deleting menu item", error: error.message });
    }
};

// Update menu item availability
export const updateMenuItemAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { isAvailable } = req.body;
        
        const ownerId = req.user.id;
        
        // Find restaurant by owner
        const restaurant = await Restaurant.findOne({ owner: ownerId });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        
        // Find menu item
        const menuItem = await MenuItem.findOne({
            _id: id,
            restaurant: restaurant._id
        });
        
        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }
        
        menuItem.isAvailable = isAvailable;
        await menuItem.save();
        
        res.status(200).json({
            message: `Menu item is now ${isAvailable ? 'available' : 'unavailable'}`,
            menuItem
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating menu item availability", error: error.message });
    }
};
