import Product from '../models/Product.js';

export const getProducts = async (req, res) => {
  const { room_id } = req.query;
  const filter = room_id ? { room_id: room_id === 'null' ? null : room_id } : {};
  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
  res.send('OK');
};

export const getProductBySlug = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

export const createProduct = async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.status(201).json(product);
};

export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
};

export const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};