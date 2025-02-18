import User from "../models/User.js";

export const signup = (req, res) => {
  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        error: "Unable to add user"
      });
    }
    res.json({
      message: "Success",
      user
    });
  });
};

export const getUserCount = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({ count: userCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user count" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ message: "משתמש לא נמצא" });
    delete user.password;
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "שגיאה בשליפת פרטי המשתמש" });
  }
};
