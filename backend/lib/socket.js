import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://magical-wisp-ce12ab.netlify.app", // frontend URL
    credentials: true,
  },
});

// Map of online users: { userId: socketId }
const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  // Get userId from frontend auth
  const userId = socket.handshake.auth.userId;
  if (!userId) return;

  // Save user socket
  userSocketMap[userId] = socket.id;

  // Emit online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Listen for optional sendMessage (if you want frontend emit)
  socket.on("sendMessage", (message) => {
    const { senderId, receiverId, text, image } = message;

    const newMessage = {
      senderId,
      receiverId,
      text,
      image,
      createdAt: new Date(),
    };

    // Emit to receiver
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Emit back to sender
    const senderSocketId = userSocketMap[senderId];
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }
  });

  // Disconnect handling
  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };


