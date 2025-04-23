import Restaurant from '../models/Restaurant.js';

// Get all restaurants
export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isActive: true });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single restaurant
export const getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create restaurant
export const createRestaurant = async (req, res) => {
  try {
    // Check if the user already has a restaurant
    const existingRestaurant = await Restaurant.findOne({ owner: req.user._id });
    if (existingRestaurant) {
      return res.status(400).json({ 
        message: 'You already have a registered restaurant' 
      });
    }
    
    // Create new restaurant with owner reference
    const restaurant = await Restaurant.create({
      ...req.body,
      owner: req.user._id,
      status: 'pending_approval',  // New restaurants need admin approval
      isActive: false,  // Not active until approved
      isAvailable: false  // Not available until approved and set by owner
    });
    
    res.status(201).json(restaurant);
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update restaurant
export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete restaurant
export const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update menu
export const updateMenu = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    restaurant.menu = req.body.menu;
    await restaurant.save();
    
    res.json(restaurant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Toggle restaurant availability
export const toggleAvailability = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    restaurant.isAvailable = !restaurant.isAvailable;
    await restaurant.save();
    
    res.json(restaurant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add a new menu item
export const addMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Check if user is authorized
    if (!restaurant.owner.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this restaurant' });
    }
    
    // Add new menu item
    const newMenuItem = req.body;
    restaurant.menu.push(newMenuItem);
    await restaurant.save();
    
    // Return only the newly added menu item
    const addedItem = restaurant.menu[restaurant.menu.length - 1];
    res.status(201).json(addedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a menu item
export const updateMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Check if user is authorized
    if (!restaurant.owner.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this restaurant' });
    }
    
    // Find the menu item
    const menuItem = restaurant.menu.id(req.params.itemId);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Update menu item fields
    Object.keys(req.body).forEach(key => {
      menuItem[key] = req.body[key];
    });
    
    await restaurant.save();
    
    // Return the updated menu item
    res.json(menuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Check if user is authorized
    if (!restaurant.owner.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this restaurant' });
    }
    
    // Remove the menu item
    restaurant.menu.pull({ _id: req.params.itemId });
    await restaurant.save();
    
    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Toggle menu item availability
export const toggleMenuItemAvailability = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Check if user is authorized
    if (!restaurant.owner.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this restaurant' });
    }
    
    // Find the menu item
    const menuItem = restaurant.menu.id(req.params.itemId);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Toggle isAvailable (use request body if provided, otherwise toggle current value)
    menuItem.isAvailable = req.body.isAvailable !== undefined 
      ? req.body.isAvailable 
      : !menuItem.isAvailable;
      
    await restaurant.save();
    
    // Return the updated menu item
    res.json(menuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
