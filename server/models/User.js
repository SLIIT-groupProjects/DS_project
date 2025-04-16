import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    address: {type: String, required: true},
    phone: {type: String, required: true},
    email: {type: String, reuired: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum: ["customer", "admin"], default: "customer"}
}, {timestamps: true});

export default mongoose.model("User", userSchema);