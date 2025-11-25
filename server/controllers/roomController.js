import Room from '../models/Room.js';

export const getRooms = async (req, res) => {
  const rooms = await Room.find().sort({ createdAt: -1 });
  res.json(rooms);
};

export const getRoomBySlug = async (req, res) => {
  const room = await Room.findOne({ slug: req.params.slug });
  if (!room) return res.status(404).json({ message: 'Room not found' });
  res.json(room);
};

export const createRoom = async (req, res) => {
  const room = new Room(req.body);
  await room.save();
  res.status(201).json(room);
};

export const updateRoom = async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(room);
};

export const deleteRoom = async (req, res) => {
  await Room.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};