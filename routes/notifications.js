const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Push token save karo
router.post('/save-token', async (req, res) => {
  try {
    const { token, userId } = req.body;
    await User.findByIdAndUpdate(userId, { pushToken: token });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Notification send karo
router.post('/send-notification', async (req, res) => {
  try {
    const { toUserId, title, body } = req.body;
    const user = await User.findById(toUserId);
    if (!user?.pushToken) return res.json({ success: false, reason: 'No token' });

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: user.pushToken,
        title,
        body,
        sound: 'default',
      }),
    });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
