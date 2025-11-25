// models/Article.js
import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
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
  },

  // NEW: Long-form introduction (right after hero)
  main_content: {
    type: String,
    default: '',
  },

  // Your signature structured content with [IMAGE:], > quotes, etc.
  content: {
    type: String,
    default: '',
  },

  hero_image: {
    type: String,
  },

  // SEO & UX Boosters
  read_time: {
    type: Number, // in minutes
    min: 1,
    max: 60,
  },
  key_takeaways: {
    type: String, // "Point 1||Point 2||Point 3"
  },
  faq: {
    type: String, // JSON string → '[{"question":"...", "answer":"..."}]'
  },

  // E-E-A-T & Author Credibility
  author_name: {
    type: String,
    default: 'LuxeNest Editorial',
  },
  author_title: String,
  author_bio: String,
  author_image: String,

  // Schema.org & Publishing Dates
  published_at: {
    type: Date,
    default: () => new Date(),
  },
  modified_at: {
    type: Date,
  },

  // Topic Authority & Internal Linking
  tags: {
    type: [String],
    default: [],
  },
  related_topics: {
    type: [String], // slugs or topic IDs
    default: [],
  },

  // Relations
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null,
  },
}, {
  timestamps: true, // createdAt & updatedAt
});

// Auto-update modified_at on save
articleSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.modified_at = new Date();
  }
  next();
});

// Virtual for clean JSON output (optional, for API responses)
articleSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Article || mongoose.model('Article', articleSchema);