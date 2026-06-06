const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const GroupMessage = require('../models/GroupMessage');
const User = require('../models/User');

// Group banao
router.post('/create', async (req, res) => {
  try {
    const { name, members, createdBy } = req.body;
    const group = new Group({ name, members: [...members, createdBy], createdBy });
    await group.save();
    res.json({ success: true, group });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Mera groups list
router.get('/list/:userId', async (req, res) => {
  try {
    const groups = await Group.find({ members: req.params.userId });
    res.json(groups);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Message bhejo
router.post('/send', async (req, res) => {
  try {
    const { groupId, senderId, text, type } = req.body;
    const msg = new GroupMessage({ groupId, sender: senderId, text, type });
    await msg.save();
    res.json({ success: true, message: msg });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Group history
router.get('/messages/:groupId', async (req, res) => {
  try {
    const messages = await GroupMessage.find({ groupId: req.params.groupId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 })
      .limit(100);
    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Group members
router.get('/members/:groupId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('members', 'name email');
    res.json(group.members);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
