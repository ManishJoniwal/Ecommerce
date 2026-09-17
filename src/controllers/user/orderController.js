const Product = require("../../models/product");
const sendResponse = require("../../utils/sendResponse");
const Order = require("../../models/order");
const Notification = require("../../models/notification");
const User = require("../../models/user");
const stripe = require("../../utils/stripe");
const Transaction = require("../../models/transaction");

// const createOrder = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const username = await User.findById(userId);
//     const { products, address, gst_charge = 0, shipping_charge = 0 } = req.body;

//     if (!products || products.length === 0) {
//       return sendResponse(res, 400, false, "Products are required");
//     }

//     let totalPrice = 0;
//     let orderProducts = [];

//     // Validate and calculate price for each product
//     for (let item of products) {
//       const product = await Product.findById(item.product_id);
//       if (!product) {
//         return sendResponse(
//           res,
//           404,
//           false,
//           `Product not found: ${item.product_id}`
//         );
//       }

//       // Check stock
//       if (product.quantity < item.quantity) {
//         return sendResponse(
//           res,
//           400,
//           false,
//           `Insufficient stock for product: ${product.name}`
//         );
//       }

//       // Calculate price = unit price × ordered qty
//       const itemTotalPrice = product.price * item.quantity;

//       // Add to order products array
//       orderProducts.push({
//         product_id: product._id,
//         quantity: item.quantity,
//         price: itemTotalPrice,
//       });

//       // Add to total order price
//       totalPrice += itemTotalPrice;

//       // Reduce stock
//       product.quantity -= item.quantity;
//       await product.save();
//     }

//     // Add GST + shipping charges
//     totalPrice += gst_charge + shipping_charge;

//     // Create order
//     const newOrder = await Order.create({
//       user_id: userId,
//       products: orderProducts,
//       total_price: totalPrice,
//       address,
//       gst_charge,
//       shipping_charge,
//       status: "pending",
//       payment_status: "pending",
//     });

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card", "upi"], // add more if needed
//       mode: "payment",
//       line_items: products.map((p) => ({
//         price_data: {
//           currency: "inr",
//           product_data: { name: "Product" }, // or fetch product name
//           unit_amount: p.price * 100, // in paise
//         },
//         quantity: p.quantity,
//       })),
//       success_url: `${process.env.FRONTEND_URL}/success?orderId=${order._id}`,
//       cancel_url: `${process.env.FRONTEND_URL}/cancel?orderId=${order._id}`,
//       metadata: {
//         orderId: order._id.toString(),
//         transactionId: transaction._id.toString(),
//       },
//     });

//     const admins = await User.find({ role: "Admin" });
//     const io = req.app.get("io");

//     for (let admin of admins) {
//       const notification = await Notification.create({
//         user: admin._id,
//         type: "OrderPlaced",
//         title: "New Order Placed",
//         message: `A new order #${newOrder._id} has been placed`,
//       });

//       if (io)
//         io.to(admin._id.toString()).emit(
//           "newNotification",
//           notification.message
//         );
//     }

//     return sendResponse(res, 201, true, "Order created successfully", [
//       newOrder,
//       session.url,
//     ]);
//   } catch (err) {
//     console.error("Error creating order:", err);
//     return sendResponse(res, 500, false, err.message || "Error creating order");
//   }
// };

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { products, address, gst_charge = 0, shipping_charge = 0 } = req.body;

    if (!products || products.length === 0) {
      return sendResponse(res, 400, false, "Products are required");
    }
    
    let totalPrice = 0;
    let orderProducts = [];

    // Validate and calculate price for each product
    for (let item of products) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return sendResponse(
          res,
          404,
          false,
          `Product not found: ${item.product_id}`
        );
      }
      if (product.quantity < item.quantity) {
        return sendResponse(
          res,
          400,
          false,
          `Insufficient stock for product: ${product.name}`
        );
      }

      const itemTotalPrice = product.price * item.quantity;

      orderProducts.push({
        product_id: product._id,
        quantity: item.quantity,
        price: itemTotalPrice,
        name: product.name, // save name for Stripe
        product_image: product.product_image,
      });

      totalPrice += itemTotalPrice;

      // Reduce stock
      product.quantity -= item.quantity;
      await product.save();
    }

    totalPrice += gst_charge + shipping_charge;

    // Create order first
    const newOrder = await Order.create({
      user_id: userId,
      products: orderProducts,
      total_price: totalPrice,
      address,
      gst_charge,
      shipping_charge,
      status: "pending",
      payment_status: "pending",
    });

    // Create transaction record
    const transaction = await Transaction.create({
      order: newOrder._id,
      user: userId,
      amount: totalPrice,
      status: "Pending",
      transactionId: "", // will fill after Stripe
    });

    newOrder.transaction = transaction._id;
    await newOrder.save();

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: orderProducts.map((p) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: p.name,
            // images: [
            //   `${process.env.BASE_URL}/${p.product_image?.replace(/\\/g, "/")}`,
            // ],
            images: [
              `https://69mtf6wk-5000.inc1.devtunnels.ms/${p.product_image?.replace(
                /\\/g,
                "/"
              )}`,
            ],
          },
          unit_amount: p.price * 100, // paise
        },
        quantity: p.quantity,
      })),
      success_url: `http://localhost:5000/success?orderId=${newOrder._id}`,
      cancel_url: `http://localhost:5000/cancel?orderId=${newOrder._id}`,
      metadata: {
        orderId: newOrder._id.toString(),
        transactionId: transaction._id.toString(),
      },
    });

    // Save Stripe session ID to transaction
    transaction.transactionId = session.id;
    await transaction.save();

    // Notify admins
    const admins = await User.find({ role: "Admin" });
    const io = req.app.get("io");
    for (let admin of admins) {
      const notification = await Notification.create({
        user: admin._id,
        type: "OrderPlaced",
        title: "New Order Placed",
        message: `A new order #${newOrder._id} has been placed`,
      });

      if (io)
        io.to(admin._id.toString()).emit(
          "newNotification",
          notification.message
        );
    }

    return sendResponse(res, 201, true, "Order created successfully", {
      order: newOrder,
      stripeUrl: session.url,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    return sendResponse(res, 500, false, err.message || "Error creating order");
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    let { status, page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    let filter = { user_id: userId };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate("products.product_id", "name price category product_image")
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
    console.error("Error in getMyOrders:", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error fetching user orders"
    );
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findById(orderId);
    if (!order) {
      return sendResponse(res, 404, false, "Order not found");
    }
    if (order.status == "cancelled") {
      return sendResponse(res, 400, false, "Order already cancelled");
    }

    // Only the owner of order or admin can cancel
    if (userRole !== "Admin" && order.user_id.toString() !== userId) {
      return sendResponse(
        res,
        403,
        false,
        "You are not authorized to cancel this order"
      );
    }

    // if ordr deliverd then order can not be canceld
    if (order.status === "delivered") {
      return sendResponse(
        res,
        400,
        false,
        "Delivered order cannot be cancelled"
      );
    }

    //  set status cancelled of the order
    order.status = "cancelled";
    await order.save();

    // Product quantity restore karo
    for (const item of order.products) {
      await Product.findByIdAndUpdate(
        item.product_id,
        { $inc: { quantity: item.quantity } }, // restore the quantity of the order
        { new: true }
      );
    }

    const io = req.app.get("io");
    io.to(userId).emit("newNotification", "order canceld");

    return sendResponse(res, 200, true, "Order cancelled successfully", order);
  } catch (err) {
    console.error("Error in cancelling order: ", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error in cancelling order"
    );
  }
};

module.exports = { createOrder, getMyOrders, cancelOrder };
