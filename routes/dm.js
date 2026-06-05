const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Room ID banao (sorted taaki same room mile)
const getRoom = (id1, id2) => [id1, id2].sort().join('_');

// Message bhejo
router.post('/send', async (req, res) => {
  try {
    const { senderId, receiverId, text, type } = req.body;
    const room = getRoom(senderId, receiverId);
    const msg = new Message({ sender: senderId, receiver: receiverId, text, type, room });
    await msg.save();
    res.json({ success: true, message: msg });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Chat history fetch karo
router.get('/:userId/:friendId', async (req, res) => {
  try {
    const room = getRoom(req.params.userId, req.params.friendId);
    const messages = await Message.find({ room }).sort({ createdAt: 1 }).limit(100);
    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
