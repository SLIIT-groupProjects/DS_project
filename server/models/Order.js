import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true
    },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    name: String,
    notes: String
});

const orderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    items: [orderItemSchema], // Replacing simple items schema with detailed orderItemSchema
    totalPayable: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ["pending", "accepted", "picked up", "delivered", "confirmed", "preparing", "ready", "cancelled"], 
        default: "pending" 
    },
    deliveryOption: { type: String, enum: ["standard", "schedule"], required: true },
    scheduledTime: { type: Date, default: null },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
    isRated: { type: Boolean, default: false },
    deliveryFee: Number,
    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    },
    paymentMethod: String,
    estimatedDeliveryTime: Date,
    restaurant: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Restaurant", 
        required: true 
    }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
