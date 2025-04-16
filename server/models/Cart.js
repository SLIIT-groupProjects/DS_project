import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    customerId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    items: [{
        foodId: {type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true},
        size: {type: String, enum: ["Regular", "Large"], required: true},
        quantity: {type: Number, required: true, min: 1}
    }]
}, {timestamps: true});

export default mongoose.model("Cart", cartSchema);