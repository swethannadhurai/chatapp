
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import path from 'path';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/messageRoutes.js';
import { app, server } from './lib/socket.js';
import cookieParser from 'cookie-parser';
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "https://magical-wisp-ce12ab.netlify.app",
    credentials: true,
}))

app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.get('/', (req, res)=> {
   res.send("API is running...");
})

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})