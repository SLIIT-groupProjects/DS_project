import mongoose from 'mongoose';

const assignedOrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    customerLocation: {
        lat: Number,
        lng: Number
    },
    deliveryPerson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryPerson',
        required: false,//till a delivery person is pending
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'pickedUp', 'delivered'],
        default: 'pending'
    }
}, { timestamps: true });

const AssignedOrder = mongoose.model('AssignedOrder', assignedOrderSchema);
export default AssignedOrder;