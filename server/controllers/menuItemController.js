import MenuItem from "../models/MenuItem.js";
import Restaurant from "../models/Restaurant.js";
import Food from "../models/Food.js"; // Add Food model import

// Helper function to sync menu item with food collection
const syncWithFoodCollection = async (menuItem, restaurant, operation) => {
    try {
        if (operation === "create" || operation === "update") {
            // Only create/update in Food collection if menu item is available
            if (menuItem.isAvailable) {
                // Check if corresponding food item exists
                let food = await Food.findOne({ menuItemId: menuItem._id });
                
                if (food) {
                    // Update existing food item
                    food.name = menuItem.name;
                    food.restaurant = restaurant.name;
                    food.price = menuItem.price;
                    food.sizes = menuItem.sizes;
                    food.imageUrl = menuItem.imageUrl;
                    await food.save();
                } else {
                    // Create new food item
                    food = new Food({
                        name: menuItem.name,
                        restaurant: restaurant.name,
                        price: menuItem.price,
                        sizes: menuItem.sizes,
                        imageUrl: menuItem.imageUrl,
                        menuItemId: menuItem._id // Store reference to menu item
                    });
                    await food.save();
                }
            } else {
                // If menu item is not available, remove from Food collection
                await Food.findOneAndDelete({ menuItemId: menuItem._id });
            }
        } else if (operation === "delete") {
            // Remove from Food collection when menu item is deleted
            await Food.findOneAndDelete({ menuItemId: menuItem._id });
        }
    } catch (error) {
        console.error("Error syncing with Food collection:", error);
    }
};

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
        
        // Sync with Food collection if available
        await syncWithFoodCollection(menuItem, restaurant, "create");
        
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
        
        // Sync with Food collection
        await syncWithFoodCollection(menuItem, restaurant, "update");
        
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
        
        // Find menu item
        const menuItem = await MenuItem.findOne({
            _id: id,
            restaurant: restaurant._id
        });
        
        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }
        
        // Sync with Food collection before deletion
        await syncWithFoodCollection(menuItem, restaurant, "delete");
        
        // Delete menu item
        await MenuItem.deleteOne({ _id: id });
        
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
        
        // Sync with Food collection
        await syncWithFoodCollection(menuItem, restaurant, "update");
        
        res.status(200).json({
            message: `Menu item is now ${isAvailable ? 'available' : 'unavailable'}`,
            menuItem
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating menu item availability", error: error.message });
    }
};
