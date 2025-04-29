import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    category: { type: String, required: true },
    imageUrl: { type: String },
    isAvailable: { type: Boolean, default: true },
    sizes: { type: [String], enum: ["Regular", "Large"], default: ["Regular", "Large"] },
    prepTime: { type: Number, default: 15 }, // in minutes
    specialDiet: {
        isVegetarian: { type: Boolean, default: false },
        isVegan: { type: Boolean, default: false },
        isGlutenFree: { type: Boolean, default: false }
    },
    popularity: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("MenuItem", menuItemSchema);
