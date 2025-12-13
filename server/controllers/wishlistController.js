import WishlistItem from '../models/Wishlist.js';

// Add item to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) return res.status(400).json({ message: "userId and productId required" });

    await WishlistItem.updateOne(
      { userId, productId },
      { $setOnInsert: { userId, productId } },
      { upsert: true }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("Wishlist add error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) return res.status(400).json({ message: "userId and productId required" });

    const deleted = await WishlistItem.findOneAndDelete({ userId, productId });
    if (!deleted) {
      return res.status(404).json({ message: "Item not found in wishlist" });
    }

    return res.json({ success: true, message: "Item removed from wishlist" });
  } catch (err) {
    console.error("Wishlist remove error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all wishlist items
export const getWishlist = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.json([]);

    const items = await WishlistItem.find({ userId: session_id })
      .populate({ path: 'productId', model: 'Product' });

    return res.json(items.map(item => item.productId)); // send only products
  } catch (err) {
    console.error('Wishlist fetch error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
