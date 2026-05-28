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

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://shibbuchoure079_db_user:ccHiHeO3NgYDiu5L@sh1bbuchat.k6qooya.mongodb.net/?appName=Sh1bbuchat', {
  serverSelectionTimeoutMS: 5000,
})
.then(() => { console.log('MongoDB Connected! 🍃'); })
.catch((err) => { console.log('MongoDB Error:', err); });

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
  res.json({ message: 'ShizM Chat Server Chal Raha Hai! 🎉' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server start ho gaya port ${PORT} pe!`);
});
