// [Your Router File]

import { Router } from 'express';
import { protectAdmin } from '../middleware/auth.js';

// Controllers
import {
  getRooms, getRoomBySlug, createRoom, updateRoom, deleteRoom
} from '../controllers/roomController.js';

import {
  getArticles, getArticleBySlug, createArticle, updateArticle, deleteArticle
} from '../controllers/articleController.js'; // 🚩 CHANGED: Import getArticleByParam

import {
  getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct
} from '../controllers/productController.js';

import { getReviews, createReview } from '../controllers/reviewController.js';
import { search } from '../controllers/searchController.js';
import { addToWishlist, getWishlist } from '../controllers/wishlistController.js';
import { subscribe, getSubscribers } from '../controllers/subscriberController.js';
import {
  initAdmin, login, status, logout, getAnalytics
} from '../controllers/adminController.js';

const router = Router();

// Public routes
router.get('/rooms', getRooms);
router.get('/rooms/:slug', getRoomBySlug);

router.get('/articles', getArticles);
router.get('/articles/:slug', getArticleBySlug); // NEW clean route

router.get('/products', getProducts);
router.get('/products/:slug', getProductBySlug);

router.get('/reviews/:productId', getReviews);
router.post('/reviews', createReview);

router.get('/search', search);

router.post('/wishlist', addToWishlist);
router.get('/wishlist', getWishlist);

router.post('/subscribers', subscribe);

// Admin routes
router.post('/admin/init', initAdmin);
router.post('/admin/login', login);
router.get('/admin/status', status);
router.post('/admin/logout', logout);

router.use('/admin', protectAdmin);

router.get('/admin/analytics', getAnalytics);
router.get('/admin/subscribers', getSubscribers);

// Protected CRUD (admin only)
router.post('/rooms', protectAdmin, createRoom);
router.put('/rooms/:id', protectAdmin, updateRoom);
router.delete('/rooms/:id', protectAdmin, deleteRoom);

router.post('/articles', protectAdmin, createArticle);
router.put('/articles/:id', protectAdmin, updateArticle);
router.delete('/articles/:id', protectAdmin, deleteArticle);

router.post('/products', protectAdmin, createProduct);
router.put('/products/:id', protectAdmin, updateProduct);
router.delete('/products/:id', protectAdmin, deleteProduct);

export default router;