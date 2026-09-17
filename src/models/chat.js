const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tbl_order",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tbl_user",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tbl_user",
    },

    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tbl_message",
      },
    ],

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("tbl_chat", chatSchema);
