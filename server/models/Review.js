import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  author_name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model('Review', reviewSchema);