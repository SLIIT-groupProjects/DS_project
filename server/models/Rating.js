import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
    customerId: {type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true},
    orderId: {type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true},
    rating: {type: Number, required: true, min: 1, max: 5},
    review: {type: String, default: ""}
}, {timestamps: true});

export default mongoose.model("Rating", ratingSchema);