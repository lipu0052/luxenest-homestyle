// controllers/wishlistController.js   (or wherever you have it)

import mongoose from "mongoose";

// Define schema + model (only once, safely)
const wishlistItemSchema = new mongoose.Schema(
  {
    session_id: { type: String, required: true },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at" } }
);

// Prevent "Cannot redefine model" error in development
const WishlistItem =
  mongoose.models.WishlistItem ||
  mongoose.model("WishlistItem", wishlistItemSchema);

// ADD TO WISHLIST
export const addToWishlist = async (req, res) => {
  const { session_id, product_id } = req.body;

  if (!session_id || !product_id) {
    return res.status(400).json({ error: "Missing data" });
  }

  try {
    await WishlistItem.updateOne(
      { session_id, product_id },
      { $setOnInsert: { session_id, product_id } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Add error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET WISHLIST
// GET WISHLIST - FIXED VERSION
export const getWishlist = async (req, res) => {
  const session_id = req.query.session_id;

  if (!session_id) {
    return res.json([]);
  }

  try {
    const items = await WishlistItem.find({ session_id })
      .populate("product_id")
      .sort({ created_at: -1 })
      .lean();

    // THIS IS THE KEY FIX:
    const products = items
      .map((item) => item.product_id)  // extract the actual product
      .filter((product) => product !== null && product !== undefined); // remove deleted products

    res.json(products);
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({ error: "Failed to load wishlist" });
  }
};