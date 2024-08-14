const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Message = require('./models/messages');

require('dotenv').config();
const uri = process.env.URI;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB with your custom URL
const mongoURL = uri; // Replace with your MongoDB connection string
mongoose
  .connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Socket.IO setup
io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('sendMessage', async (data) => {
    const { sender, receiver, receiverType, content } = data;
    const message = new Message({ sender, receiver, receiverType, content });
    await message.save();

    // Emit the message to the appropriate room based on receiverType
    if (receiverType === 'User') {
      io.to(receiver).emit('receiveMessage', message);
    } else if (receiverType === 'Vendor') {
      io.to(receiver).emit('receiveMessage', message);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected', socket.id);
  });
});

server.listen(5000, () => {
  console.log('Server is running on port 5000');
});
