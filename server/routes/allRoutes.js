// routes/api.js — FINAL 2025 LuxeNest Pro API Routes (Perfect & Complete)

import { Router } from "express";
import { protectAdmin } from "../middleware/auth.js";

// Controllers
import {
  getRooms,
  getRoomBySlug,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../controllers/roomController.js";

import {
  getArticles,
  getArticleBySlug,
  getArticleById,        // Critical for admin modal
  createArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/articleController.js";

import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import { getReviews, createReview } from "../controllers/reviewController.js";
import { search } from "../controllers/searchController.js";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";

import { subscribe, getSubscribers } from "../controllers/subscriberController.js";

import {
  initAdmin,
  login,
  status,
  logout,
  getAnalytics,
} from "../controllers/adminController.js";


const router = Router();

// =============================
// PUBLIC ROUTES
// =============================
router.get("/rooms", getRooms);
router.get("/rooms/:slug", getRoomBySlug);

router.get("/articles", getArticles);
router.get("/articles/:slug", getArticleBySlug);

router.get("/products", getProducts);
router.get("/products/:slug", getProductBySlug);

router.get("/reviews/:productId", getReviews);
router.post("/reviews", createReview);

router.get("/search", search);

router.post("/wishlist", addToWishlist);
router.get("/wishlist", getWishlist);
router.delete("/wishlist", removeFromWishlist);

router.post("/subscribers", subscribe);

// =============================
// ADMIN AUTH ROUTES
// =============================
router.post("/admin/init", initAdmin);
router.post("/admin/login", login);
router.get("/admin/status", status);
router.post("/admin/logout", logout);

// Protect all routes under /admin/*
router.use("/admin", protectAdmin);

// Admin-only protected routes
router.get("/admin/analytics", getAnalytics);
router.get("/admin/subscribers", getSubscribers);

// =============================
// ADMIN CRUD ROUTES (Protected)
// =============================

// Rooms
router.post("/rooms", createRoom);
router.put("/rooms/:id", updateRoom);
router.delete("/rooms/:id", deleteRoom);

// Articles
router.post("/articles", createArticle);
router.put("/articles/:id", updateArticle);
router.delete("/articles/:id", deleteArticle);

// Critical: Admin fetches full article with content_sections by ID
router.get("/admin/articles/:id", getArticleById);

// Products — FULLY SUPPORTS MULTI-IMAGE
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);     // This was missing!
router.delete("/products/:id", deleteProduct);

// AI Chat


export default router;