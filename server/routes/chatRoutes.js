import express from "express";
import ChatMessage from "../models/ChatMessage.js";
import mongoose from "mongoose";

const router = express.Router();

// Get messages for an order
router.get("/:orderId", async (req, res) => {
  try {
    const messages = await ChatMessage.find({ orderId: req.params.orderId }).sort("timestamp");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send a message
router.post("/send", async (req, res) => {
  try {
    const { orderId, sender, message } = req.body;

    // Log incoming payload for debugging
    console.log("Chat POST /send payload:", req.body);

    // Validate required fields
    if (!orderId || !sender || !message || !message.trim()) {
      console.error("Chat send error: Missing or empty fields", req.body);
      return res.status(400).json({ error: "Missing or empty fields" });
    }

    // Validate orderId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.error("Chat send error: Invalid orderId", orderId);
      return res.status(400).json({ error: "Invalid orderId" });
    }

    const chatMessage = await ChatMessage.create({
      orderId: new mongoose.Types.ObjectId(orderId),
      sender,
      message,
    });
    res.json(chatMessage);
  } catch (err) {
    console.error("Chat send error:", err.message, err.stack);
    res.status(500).json({ error: "Failed to send message", details: err.message });
  }
});

export default router;
