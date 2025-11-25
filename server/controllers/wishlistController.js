import mongoose from 'mongoose';

const WishlistItem = mongoose.model('WishlistItem', new mongoose.Schema({
  session_id: String,
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  created_at: { type: Date, default: Date.now },
}));

export const addToWishlist = async (req, res) => {
  const { session_id, product_id } = req.body;
  await WishlistItem.updateOne(
    { session_id, product_id },
    { $setOnInsert: { session_id, product_id } },
    { upsert: true }
  );
  res.json({ success: true });
};

export const getWishlist = async (req, res) => {
  const { session_id } = req.query;
  const items = await WishlistItem.find({ session_id }).populate('product_id');
  const products = items.map(i => i.product_id).filter(Boolean);
  res.json(products);
};