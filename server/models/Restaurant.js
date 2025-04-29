import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "RestaurantOwner", required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    cuisine: { type: String, required: true },
    logo: { type: String },
    openingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String },
    },
    isAvailable: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviews: [{ 
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, required: true },
        comment: { type: String },
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export default mongoose.model("Restaurant", restaurantSchema);
