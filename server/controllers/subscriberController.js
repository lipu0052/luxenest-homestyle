import Subscriber from '../models/Subscriber.js';

export const subscribe = async (req, res) => {
  const { email } = req.body;
  try {
    await Subscriber.create({ email });
    res.json({ success: true });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Already subscribed' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSubscribers = async (req, res) => {
  const subs = await Subscriber.find().sort({ subscribed_at: -1 });
  res.json(subs);
};