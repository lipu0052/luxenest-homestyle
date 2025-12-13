// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    short_description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
    old_price: {
      type: Number,
      min: 0,
    },

    // MAIN IMAGE — Required, used as primary/hero everywhere
    image: {
      type: String,
      required: true,
      trim: true,
    },

    // FULL GALLERY — Optional array of additional images
    // Always includes the main image as first item when saved from admin
    images: [
      {
        type: String,
        trim: true,
      },
    ],

    affiliate_link: {
      type: String,
      trim: true,
      default: "",
    },

    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
      index: true,
    },

    in_stock: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    review_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure slug is unique + index for fast lookup
productSchema.index({ slug: 1 });

// Optional: Auto-populate room name in queries (if you use .populate())
productSchema.pre(/^find/, function (next) {
  this.populate({
    path: "room_id",
    select: "name slug",
  });
  next();
});

export default mongoose.model("Product", productSchema);