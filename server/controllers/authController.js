// server/controllers/authController.js
import { User } from '../../config/MongoDB.mjs';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (user) {
      return res.json({
        status: "success",
        userId: user._id,
        name: user.name,
        role: user.role, // ✅ זה התיקון
      });
    } else {
      return res.json({ status: "notexist" });
    }
  } catch (error) {
    console.error(error);
    return res.json({ status: "fail" });
  }
};

export const signupUser = async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  try {
    const check = await User.findOne({ email });
    if (check) return res.json("exist");

    const newUser = await User.create({ name, email, password, role });

    return res.json({
      status: "success",
      userId: newUser._id,
      name: newUser.name,
      role: newUser.role, 
    });
  } catch (error) {
    console.error(error);
    return res.json({ status: "fail", error: error.message });
  }
};
