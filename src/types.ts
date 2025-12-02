// src/types.ts
export interface Room {
  _id: string;
  id?: number;
  name: string;
  slug: string;
  description?: string;
  hero_image?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[]; // Optional: for topic clustering
}

export interface Article {
  _id: string;
  id?: number;
  title: string;
  slug: string;
  excerpt?: string;

  // Main long-form content (appears right after hero)
  main_content?: string;        // ← NEW: Rich intro text (10k+ char support)

  // Structured numbered points (your signature style)
  content?: string;             // ← Still used for [IMAGE:], > quotes, etc.

  hero_image?: string;
  room_id: string | null;

  // SEO & E-E-A-T Boosters
  read_time?: number;           // ← NEW: in minutes (e.g., 12)
  key_takeaways?: string;       // ← NEW: "Point 1||Point 2||Point 3"
  faq?: string;                 // ← NEW: JSON string → [{question, answer}]

  // Author & Credibility
  author_name?: string;         // ← NEW: e.g., "Emma Clarke"
  author_title?: string;        // ← e.g., "Senior Interior Designer"
  author_bio?: string;
  author_image?: string;

  // Schema & Indexing
  published_at?: string;        // ISO date for Article schema
  modified_at?: string;

  // Topic & Internal Linking
  tags?: string[];              // ← NEW: for related topics & clusters
  related_topics?: string[];    // ← NEW: array of topic slugs or IDs

  createdAt?: string;
  updatedAt?: string;
}
 
export interface Product {
  _id: string;
  id?: number;
  name: string;
  slug: string;
  description?: string;         // Long rich description (supports HTML/markup if needed)
  short_description?: string;   // ← NEW: For cards & hover previews
  price: number;
  old_price?: number;           // ← NEW: For discounts/sales
  image?: string;
  images?: string[];            // Gallery
  room_id: string | null;
  affiliate_link?: string;
  in_stock?: boolean;           // ← NEW
  rating?: number;              // ← NEW: average from reviews
  review_count?: number;

  createdAt?: string;
  updatedAt?: string;
}


export interface Review {
  _id: string;
  id?: number;
  author_name: string;
  rating: number;
  comment?: string;
  product_id: string;
  created_at: string;
  verified?: boolean; // ← NEW: for trust signals
}

export interface Analytics {
  page_path: string;
  visit_count: number;
  last_visited_at: string;
  avg_time_on_page?: number; // ← NEW: for engagement tracking
}

export type EntityWithId = Room | Article | Product | Review ;
export type AdminTab = "rooms" | "articles" | "products" | "topics" | "subscribers" | "analytics";