import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: String,
  isAvailable: { type: Boolean, default: true }
});

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  address: { type: String, required: true },
  phone: String,
  cuisine: String,
  rating: Number,
  imageUrl: String,
  bannerImage: String,
  isActive: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  deliveryFee: Number,
  menu: [menuItemSchema],
  owner: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Restaurant', restaurantSchema);
