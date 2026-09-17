const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone_no: {
      type: String,
      // required: true,
    },
    address: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },
    profile_image: {
      type: String,
      default: null,
    },
    cart: [
      {
        _id: false,
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        unit_price: Number,
      },
    ],
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("tbl_user", userSchema);
