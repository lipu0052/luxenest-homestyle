import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  page_path: { type: String, required: true },
  visit_count: { type: Number, default: 1 },
  last_visited_at: { type: Date, default: Date.now },
}, { timestamps: true });

analyticsSchema.index({ page_path: 1 });

export default mongoose.model('Analytics', analyticsSchema);