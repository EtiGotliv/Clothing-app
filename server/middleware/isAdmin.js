import { User } from '../../config/MongoDB.mjs';

export default async function isAdmin(req, res, next) {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'גישה אסורה – רק למנהלים' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: 'שגיאת שרת' });
  }
}
