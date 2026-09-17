const http = require("http");
const app = require("./src/app");
const mongodbConnect = require("./src/config/db");
const { Server } = require("socket.io");

mongodbConnect();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Attach io to app for controllers
app.set("io", io);

// Keep track of online users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Join room with user ID
  socket.on("join", (userId) => {
    socket.join(userId); // Room per user
    onlineUsers.set(userId, socket.id);
  });

  // Listen for sending a new message
  socket.on(
    "sendMessage",
    async ({ chatId, senderId, receiverId, content }) => {
      const Chat = require("./src/models/chat");
      const Message = require("./src/models/message");

      // Create message in DB
      const message = await Message.create({
        chat: chatId,
        sender: senderId,
        content,
      });

      // Add message to chat
      const chat = await Chat.findById(chatId);
      chat.messages.push(message._id);
      await chat.save();

      // Emit message to sender & receiver
      io.to(senderId).to(receiverId).emit("newMessage", message);
    }
  );

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    for (let [userId, sockId] of onlineUsers) {
      if (sockId === socket.id) onlineUsers.delete(userId);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
