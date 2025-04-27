import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const restaurantOwnerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, default: "restaurant_owner" },
    isVerified: { type: Boolean, default: false },
    verificationDocuments: {
        businessLicense: { type: String },
        identityProof: { type: String },
        addressProof: { type: String }
    }
}, { timestamps: true });

// Hash password before saving
restaurantOwnerSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

export default mongoose.model("RestaurantOwner", restaurantOwnerSchema);
