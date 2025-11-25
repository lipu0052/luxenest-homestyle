import Room from '../models/Room.js';
import Article from '../models/Article.js';
import Product from '../models/Product.js';

export const search = async (req, res) => {
  const q = req.query.q?.trim();
  if (!q) return res.json({ rooms: [], articles: [], products: [] });

  const searchRegex = new RegExp(q, 'i');

  const [rooms, articles, products] = await Promise.all([
    Room.find({ $or: [{ name: searchRegex }, { description: searchRegex }] }).limit(6),
    Article.find({ $or: [{ title: searchRegex }, { excerpt: searchRegex }, { content: searchRegex }] }).limit(9),
    Product.find({ $or: [{ name: searchRegex }, { description: searchRegex }] }).limit(12),
  ]);

  res.json({ rooms, articles, products });
};