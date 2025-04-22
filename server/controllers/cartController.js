// cartController.js

import Cart from "../models/Cart.js";
import Food from "../models/Food.js";

// Add food item to cart
export const addToCart = async (req, res) => {
    try {
        const { foodId, size, quantity } = req.body;
        const customerId = req.user.id; // Get customerId from the authenticated user (JWT token)

        let cart = await Cart.findOne({ customerId });

        if (!cart) {
            cart = new Cart({ customerId, items: [] });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.foodId.toString() === foodId && item.size === size
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ foodId, size, quantity });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error adding item to cart", error });
    }
};

// Update cart item
export const updateCart = async (req, res) => {
    try {
        const { cartItemId } = req.params;
        const { quantity } = req.body;

        const cart = await Cart.findOneAndUpdate(
            { "items._id": cartItemId, customerId: req.user.id },
            { $set: { "items.$.quantity": quantity } },
            { new: true }
        );

        if (!cart) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        res.status(200).json({ message: "Cart item updated successfully", cart });
    } catch (error) {
        res.status(500).json({ message: "Error updating cart item", error });
    }
};

// Delete cart item
export const deleteCartItem = async (req, res) => {
    try {
        const { cartItemId } = req.params;

        const cart = await Cart.findOneAndUpdate(
            { "items._id": cartItemId, customerId: req.user.id },
            { $pull: { items: { _id: cartItemId } } },
            { new: true }
        );

        if (!cart) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        res.status(200).json({ message: "Item removed from cart", cart });
    } catch (error) {
        res.status(500).json({ message: "Error removing item from cart", error });
    }
};

// Get cart details for the logged customer
export const getCart = async (req, res) => {
    try {
        const customerId = req.user.id; // Get customerId from the JWT token
        let cart = await Cart.findOne({ customerId }).populate("items.foodId");

        if (!cart) {
            return res.status(200).json({ items: [], totalPayable: 0 });
        }

        // Calculate total payable amount
        let totalPayable = 0;
        const formattedItems = cart.items.map((item) => {
            const foodPrice = item.foodId.price;
            const foodImage = item.foodId.imageUrl;
            const payableAmount = foodPrice * item.quantity;
            totalPayable += payableAmount;

            return {
                _id: item._id,
                name: item.foodId.name,
                price: foodPrice,
                size: item.size,
                quantity: item.quantity,
                image: foodImage,
            };
        });

        res.status(200).json({ items: formattedItems, totalPayable });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving cart", error });
    }
};
