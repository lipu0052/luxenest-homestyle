// models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  affiliate_link: String,   // ← NEW FIELD
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);