const Product = require("../../models/product");
const Wishlist = require("../../models/wishlist");
const sendResponse = require("../../utils/sendResponse");

const createWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return sendResponse(res, 400, false, "Product ID is required");
    }

    // Check if product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return sendResponse(res, 404, false, "Product not found");
    }

    //  Check if already in wishlist
    const isExist = await Wishlist.findOne({ user_id: userId, product_id });
    if (isExist) {
      return sendResponse(res, 400, false, "Product already in wishlist");
    }

    // Create wishlist
    const newWishlist = await Wishlist.create({
      user_id: userId,
      product_id,
    });

    // Populate product details
    const populatedWishlist = await Wishlist.findById(newWishlist._id).populate(
      "product_id",
      "name price product_image"
    );

    return sendResponse(
      res,
      201,
      true,
      "Product added to wishlist successfully",
      populatedWishlist
    );
  } catch (err) {
    console.error("Error in createWishlist:", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error adding product to wishlist"
    );
  }
};

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const wishlistItems = await Wishlist.find({ user_id: userId })
      .populate("product_id", "name price product_image category")
      .skip((page - 1) * limit)
      .limit(limit);

    const totalItems = await Wishlist.countDocuments({ user_id: userId });

    return sendResponse(res, 200, true, "Wishlist fetched successfully", {
      items: wishlistItems,
      pagination: {
        total: totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (err) {
    console.error("Error in getWishlist:", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error fetching wishlist"
    );
  }
};

const updateWishlist = async (req, res) => {
  try {
    const { id } = req.params; // wishlist item ID
    const userId = req.user.id; // logged-in user
    const { product_id } = req.body;

    if (!product_id) {
      return sendResponse(res, 400, false, "Product ID is required");
    }

    const wishlistitem = await Wishlist.findOne({ id });
    if (!wishlistitem) {
      return sendResponse(res, 404, false, "wishlist not found for this id");
    }

    await Wishlist.findOneAndDelete({
      _id: id,
      user_id: userId,
      product_id,
    });

    return sendResponse(res, 200, true, "Wishlist update successfully");
  } catch (err) {
    console.error("Error in updateWishlist:", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error updating wishlist"
    );
  }
};

const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlistItems = await Wishlist.find({ user_id: userId });

    // If wishlist already empty
    if (wishlistItems.length === 0) {
      return sendResponse(res, 400, false, "Wishlist is already empty");
    }

    // Clear wishlist
    await Wishlist.deleteMany({ user_id: userId });

    return sendResponse(res, 200, true, "Wishlist cleared successfully");
  } catch (err) {
    console.error("Error in clearWishlist:", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error clearing wishlist"
    );
  }
};

module.exports = { createWishlist, getWishlist, updateWishlist, clearWishlist };
