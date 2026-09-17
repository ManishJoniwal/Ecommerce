const Product = require("../../models/product");
const sendResponse = require("../../utils/sendResponse");
const Order = require("../../models/order");

const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findById(orderId)
      .populate("user_id", "name email")
      .populate("products.product_id", "name price category product_image");

    if (!order) {
      return sendResponse(res, 404, false, "Order not found");
    }

    // authorize only for admin and user 
    if (userRole !== "Admin" && order.user_id._id.toString() !== userId) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to view this order"
      );
    }
    return sendResponse(res, 200, true, "Order fetched successfully", order);
  } catch (err) {
    console.error("Error in getOrderById:", err);
    return sendResponse(res, 500, false, err.message || "Error fetching order");
  }
};

module.exports = { getOrderById };
