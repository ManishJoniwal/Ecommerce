const express = require("express");
const {
  createOrder,
  cancelOrder,
  getMyOrders,
} = require("../controllers/user/orderController");
const router = express.Router();
const { authnticate } = require("../middlewares/authMiddleware");
const {
  createWishlist,
  clearWishlist,
  updateWishlist,
  getWishlist,
} = require("../controllers/user/wishlistController");
const {
  addToCart,
  removeFromCart,
  updateCart,
  clearCart,
} = require("../controllers/user/cartController");
const { createChat } = require("../controllers/common/chatController");
const {
  createReview,
  getReviewById,
  deleteReview,
  updateReview,
  getAllReviews,
} = require("../controllers/user/ratingReviewContrller");

// order route
router.post("/create-order", authnticate, createOrder);
router.post("/cancel-order/:id", authnticate, cancelOrder);
router.get("/get-my-orders", authnticate, getMyOrders);

// wishlist route
router.post("/create-wishlist", authnticate, createWishlist);
router.get("/get-wishlist", authnticate, getWishlist);
router.put("/update-wishlist/:id", authnticate, updateWishlist);
router.delete("/clear-wishlist", authnticate, clearWishlist);

//cart
router.post("/add-to-cart", authnticate, addToCart);
router.put("/update-cart/", authnticate, updateCart);
router.delete("/remove-from-cart", authnticate, removeFromCart);
router.delete("/clear-cart", authnticate, clearCart);

// revies
router.post("/create-review", authnticate, createReview);
router.put("/update-review/:id", authnticate, updateReview);
router.put("/get-all-reviews/:id", authnticate, getAllReviews);
router.get("/get-review/:id", authnticate, getReviewById);
router.delete("/delete-review/:id",authnticate, deleteReview);

module.exports = router;
