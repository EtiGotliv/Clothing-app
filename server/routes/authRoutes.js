import express from 'express';
import User from '../models/User.js';
import { createJSONToken } from '../util/auth.js';
import { isValidEmail, isValidText } from '../util/validation.js';

const router = express.Router();

router.post('/signup', async (req, res, next) => {
  const data = req.body;
  let errors = {};

  // בדיקת אימייל
  if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email.';
  } else {
    try {
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        errors.email = 'Email exists already.';
      }
    } catch (error) {
      console.error("Error in finding user:", error);
      return res.status(500).json({ message: "Error checking existing user." });
    }
  }

  // בדיקת סיסמה
  if (!isValidText(data.password, 6)) {
    errors.password = 'Invalid password. Must be at least 6 characters long.';
  }

  // אם יש שגיאות - מחזירים
  if (Object.keys(errors).length > 0) {
    return res.status(422).json({ message: 'Signup failed.', errors });
  }

  try {
    // יצירת המשתמש – נניח שהמודל משתמש בוירטואל "password" שמבצע הצפנה
    const user = new User({ name: data.name, email: data.email, password: data.password });
    await user.save();
    const token = createJSONToken(user);
    return res.status(201).json({ message: 'User created.', user, token });
  } catch (error) {
    console.error("Error saving user:", error);
    return res.status(500).json({ message: 'Internal server error during signup.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.authenticate(password)) {
      return res.status(401).json({ message: 'Authentication failed.' });
    }
    const token = createJSONToken(user);
    return res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
});

export default router;
