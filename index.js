const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const friendRoutes = require('./routes/friends');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.json());

mongoose.connect('mongodb+srv://shibbuchoure079_db_user:ccHiHeO3NgYDiu5L@sh1bbuchat.k6qooya.mongodb.net/?appName=Sh1bbuchat')
.then(() => {
  console.log('MongoDB Connected! 🍃');
})
.catch((err) => {
  console.log('MongoDB Error:', err);
});

app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('sendMessage', (data) => {
    io.emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Shibbu Chat Server Chal Raha Hai! 🎉' });
});

server.listen(3000, () => {
  console.log('Server start ho gaya port 3000 pe!');
});
