import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    amount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    restaurantAmount: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending"
    },
    paymentMethod: { type: String, required: true },
    transactionDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);
