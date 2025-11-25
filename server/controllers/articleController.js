// controllers/articleController.js
import Article from '../models/Article.js';
import mongoose from 'mongoose';

// Helper: Calculate reading time (words per minute = 225)
const calculateReadTime = (text = '') => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 225));
  return minutes;
};

// GET /api/articles
export const getArticles = async (req, res) => {
  try {
    const { room_id, tag, limit = 12, page = 1 } = req.query;

    const filter = {};
    if (room_id && room_id !== 'null') filter.room_id = room_id;
    if (room_id === 'null') filter.room_id = null;
    if (tag) filter.tags = tag;

    const skip = (Number(page) - 1) * Number(limit);

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .sort({ published_at: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('_id title slug excerpt hero_image read_time tags room_id published_at')
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

// 🚩 FIX: Unified controller to handle both slug and ID (used by frontend edit)
// GET /api/articles/:param
export const getArticleByParam = async (req, res) => {
  try {
    const { param } = req.params;
    let query = {};

    // Check if the parameter is a valid MongoDB ObjectId (for Admin use)
    if (mongoose.Types.ObjectId.isValid(param)) {
      query._id = param;
    } else {
      // Otherwise, search by slug (for public use)
      query.slug = param;
    }

    const article = await Article.findOne(query).lean();

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    console.error('getArticleByParam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/articles
export const createArticle = async (req, res) => {
  try {
    const data = { ...req.body };

    // Auto-calculate read_time
    if (!data.read_time) {
      const text = (data.main_content || '') + ' ' + (data.content || '');
      data.read_time = calculateReadTime(text);
    }

    // Set published_at if not provided
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

// PUT /api/articles/:id
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const data = { ...req.body };

    // Recalculate read_time if content changed
    if (data.main_content || data.content) {
      const current = await Article.findById(id);
      const main = data.main_content || current.main_content || '';
      const content = data.content || current.content || '';
      data.read_time = calculateReadTime(main + ' ' + content);
    }

    data.modified_at = new Date();

    const article = await Article.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

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
      return res.status(400).json({ message: 'Invalid ID' });
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

// Optional: For Related Topics section
export const getRelatedTopics = async (req, res) => {
  try {
    const { related_to } = req.query;
    if (!related_to) return res.json([]);

    const article = await Article.findById(related_to).select('related_topics tags');
    if (!article) return res.json([]);

    const topics = (article.related_topics || []).map(slug => ({
      title: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      slug,
      excerpt: `Deep dive into ${slug.replace(/-/g, ' ')} design trends and tips`,
      image: null, // You can populate later
    }));

    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching related topics' });
  }
};