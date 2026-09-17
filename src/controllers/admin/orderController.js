const Product = require("../../models/product");
const sendResponse = require("../../utils/sendResponse");
const Order = require("../../models/order");
const Notification = require("../../models/notification");

const getAllOrders = async (req, res) => {
  try {
    let { userId, page = 1, limit = 10, status, fromDate, toDate } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    let filter = {};
    if (status) filter.status = status;
    if (userId) filter.user_id = userId;

    // date filter
    if (fromDate || toDate) {
      filter.created_at = {};
      if (fromDate) {
        filter.created_at.$gte = new Date(fromDate);
      }
      if (toDate) {
        filter.created_at.$lte = new Date(toDate);
      }
    }

    // Fetch orders with pagination and populate
    const orders = await Order.find(filter)
      .populate("user_id", "name email")
      .populate("products.product_id", "name price category")
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalOrders = await Order.countDocuments(filter);

    return sendResponse(res, 200, true, "Orders fetched successfully", {
      orders,
      pagination: {
        total: totalOrders,
        page,
        limit,
        totalPages: Math.ceil(totalOrders / limit),
      },
    });
  } catch (err) {
    console.error("Error in getAllOrders:", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error fetching orders"
    );
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const userRole = req.user.role;

    if (userRole !== "Admin") {
      return sendResponse(
        res,
        403,
        false,
        "Only Admin can update order status"
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return sendResponse(res, 404, false, "Order not found");
    }

    if (status) order.status = status;
    await order.save();

    const notification = await Notification.create({
      user: order.user_id,
      type: status === "shipped" ? "OrderShipped" : "OrderPlaced",
      title:
        status === "shipped"
          ? "Order Shipped"
          : `Order status updated to ${status}`,
      message: `Your order #${order._id} status is now ${status}.`,
    });

    // Emit notification via Socket.IO
    const io = req.app.get("io");
    if (io)
      io.to(order.user_id.toString()).emit("newNotification", notification.message);

    return sendResponse(
      res,
      200,
      true,
      "Order status updated successfully",
      order
    );
  } catch (err) {
    console.error("Error in updateOrderStatus:", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error updating order status"
    );
  }
};

const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userRole = req.user.role;

    if (userRole !== "Admin") {
      return sendResponse(res, 403, false, "Only Admin can delete orders");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return sendResponse(res, 404, false, "Order not found");
    }

    for (const item of order.products) {
      await Product.findByIdAndUpdate(
        item.product_id,
        { $inc: { quantity: item.quantity } }, // restore product quantity
        { new: true }
      );
    }

    await order.deleteOne();

    return sendResponse(res, 200, true, "Order deleted successfully");
  } catch (err) {
    console.error("Error in deleteOrder:", err);
    return sendResponse(res, 500, false, err.message || "Error deleting order");
  }
};

module.exports = { getAllOrders, updateOrderStatus, deleteOrder };
