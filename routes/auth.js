const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// SIGNUP API
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check karo user pehle se hai kya
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: 'Email already exists!' });
    }

    // Password encrypt karo
    const hashedPassword = await bcrypt.hash(password, 10);

    // User banao
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({ message: 'Signup successful! 🎉' });

  } catch (error) {
    res.json({ message: 'Error: ' + error.message });
  }
});
// LOGIN API
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // User dhundho
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'User not found!' });
    }

    // Password check karo
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ message: 'Wrong password!' });
    }

    // Token banao
    const token = jwt.sign(
      { userId: user._id },
      'shibbu_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful! 🎉',
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.json({ message: 'Error: ' + error.message });
  }
});
module.exports = router;

