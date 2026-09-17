const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tbl_order",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tbl_user",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
    transactionId: {
      type: String, // from payment gateway (e.g. Razorpay, Stripe, PayPal)
    },
    failureReason: {
      type: String, // optional, used only if status = Failed
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("tbl_transaction", transactionSchema);
