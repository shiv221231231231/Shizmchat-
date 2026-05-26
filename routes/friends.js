const express = require('express');
const router = express.Router();
const Friend = require('../models/Friend');
const User = require('../models/User');

// Users Search API
router.get('/search/:name', async (req, res) => {
  try {
    const users = await User.find({
      name: { $regex: req.params.name, $options: 'i' }
    }).select('-password');
    res.json(users);
  } catch (error) {
    res.json({ message: 'Error: ' + error.message });
  }
});

// Friend Request Bhejna
router.post('/request', async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    const existing = await Friend.findOne({
      sender: senderId,
      receiver: receiverId
    });
    if (existing) {
      return res.json({ message: 'Request already sent!' });
    }
    const request = new Friend({
      sender: senderId,
      receiver: receiverId
    });
    await request.save();
    res.json({ message: 'Friend request sent! 🎉' });
  } catch (error) {
    res.json({ message: 'Error: ' + error.message });
  }
});

// Friend Requests Dekhna
router.get('/requests/:userId', async (req, res) => {
  try {
    const requests = await Friend.find({
      receiver: req.params.userId,
      status: 'pending'
    }).populate('sender', 'name email');
    res.json(requests);
  } catch (error) {
    res.json({ message: 'Error: ' + error.message });
  }
});

// Request Accept Karna
router.post('/accept', async (req, res) => {
  try {
    const { requestId } = req.body;
    await Friend.findByIdAndUpdate(
      requestId,
      { status: 'accepted' }
    );
    res.json({ message: 'Friend request accepted! 🎉' });
  } catch (error) {
    res.json({ message: 'Error: ' + error.message });
  }
});

// Friends List
router.get('/list/:userId', async (req, res) => {
  try {
    const friends = await Friend.find({
      $or: [
        { sender: req.params.userId, status: 'accepted' },
        { receiver: req.params.userId, status: 'accepted' }
      ]
    }).populate('sender receiver', 'name email');
    res.json(friends);
  } catch (error) {
    res.json({ message: 'Error: ' + error.message });
  }
});

module.exports = router;
