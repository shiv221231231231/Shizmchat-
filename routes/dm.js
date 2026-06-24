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

// Message delete karo
router.delete('/message/:messageId', async (req, res) => {
  try {
    const { senderId } = req.body;
    const msg = await Message.findById(req.params.messageId);
    if (!msg) return res.status(404).json({ error: 'Message nahi mila!' });
    if (msg.sender.toString() !== senderId) return res.status(403).json({ error: 'Permission nahi hai!' });
    await Message.findByIdAndDelete(req.params.messageId);
    const room = msg.room;
    const io = req.app.get('io');
    if (io) io.to(room).emit('messageDeleted', { messageId: req.params.messageId });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Unread count
router.get('/unread/:userId/:friendId', async (req, res) => {
  try {
    const room = getRoom(req.params.userId, req.params.friendId);
    const count = await Message.countDocuments({
      room,
      sender: req.params.friendId,
      read: false,
    });
    res.json({ count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Messages read mark karo
router.post('/read/:userId/:friendId', async (req, res) => {
  try {
    const room = getRoom(req.params.userId, req.params.friendId);
    await Message.updateMany(
      { room, sender: req.params.friendId, read: false },
      { read: true }
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
module.exports = router;
