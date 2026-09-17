const Order = require("../../models/order");
const User = require("../../models/user");
const Product = require("../../models/product");
const sendResponse = require("../../utils/sendResponse");

const getStats = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return sendResponse(res, 403, false, "Access denied");
    }

    // Total Sales 
    const totalSalesAgg = await Order.aggregate([
      { $match: { payment_status: "completed" } },
      { $group: { _id: null, totalSales: { $sum: "$total_price" } } },
    ]);

    const totalSales = totalSalesAgg[0]?.totalSales || 0;

    const totalOrders = await Order.countDocuments();

    const totalCustomers = await User.countDocuments({ role: "User" });

    const totalProducts = await Product.countDocuments();

    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Sales by Month 
    const salesByMonth = await Order.aggregate([
      { $match: { payment_status: "completed" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalSales: { $sum: "$total_price" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return sendResponse(res, 200, true, "Stats fetched successfully", {
      totalSales,
      totalOrders,
      totalCustomers,
      totalProducts,
      ordersByStatus,
      salesByMonth,
    });
  } catch (err) {
    console.error("Error in getStats:", err);
    return sendResponse(res, 500, false, err.message || "Error fetching stats");
  }
};

module.exports = { getStats };
