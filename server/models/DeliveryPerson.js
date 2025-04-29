import mongoose from 'mongoose';

const deliveryPersonSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

const DeliveryPerson = mongoose.model('DeliveryPerson', deliveryPersonSchema);
export default DeliveryPerson;