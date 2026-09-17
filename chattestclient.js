// chatTestClient.js
const io = require("socket.io-client");
require("dotenv").config();

// ---------------------------
// Replace these with actual JWT tokens for user and admin
const USER_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZDY2YzNiNWQzMjk5MWFiMjJmMGI0NyIsImVtYWlsIjoibWFuaXNoam9uaXdhbEBnbWFpbC5jb20iLCJyb2xlIjoiVXNlciIsImlhdCI6MTc1OTMxOTIwNywiZXhwIjoxNzYwNjE1MjA3fQ.4Tj5mJXlQpIc07SuPV348Z0cJhO4Im3uWGVIXHRa4s8";

const ADMIN_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGMwYmZjNzEzNWRlY2U0MGE4OWUyOSIsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNzU5MzE5Njg2LCJleHAiOjE3NjA2MTU2ODZ9.07_HM1jurl5UJm4Zc50K-1HAbHG2wHxxhhpcCexCn-o";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

// Simulate user and admin connections
const userSocket = io(BASE_URL, {
  auth: { token: USER_TOKEN },
});

const adminSocket = io(BASE_URL, {
  auth: { token: ADMIN_TOKEN },
});

// Replace with a real order ID
const ORDER_ID = "64f123abc456def7890";

// Listen for new chat messages (both user and admin)
[userSocket, adminSocket].forEach((socket, i) => {
  socket.on("connect", () => {
    console.log(i === 0 ? "User connected" : "Admin connected", socket.id);
  });

  socket.on("newMessage", (message) => {
    console.log(
      i === 0 ? "User received message:" : "Admin received message:",
      message
    );
  });

  socket.on("disconnect", () => {
    console.log(i === 0 ? "User disconnected" : "Admin disconnected");
  });
});

// ---------------------------
// Step 1: User creates chat for the order
async function createChat() {
//   const fetch = require("node-fetch");

  const res = await fetch(`${BASE_URL}/api/v1/chat/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${USER_TOKEN}`,
    },
    body: JSON.stringify({
      orderId: ORDER_ID,
      receiverId: "68dc0bfc7135dece40a89e29",
    }),
  });

  const data = await res.json();
  console.log("Chat created:", data);
  return data.data ? data.data._id : null;
}

// ---------------------------
// Step 2: Send a message in chat
function sendMessage(chatId, senderSocket, message) {
  senderSocket.emit("sendMessage", {
    chatId,
    content: message,
  });
}

// ---------------------------
// Main test flow
(async () => {
  const chatId = await createChat();

  if (!chatId) {
    console.log("Failed to create chat. Exiting test.");
    process.exit(1);
  }

  // User sends a message
  setTimeout(() => {
    console.log("User sending message...");
    sendMessage(
      chatId,
      userSocket,
      "Hello Admin, I have a query about my order."
    );
  }, 2000);

  // Admin sends a reply
  setTimeout(() => {
    console.log("Admin replying...");
    sendMessage(
      chatId,
      adminSocket,
      "Hello User, I can help you with your order."
    );
  }, 5000);
})();
