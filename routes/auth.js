const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// SIGNUP API
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: 'Email already exists!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'User not found!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ message: 'Wrong password!' });
    }

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
        email: user.email,
        avatar: user.avatar || null
      }
    });

  } catch (error) {
    res.json({ message: 'Error: ' + error.message });
  }
});

// UPDATE AVATAR API
router.post('/avatar', async (req, res) => {
  try {
    const { userId, avatarUrl } = req.body;

    if (!userId || !avatarUrl) {
      return res.json({ message: 'userId aur avatarUrl chahiye!' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true }
    );

    if (!user) {
      return res.json({ message: 'User not mila!' });
    }

    res.json({ message: 'Avatar update ho gaya! 🎉', avatar: user.avatar });

  } catch (error) {
    res.json({ message: 'Error: ' + error.message });
  }
});

// GET USER PROFILE (for avatars in chats)
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email avatar');
    if (!user) return res.json({ message: 'User not mila!' });
    res.json(user);
  } catch (error) {
    res.json({ message: 'Error: ' + error.message });
  }
});

module.exports = router;
