// models/Wishlist.ts
import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
}, { 
  timestamps: true,
  // Prevent same user (session) adding same product twice
  indexes: [{ session_id: 1, product_id: 1 }, { unique: true }]
});

// Prevent model redefinition error in dev
const Wishlist = mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;