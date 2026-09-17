// test-client.js
const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

const userId = "68dc0bfc7135dece40a89e29"; // must match the userId in your DB/JWT

socket.on("connect", () => {
  console.log("Connected to server:", socket.id);

  // Join user-specific room
  socket.emit("join", userId);
});

socket.on("newNotification", (notification) => {
  console.log("New notification received:", notification);
});
