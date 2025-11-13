const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Models
const ChatModel = require("./Models/ChatModel");
const UserModel = require("./Models/UserModel");

dotenv.config();
const app = express();

// ✅ Middleware
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ CORS setup
app.use(
  cors({
    origin: "https://kialumni-1.onrender.com", // allow all origins for single Render service
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Import Routes
const UserRoutes = require("./Routes/UserRoutes");
const AccountRoutes = require("./Routes/AccountRoutes");
const StudentRoutes = require("./Routes/StudentRoutes");
const AlumniRoutes = require("./Routes/AlumniRoutes");
const ChatRoutes = require("./Routes/ChatRoutes");
const AdminRoutes = require("./Routes/AdminRoutes");
const SearchRoutes = require("./Routes/SearchRoutes");
const ForgotRoutes = require("./Routes/ForgotRoutes");

// ✅ Use Routes
app.use("/api/user", UserRoutes);
app.use("/api/account", AccountRoutes);
app.use("/api/student", StudentRoutes);
app.use("/api/alumni", AlumniRoutes);
app.use("/api/chat", ChatRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/search", SearchRoutes);
app.use("/api/auth", ForgotRoutes);

// ✅ Root test route
app.get("/api", (req, res) => {
  res.send("✅ KIT Alumni backend is running fine!");
});

// ✅ Serve React frontend
app.use(express.static(path.join(__dirname, "client/build")));
// Serve React frontend for all GET requests not starting with /api
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  } else {
    next();
  }
});

// ✅ Socket.io setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("user-online", async (userId) => {
    if (!userId) return;
    onlineUsers.set(userId, socket.id);
    try {
      await UserModel.findByIdAndUpdate(userId, { isOnline: true });
      io.emit("userStatusUpdate", { userId, isOnline: true });
    } catch (err) {
      console.error("Error updating online status:", err);
    }
  });

  socket.on("send-message", async ({ fromUserId, toUserId, message }) => {
    try {
      const newChat = await ChatModel.create({
        sender: fromUserId,
        receiver: toUserId,
        message,
      });

      const receiverSocket = onlineUsers.get(toUserId);
      if (receiverSocket) {
        io.to(receiverSocket).emit("receive-message", { chat: newChat });
      }

      socket.emit("message-sent", { chat: newChat });
    } catch (err) {
      console.error("Message error:", err);
    }
  });

  socket.on("disconnect", async () => {
    let disconnectedUserId = null;
    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        disconnectedUserId = userId;
        onlineUsers.delete(userId);
        break;
      }
    }

    if (disconnectedUserId) {
      try {
        await UserModel.findByIdAndUpdate(disconnectedUserId, { isOnline: false });
        io.emit("userStatusUpdate", { userId: disconnectedUserId, isOnline: false });
      } catch (err) {
        console.error("Error updating offline status:", err);
      }
    }
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
