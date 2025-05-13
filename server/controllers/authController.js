import { User, connectDB } from '../../config/MongoDB.mjs';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (user) {
      return res.json({ status: "success", userId: user._id, name: user.name });
    } else {
      return res.json({ status: "notexist" });
    }
  } catch (error) {
    console.error(error);
    return res.json({ status: "fail" });
  }
};

export const signupUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const check = await User.findOne({ email });
    if (check) {
      return res.json("exist");
    }
    const newUser = await User.create({ name, email, password });
    return res.json({ status: "success", userId: newUser._id });
  } catch (error) {
    console.error(error);
    return res.json({ status: "fail", error: error.message });
  }
};
