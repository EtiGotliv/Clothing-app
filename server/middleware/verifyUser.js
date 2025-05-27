import mongoose from 'mongoose';

export default function verifyUser(req, res, next) {
  const userId = req.headers['x-user-id'];

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(401).json({ error: "User ID is missing or invalid" });
  }

  req.userId = new mongoose.Types.ObjectId(userId);
  next();
}
