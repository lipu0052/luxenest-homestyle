import Review from '../models/Review.js';

export const getReviews = async (req, res) => {
  const reviews = await Review.find({ product_id: req.params.productId }).sort({ created_at: -1 });
  res.json(reviews);
};

export const createReview = async (req, res) => {
  const review = new Review(req.body);
  await review.save();
  res.status(201).json(review);
};