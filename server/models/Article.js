// models/Article.js — FINAL VERSION (2025 LuxeNest Pro)

import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: {
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
    excerpt: {
      type: String,
      maxlength: 300,
      default: '',
    },

    // Long-form intro after hero image
    main_content: {
      type: String,
      default: '',
    },

    // LEGACY: Keep for old articles (will be phased out)
    content: {
      type: String,
      default: '',
    },

    // NEW: Rich structured sections — this is the future-proof
    content_sections: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        content: {
          type: String,
          default: '',
        },
        image: {
          type: String,
          trim: true,
        },
        quote: {
          type: String,
          trim: true,
        },
        products: [
          {
            product_id: {
              type: String,
              required: true,
            },
            name: {
              type: String,
              required: true,
            },
            price: {
              type: Number,
              required: true,
              min: 0,
            },
            image: {
              type: String,
              required: true,
            },
            affiliate_link: {
              type: String,
              default: '',
            },
          },
        ],
        _id: false, // cleaner output
      },
    ],

    hero_image: {
      type: String,
      default: '',
    },

    // SEO & UX
    read_time: {
      type: Number,
      min: 1,
      max: 60,
      default: 10,
    },
    key_takeaways: {
      type: String,
      default: '',
    },
    faq: {
      type: String, // JSON stringified array
      default: '[]',
    },

    // Author
    author_name: {
      type: String,
      default: 'LuxeNest Editorial',
    },
    author_title: String,
    author_bio: String,
    author_image: String,

    // Publishing
    published_at: {
      type: Date,
      default: Date.now,
    },
    modified_at: {
      type: Date,
    },

    // Internal linking & SEO
    tags: {
      type: [String],
      default: [],
    },
    related_topics: {
      type: [String],
      default: [],
    },

    // Relations
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-update modified_at
articleSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.modified_at = new Date();
  }
  next();
});

// Optional: Virtual to auto-migrate legacy `content` → content_sections on read
articleSchema.virtual('hasStructuredContent').get(function () {
  return this.content_sections && this.content_sections.length > 0;
});

// Clean output
articleSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.Article || mongoose.model('Article', articleSchema);