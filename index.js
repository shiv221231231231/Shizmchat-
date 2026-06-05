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
const io = new Server(server, {
  cors: { origin: '*' }
});

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

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // DM room join karo
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`Joined room: ${room}`);
  });

  // DM message bhejo
  socket.on('sendDM', (data) => {
    io.to(data.room).emit('receiveDM', data);
  });

  // Group message (purana)
  socket.on('sendMessage', (data) => {
    io.emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
});
