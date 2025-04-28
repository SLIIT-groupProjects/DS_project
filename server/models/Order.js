import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    items: [
        {
            name: String,
            price: Number,
            size: String,
            quantity: Number
        }
    ],

    totalPayable: { type: Number, required: true },
    status: { type: String, enum: ["paid", "pending", "accepted", "pickedUp", "delivered"], default: "pending" },
    deliveryOption: { type: String, enum: ["standard", "schedule"], required: true },
    scheduledTime: { type: Date, default: null },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
    isRated: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);