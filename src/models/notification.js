const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tbl_user",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "OrderPlaced",
      "OrderShipped",
      "ChatMessage",
      "PaymentSuccess",
      "NewRegistration",
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("tbl_notification", notificationSchema);
