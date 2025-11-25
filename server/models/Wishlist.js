import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user_id: String,        // for logged-in users (future)
  session_id: String,     // for guests
}, { timestamps: true });

export default mongoose.model('Wishlist', wishlistSchema);