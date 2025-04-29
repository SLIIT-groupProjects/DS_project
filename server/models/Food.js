import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: {type: String, required: true},
    restaurant: {type: String, required: true},
    price: {type: Number, required: true},
    reviews: {type: Number, default: 0},
    sold: {type: Number, default: 0},
    sizes: {type: [String], enum: ["Regular", "Large"], default: ["Regular", "Large"]},
    imageUrl: { type: String, required: true },
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" } // Add reference to MenuItem
}, {timestamps: true});

export default mongoose.model("Food", foodSchema);