// controllers/articleController.js — FINAL VERSION (2025 LuxeNest Pro)

import Article from '../models/Article.js';
import mongoose from 'mongoose';

// Helper: Calculate reading time (~225 words per minute)
const calculateReadTime = (main = '', sections = []) => {
  let text = main || '';

  if (Array.isArray(sections)) {
    sections.forEach(sec => {
      text += ' ' + (sec.content || '');
    });
  }

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 225));
};

// GET /api/articles — list (lightweight)
export const getArticles = async (req, res) => {
  try {
    const { room_id, tag, limit = 12, page = 1 } = req.query;
    const filter = {};

    if (room_id && room_id !== 'null' && room_id !== '') {
      if (mongoose.Types.ObjectId.isValid(room_id)) {
        filter.room_id = new mongoose.Types.ObjectId(room_id);
      }
    } else if (room_id === 'null' || room_id === '') {
      filter.room_id = null;
    }

    if (tag) filter.tags = tag;

    const skip = (Number(page) - 1) * Number(limit);

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .sort({ published_at: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('title slug excerpt hero_image read_time tags room_id createdAt published_at')
        .lean(),
      Article.countDocuments(filter),
    ]);

    res.json({
      articles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('getArticles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/articles/slug/:slug — public article page
export const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ message: 'Slug required' });

    const article = await Article.findOne({ slug }).lean();
    if (!article) return res.status(404).json({ message: 'Article not found' });

    // Auto-calculate read_time if missing (supports new content_sections)
    if (!article.read_time) {
      article.read_time = calculateReadTime(article.main_content, article.content_sections);
    }

    res.json(article);
  } catch (error) {
    console.error('getArticleBySlug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/articles/:id — ADMIN ONLY (full article with content_sections + products)
export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid article ID' });
    }

    const article = await Article.findById(id).lean();
    if (!article) return res.status(404).json({ message: 'Article not found' });

    // Ensure read_time is up-to-date
    if (!article.read_time) {
      article.read_time = calculateReadTime(article.main_content, article.content_sections);
    }

    res.json(article);
  } catch (error) {
    console.error('getArticleById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/articles — create (admin)
export const createArticle = async (req, res) => {
  try {
    const data = { ...req.body };

    // Calculate read_time from main_content + all section content
    data.read_time = calculateReadTime(data.main_content, data.content_sections);

    if (!data.published_at) {
      data.published_at = new Date();
    }

    const article = new Article(data);
    await article.save();

    res.status(201).json(article);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Slug already exists' });
    }
    console.error('createArticle error:', error);
    res.status(500).json({ message: 'Failed to create article' });
  }
};

// PUT /api/articles/:id — update (admin)
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid article ID' });
    }

    const data = { ...req.body };

    // Recalculate read_time if main_content or content_sections changed
    const current = await Article.findById(id).lean();
    const main = data.main_content ?? current?.main_content ?? '';
    const sections = data.content_sections ?? current?.content_sections ?? [];

    data.read_time = calculateReadTime(main, sections);
    data.modified_at = new Date();

    const article = await Article.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Slug already exists' });
    }
    console.error('updateArticle error:', error);
    res.status(500).json({ message: 'Failed to update article' });
  }
};

// DELETE /api/articles/:id
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid article ID' });
    }

    const article = await Article.findByIdAndDelete(id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('deleteArticle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};