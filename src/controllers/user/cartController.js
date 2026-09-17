const User = require("../../models/user");
const Product = require("../../models/product");
const sendResponse = require("../../utils/sendResponse");

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, 404, false, "Product not found");
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    // Check if product already exists in cart
    const existingCartItem = user.cart.find(
      (item) => item.product_id.toString() === productId
    );

    if (existingCartItem) {
      return sendResponse(res, 400, false, "Product already in cart");
    }

    // Stock check for fresh add
    if (quantity > product.quantity) {
      return sendResponse(
        res,
        400,
        false,
        `Only ${product.quantity} items available in stock`
      );
    }

    // Push new product into cart
    user.cart.push({
      product_id: productId,
      quantity,
      unit_price: product.price,
    });

    await user.save();

    return sendResponse(res, 200, true, "Product added to cart", user.cart);
  } catch (err) {
    console.error("Error in addToCart:", err);
    return sendResponse(res, 500, false, err.message || "Error adding to cart");
  }
};

const updateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, 404, false, "Product not found");
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    // Find product in user's cart
    const cartItem = user.cart.find(
      (item) => item.product_id.toString() === productId
    );

    if (!cartItem) {
      return sendResponse(res, 404, false, "Product not found in cart");
    }

    // If quantity is 0, remove item from cart
    if (quantity <= 0) {
      user.cart = user.cart.filter(
        (item) => item.product_id.toString() !== productId
      );
    } else {
      if (quantity > product.quantity) {
        return sendResponse(
          res,
          400,
          false,
          `Only ${product.quantity} items available in stock`
        );
      }
    }
    
    cartItem.quantity = quantity;
    //  Save user
    await user.save();

    return sendResponse(res, 200, true, "Cart updated successfully", user.cart);
  } catch (err) {
    console.error("Error in updateCart:", err);
    return sendResponse(res, 500, false, err.message || "Error updating cart");
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    // Check if product exists in cart
    const cartItem = user.cart.find(
      (item) => item.product_id.toString() === productId
    );

    if (!cartItem) {
      return sendResponse(res, 404, false, "Product not found in cart");
    }

    // 3. Remove product from cart
    user.cart = user.cart.filter(
      (item) => item.product_id.toString() !== productId
    );

    // 4. Save updated user
    await user.save();

    return sendResponse(res, 200, true, "Product removed from cart", user.cart);
  } catch (err) {
    console.error("Error in removeFromCart:", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error removing product from cart"
    );
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    // Check if cart is already empty
    if (user.cart.length === 0) {
      return sendResponse(res, 400, false, "Cart is already empty");
    }

    // Clear the cart
    user.cart = [];

    // Save updated user
    await user.save();

    return sendResponse(res, 200, true, "Cart cleared successfully", user.cart);
  } catch (err) {
    console.error("Error in clearCart:", err);
    return sendResponse(res, 500, false, err.message || "Error clearing cart");
  }
};

module.exports = { addToCart, updateCart, removeFromCart, clearCart };
