import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Analytics from '../models/Analytics.js';

export const initAdmin = async (req, res) => {
  const existing = await Admin.findOne({ username: 'admin' });
  if (existing) return res.json({ ok: true });

  await Admin.create({
    username: 'admin',
    password: process.env.ADMIN_PASSWORD, // plain text – change in production!
  });
  res.json({ ok: true });
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (admin && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/"
    });
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Invalid credentials' });
};

export const status = (req, res) => {
  res.json({ isAuthenticated: !!req.admin });
};

export const logout = (req, res) => {
  res.clearCookie('admin_token');
  res.json({ success: true });
};

export const getAnalytics = async (req, res) => {
  const analytics = await Analytics.find().sort({ last_visited_at: -1 });
  res.json(analytics);
};