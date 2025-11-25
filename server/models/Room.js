// server/models/Room.js
import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  hero_image: String,           // main hero (kept for backward compat)
  images: [String],             // ← NEW: multiple images array
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);