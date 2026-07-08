const groupRoutes = require('./routes/group');
const sendPushNotification = require('./sendNotification');
const dmRoutes = require('./routes/dm');
const notificationRoutes = require('./routes/notifications');
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const friendRoutes = require('./routes/friends');
const mediaRoutes = require('./routes/media');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://shibbuchoure079_db_user:ccHiHeO3NgYDiu5L@sh1bbuchat.k6qooya.mongodb.net/?appName=Sh1bbuchat', {
  serverSelectionTimeoutMS: 5000,
})
.then(() => { console.log('MongoDB Connected! 🍃'); })
.catch((err) => { console.log('MongoDB Error:', err); });

app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api', notificationRoutes);
app.use('/api/dm', dmRoutes);
app.use('/api/group', groupRoutes);

// Online users map
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User online mark karo
  socket.on('userOnline', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  // DM room join
  socket.on('joinRoom', (room) => {
    socket.join(room);
  });

  // DM message
  socket.on('sendDM', (data) => {
    io.to(data.room).emit('receiveDM', data);
  });

  // Typing indicator DM
  socket.on('typing', (data) => {
    socket.to(data.room).emit('typing', { senderId: data.senderId, isTyping: data.isTyping });
  });

  // Read receipt DM
  socket.on('messageRead', (data) => {
    io.to(data.room).emit('messageRead', { readBy: data.readBy });
  });

  // DM Reaction
  socket.on('dmReaction', (data) => {
    io.to(data.room).emit('dmReaction', data);
  });

  // Group room join
  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
  });

  // Group message
  socket.on('sendGroupMessage', (data) => {
    io.to(data.groupId).emit('receiveGroupMessage', data);
  });

  // Group typing
  socket.on('groupTyping', (data) => {
    socket.to(data.groupId).emit('groupTyping', { senderName: data.senderName, isTyping: data.isTyping });
  });

  // Group reaction
  socket.on('groupReaction', (data) => {
    io.to(data.groupId).emit('groupReaction', data);
  });

  // ── VOICE CALL SIGNALING ─────────────────────────
  socket.on('call-user', async (data) => {
    console.log('CALL-USER event:', JSON.stringify(data));
    console.log('Online users map:', JSON.stringify(Array.from(onlineUsers.entries())));
    console.log('Target socket:', onlineUsers.get(data.to));
    const { to, from, fromName, offer } = data;
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('incoming-call', { from, fromName, offer });
      // Push notification bhi bhejo (background ke liye)
      try {
        const User = require('./models/User');
        const receiver = await User.findById(to);
        if (receiver?.pushToken) {
          await sendPushNotification({
            pushToken: receiver.pushToken,
            title: fromName + ' ka incoming call! 📞',
            body: 'Tap karo call receive karne ke liye',
            data: { type: 'incoming-call', from, fromName, offer: JSON.stringify(offer) },
          });
        }
      } catch(e) { console.log('Push notification error:', e.message); }
    } else {
      io.to(socket.id).emit('call-failed', { reason: 'User offline hai' });
    }
  });

  socket.on('call-accepted', (data) => {
    const { to, answer } = data;
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-accepted', { answer });
    }
  });

  socket.on('call-rejected', (data) => {
    const { to } = data;
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-rejected');
    }
  });

  socket.on('ice-candidate', (data) => {
    const { to, candidate } = data;
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('ice-candidate', { candidate });
    }
  });

  socket.on('end-call', (data) => {
    const { to } = data;
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-ended');
    }
  });

  socket.on('disconnect', () => {
    // Remove from online
    for (const [userId, sId] of onlineUsers.entries()) {
      if (sId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {});
