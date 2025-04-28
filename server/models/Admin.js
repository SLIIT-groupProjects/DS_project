import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    permissions: {
        manageRestaurants: { type: Boolean, default: true },
        manageUsers: { type: Boolean, default: true },
        manageTransactions: { type: Boolean, default: true }
    }
}, { timestamps: true });

// Hash password before saving
adminSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

export default mongoose.model("Admin", adminSchema);
