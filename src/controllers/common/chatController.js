const Chat = require("../../models/chat");
const Message = require("../../models/message");
const Order = require("../../models/order");
const User = require("../../models/user");
const sendResponse = require("../../utils/sendResponse");

const createChat = async (req, res) => {
  try {
    const { orderId, receiverId } = req.body; // Admin id can be receiver
    const senderId = req.user.id;

    // Check if chat for this order already exists
    let chat = await Chat.findOne({ order: orderId });
    if (!chat) {
      chat = await Chat.create({
        order: orderId,
        sender: senderId,
        receiver: receiverId,
      });
    }

    return sendResponse(res, 201, true, "Chat created successfully", chat);
  } catch (err) {
    console.error("Error creating chat:", err);
    return sendResponse(res, 500, false, err.message || "Error creating chat");
  }
};

// const sendMessage = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { chatId } = req.params;
//     const { content } = req.body;

//     // Validate input
//     if (!content || content.trim() === "") {
//       return sendResponse(res, 400, false, "Message content is required");
//     }

//     // Find the chat
//     const chat = await Chat.findById(chatId)
//       .populate("sender", "name email profile_img")
//       .populate("receiver", "name email")
//       .populate({
//         path: "messages",
//         populate: { path: "sender", select: "name profile_img" },
//       });

//     if (!chat) {
//       return sendResponse(res, 404, false, "Chat not found");
//     }

//     // Check if user is part of the chat (sender or admin)
//     const senderId = chat.sender ? chat.sender._id.toString() : null;

//     const isParticipant = req.user.role === "Admin" || senderId === userId;

//     if (!isParticipant) {
//       return sendResponse(
//         res,
//         403,
//         false,
//         "You are not allowed to send message in this chat"
//       );
//     }

//     // Create the message
//     const message = await Message.create({
//       chat: chatId,
//       sender: userId,
//       content: content.trim(),
//       read: false,
//     });

//     // Add message to chat
//     chat.messages.push(message._id);

//     // If admin sends message, set receiver as user
//     if (req.user.role === "Admin") chat.receiver = chat.sender;
//     await chat.save();

//     // Populate sender info for response
//     const populatedMessage = await Message.findById(message._id).populate(
//       "sender",
//       "name profile_img"
//     );

//     return sendResponse(
//       res,
//       201,
//       true,
//       "Message sent successfully",
//       populatedMessage
//     );
//   } catch (err) {
//     console.error("sendMessage error:", err);
//     return sendResponse(
//       res,
//       500,
//       false,
//       err.message || "Error sending message"
//     );
//   }
// };

const getallChats = async (req, res) => {
  try {
    const userId = req.user.id;
    let filter = {};

    if (req.user.role === "User") filter = { sender: userId };
    // admin can see all chats
    const chats = await Chat.find(filter)
      .populate("order", "products total_price status")
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .populate({
        path: "messages",
        populate: { path: "sender", select: "name email" },
      });

    return sendResponse(res, 200, true, "Chats fetched successfully", chats);
  } catch (err) {
    console.error("Error fetching chats:", err);
    return sendResponse(res, 500, false, err.message || "Error fetching chats");
  }
};

// Get messages of a chat
const getMessagesByChatId = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId }).populate(
      "sender",
      "name email"
    );
    return sendResponse(
      res,
      200,
      true,
      "Messages fetched successfully",
      messages
    );
  } catch (err) {
    console.error("Error fetching messages:", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error fetching messages"
    );
  }
};

module.exports = { createChat, getallChats, getMessagesByChatId };
