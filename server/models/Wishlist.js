// server/models/WishlistItem.js
import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // session ID as string
  productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
  addedAt: { type: Date, default: Date.now },
});

const WishlistItem = mongoose.model('WishlistItem', wishlistItemSchema);
export default WishlistItem;
