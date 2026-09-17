const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tbl_category",
    },
    rating: {
      type: Number,
      default: 0,
    },
    product_image: {
      type: String,
      default: null,
    },
    reviews_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tbl_rating_review",
      },
    ],
    is_featured: {
      type: Boolean,
      default: false,
    },
    video_url: {
      type: String,
      default: null,
    },
    quantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("tbl_product", ProductSchema);
