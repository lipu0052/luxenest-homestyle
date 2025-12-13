// src/types.ts — FINAL 2025 LuxeNest Pro Types

export interface Room {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  hero_image?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ──────────────────────────────────────────────────────
// PRODUCT
// ──────────────────────────────────────────────────────
export interface Product {
  _id: string;
  name: string;
  slug: string;

  description?: string;
  short_description?: string;

  price: number;
  old_price?: number;

  // Main hero image — required (used in cards, SEO, OpenGraph)
  image: string;

  // Optional full gallery (main + additional images)
  // If present, images[0] should always equal image
  images?: string[];

  room_id: string | null;
  affiliate_link?: string;

  in_stock?: boolean;
  rating?: number;
  review_count?: number;

  createdAt?: string;
  updatedAt?: string;
}

// ──────────────────────────────────────────────────────
// ARTICLE CONTENT
// ──────────────────────────────────────
export interface ProductInSection {
  product_id: string;
  name: string;
  price: number;
  image: string;
  affiliate_link: string;
}

export interface ContentSection {
  title: string;
  content: string;
  image?: string;
  quote?: string;
  products?: ProductInSection[];
}

// ──────────────────────────────────────────────────────
// ARTICLE — FULLY UPGRADED
// ──────────────────────────────────────────────────────
export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;

  // Long-form intro after hero
  main_content?: string;

  // LEGACY: kept for backward compatibility
  content?: string;

  // NEW: Rich structured sections with products
  content_sections?: ContentSection[];

  hero_image?: string;
  room_id: string | null;

  // SEO & UX
  read_time?: number;
  key_takeaways?: string;
  faq?: string; // JSON stringified array

  // Author
  author_name?: string;
  author_title?: string;
  author_bio?: string;
  author_image?: string;

  // Publishing
  published_at?: string;
  modified_at?: string;

  // Topics & linking
  tags?: string[];
  related_topics?: string[];

  createdAt?: string;
  updatedAt?: string;
}

// ──────────────────────────────────────────────────────
// REVIEW & ANALYTICS
// ──────────────────────────────────────────────────────
export interface Review {
  _id: string;
  author_name: string;
  rating: number;
  comment?: string;
  product_id: string;
  created_at: string;
  verified?: boolean;
}

export interface Analytics {
  page_path: string;
  visit_count: number;
  last_visited_at: string;
  avg_time_on_page?: number;
}

// ──────────────────────────────────────────────────────
// UTILS
// ──────────────────────────────────────────────────────
export type EntityWithId = Room | Article | Product | Review;
export type AdminTab = "rooms" | "articles" | "products" | "subscribers" | "analytics";