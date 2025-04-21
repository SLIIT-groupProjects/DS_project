import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['payment', 'refund', 'payout', 'fee'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  description: String,
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  paymentMethod: String,
  transactionId: String,
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

export default mongoose.model('Transaction', transactionSchema);
