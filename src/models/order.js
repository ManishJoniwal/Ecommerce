const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tbl_user",
      required: true,
    },
    products: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "tbl_product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    total_price: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled", "processing"],
      default: "pending",
    },
    payment_status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    address: {
      type: String,
    },
    gst_charge: {
      type: Number,
    },
    shipping_charge: {
      type: Number,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tbl_transaction",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("tbl_order", orderSchema);
