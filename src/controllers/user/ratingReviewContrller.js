const Product = require("../../models/product");
const ratingReview = require("../../models/ratingReview");
const RatingReview = require("../../models/ratingReview");
const sendResponse = require("../../utils/sendResponse");
const Order = require("../../models/order");

const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, rating, review } = req.body;

    const product = await Product.findById(productId);
    if (!product) return sendResponse(res, 404, false, "Product not found");

    const orderExist = await Order.findOne({
      user_id: userId,
      status: "delivered",
      "products.product_id": productId,
    });

    if (!orderExist) {
      return sendResponse(
        res,
        400,
        false,
        "you can not give reviews on this product because you not order this product yet after product order you can give reviews"
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return sendResponse(res, 400, false, "Rating should be between 1 to 5");
    }

    //  duplicate reviews by same user
    const existingReview = await RatingReview.findOne({
      user_id: userId,
      product_id: productId,
    });
    if (existingReview) {
      return sendResponse(res, 400, false, "You already reviewed this product");
    }

    const newReview = await RatingReview.create({
      user_id: userId,
      product_id: productId,
      rating,
      review,
    });

    // Add review to product
    product.reviews_id.push(newReview._id);

    // Calculate average rating
    const reviews = await RatingReview.find({ product_id: productId });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    product.rating = avgRating.toFixed(1);
    await product.save();

    return sendResponse(res, 201, true, "Review added successfully", newReview);
  } catch (err) {
    return sendResponse(res, 500, false, err.message || "Error adding review");
  }
};

const updateReview = async (req, res) => {
  try {
    const id = req.params.id;
    const { rating, review } = req.body;

    // Find the existing review
    const reviewDoc = await RatingReview.findById(id);
    if (!reviewDoc) return sendResponse(res, 404, false, "Review not found");

    // Ensure user owns this review
    if (reviewDoc.user_id.toString() !== req.user.id.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "Not authorized to update this review"
      );
    }

    // Update fields
    if (rating) {
      if (rating < 1 || rating > 5) {
        return sendResponse(res, 400, false, "Rating must be between 1 and 5");
      }
      reviewDoc.rating = rating;
    }
    if (review) reviewDoc.review = review;

    await reviewDoc.save();

    // Recalculate product’s average rating
    const product = await Product.findById(reviewDoc.product_id);
    if (!product) {
      return sendResponse(res, 404, false, "Associated product not found");
    }

    const reviews = await RatingReview.find({
      product_id: reviewDoc.product_id,
    });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    product.rating = avgRating.toFixed(1);
    await product.save();

    // Send response
    return sendResponse(
      res,
      200,
      true,
      "Review updated successfully",
      reviewDoc
    );
  } catch (err) {
    console.error("Error updating review:", err);
    return sendResponse(res, 500, false, err.message || "Server error");
  }
};

const getAllReviews = async (req, res) => {
  try {
    const productId = req.params.id;
    const reviews = await RatingReview.find({ product_id: productId }).populate(
      "user_id",
      "name email"
    );

    return sendResponse(res, 200, true, "Product reviews fetched", reviews);
  } catch (err) {
    console.error("Error in getch review:", err);
    return sendResponse(res, 500, false, err.message || "Server error");
  }
};

const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await ratingReview
      .findById(id)
      .populate("user_id", "name email");
    if (!review) {
      return sendResponse(res, 404, false, "this review not found");
    }
    sendResponse(res, 200, true, "review get successfully", review);
  } catch (err) {
    console.error("Error in deleting order:", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error in deleting order"
    );
  }
};

const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Find review
    const review = await RatingReview.findById(id);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    // check if user owns the review
    if (review.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this review",
      });
    }

    // Delete the review
    await RatingReview.findByIdAndDelete(id);

    // Remove review reference from product
    await Product.findByIdAndUpdate(review.product_id, {
      $pull: { reviews_id: id },
    });

    // Recalculate average rating
    const product = await Product.findById(review.product_id).populate(
      "reviews_id"
    );

    if (product.reviews_id.length > 0) {
      const totalRating = product.reviews_id.reduce(
        (sum, r) => sum + r.rating,
        0
      );
      const avgRating = totalRating / product.reviews_id.length;
      product.rating = avgRating;
    } else {
      product.rating = 0;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting review",
      error: error.message,
    });
  }
};

module.exports = {
  createReview,
  updateReview,
  getAllReviews,
  getReviewById,
  deleteReview,
};
