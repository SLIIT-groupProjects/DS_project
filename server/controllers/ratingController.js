import Rating from "../models/Rating.js";
import Order from "../models/Order.js";

export const submitRating = async (req, res) => {
    try {
        const { orderId, rating, review } = req.body;
        const customerId = req.user.id; // Get customerId from the JWT token (authenticated user)

        // Validate rating value
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5 stars" });
        }

        // Ensure the order exists and belongs to the customer
        const order = await Order.findOne({ _id: orderId, customerId });
        if (!order) {
            return res.status(404).json({ message: "Order not found or doesn't belong to the customer" });
        }

        // Check if a rating already exists for this order
        const existingRating = await Rating.findOne({ orderId, customerId });
        if (existingRating) {
            return res.status(400).json({ message: "You have already rated this order" });
        }

        // Save new rating
        const newRating = new Rating({ customerId, orderId, rating, review });
        await newRating.save();

        // Return the response with the new rating
        res.status(201).json({
            message: "Rating submitted successfully",
            rating: newRating,
        });
    } catch (error) {
        console.error("Error submitting rating:", error); // Additional logging
        res.status(500).json({ message: "Error submitting rating", error: error.message });
    }
};

export const getOrderRatings = async (req, res) => {
    try {
        const ratings = await Rating.find().populate("customerId", "name").populate("orderId"); // Populate the `orderId` for ratings
        res.status(200).json(ratings);
    } catch (error) {
        console.error("Error retrieving ratings:", error);
        res.status(500).json({ message: "Error retrieving ratings", error: error.message });
    }
};
