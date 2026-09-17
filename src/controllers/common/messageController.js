const Message = require("../../models/message");
const Chat = require("../../models/chat");
const sendResponse = require("../../utils/sendResponse");

const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const senderId = req.user.id;

    const message = await Message.create({
      chat: chatId,
      sender: senderId,
      content,
    });

    const chat = await Chat.findById(chatId);
    chat.messages.push(message._id);
    await chat.save();

    // Emit to both users via Socket.IO
    const io = req.app.get("io");
    if (io)
      io.to(chat.sender.toString())
        .to(chat.receiver.toString())
        .emit("newMessage", message);

    return sendResponse(res, 201, true, "Message sent", message);
  } catch (err) {
    console.error("Error sending message:", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error sending message"
    );
  }
};

module.exports = { sendMessage };
