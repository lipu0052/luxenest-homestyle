import Analytics from '../models/Analytics.js';

// Automatically tracks every API call (same logic as before)
const trackAnalytics = async (req, res, next) => {
  if (req.path.startsWith('/api') && !req.path.includes('/analytics')) {
    await Analytics.findOneAndUpdate(
      { page_path: req.path },
      { 
        $inc: { visit_count: 1 },
        $set: { last_visited_at: new Date() }
      },
      { upsert: true }
    );
  }
  next();
};

export default trackAnalytics;