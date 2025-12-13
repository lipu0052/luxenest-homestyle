// controllers/productController.js
import Product from "../models/Product.js";

/**
 * GET /api/products
 * Optional: ?room_id=123 or ?room_id=null
 */
export const getProducts = async (req, res) => {
  try {
    const { room_id, ids } = req.query;

    const filter = {};

    // Support filtering by room_id
    if (room_id !== undefined) {
      filter.room_id = room_id === "null" || room_id === "" ? null : room_id;
    }

    // NEW: Support fetching specific products by comma-separated IDs
    // Example: /api/products?ids=670f123abc456def78901234,670f567abc456def78905678
    if (ids) {
      const idArray = ids
        .split(",")
        .map(id => id.trim())
        .filter(id => id.length === 24); // Basic MongoDB ObjectId length check

      if (idArray.length === 0) {
        return res.status(400).json({ message: "Invalid product IDs provided" });
      }

      filter._id = { $in: idArray };
    }

    // If both room_id and ids are provided, MongoDB will AND them (which is usually fine)
    // But if you want OR logic, you'd need $or – not needed here.

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json(products);
  } catch (err) {
    console.error("getProducts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/products/:slug
 */
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("getProductBySlug error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/products — Admin only
 */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      price,
      image,
      images = [],
      description = "",
      short_description = "",
      affiliate_link = "",
      room_id = null,
      old_price,
      in_stock = true,
    } = req.body;

    // Required fields
    if (!name || !slug || !price || !image) {
      return res.status(400).json({
        message: "Name, slug, price, and main image are required",
      });
    }

    // Ensure main image is first in images array
    let finalImages = Array.isArray(images) ? images.filter(Boolean) : [];
    if (!finalImages.includes(image)) {
      finalImages.unshift(image.trim());
    }

    const product = new Product({
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
      price: Number(price),
      old_price: old_price ? Number(old_price) : undefined,
      image: image.trim(),
      images: finalImages,
      description: description.trim(),
      short_description: short_description.trim(),
      affiliate_link: affiliate_link.trim(),
      room_id,
      in_stock,
    });

    await product.save();

    res.status(201).json(product);
  } catch (err) {
    console.error("createProduct error:", err);

    if (err.code === 11000) {
      return res.status(400).json({ message: "Slug already exists" });
    }

    res.status(500).json({ message: "Failed to create product" });
  }
};

/**
 * PUT /api/products/:id — Admin only
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === "undefined") {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const updates = { ...req.body };

    // Sync main image ↔ images array
    if (updates.image || updates.images) {
      const current = await Product.findById(id);
      if (!current) {
        return res.status(404).json({ message: "Product not found" });
      }

      const mainImage = updates.image || current.image;
      let gallery = Array.isArray(updates.images) ? updates.images : current.images || [];

      // Remove old main image if it exists, then put new one first
      gallery = gallery.filter((img) => img !== mainImage);
      gallery.unshift(mainImage);

      updates.image = mainImage;
      updates.images = gallery;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("updateProduct error:", err);

    if (err.code === 11000) {
      return res.status(400).json({ message: "Slug already exists" });
    }

    res.status(500).json({ message: "Failed to update product" });
  }
};

/**
 * DELETE /api/products/:id — Admin only
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("deleteProduct error:", err);
    res.status(500).json({ message: "Failed to delete product" });
  }
};