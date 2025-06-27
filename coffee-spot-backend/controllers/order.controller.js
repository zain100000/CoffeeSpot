const User = require("../models/user.model");
const Order = require("../models/order.model");
const Product = require("../models/product.model");

// Place new order
exports.placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount } = req.body;
    const userId = req.user.id;

    if (!items?.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    if (!shippingAddress || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Shipping address and total amount are required",
      });
    }

    // Validate stock and calculate total amount
    let calculatedTotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.title}`,
        });
      }
      calculatedTotal += product.price * item.quantity;
      product.stock -= item.quantity;
      await product.save();
    }

    if (calculatedTotal !== totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Calculated total amount doesn't match provided amount",
      });
    }

    const order = new Order({
      userId,
      items,
      shippingAddress,
      totalAmount,
      status: "PENDING",
      payment: "PENDING",
    });
    await order.save();

    await User.findByIdAndUpdate(userId, {
      $push: { orders: { orderId: order._id } },
    });

    res.status(201).json({
      success: true,
      message: "Order place successfully",
      order,
    });
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get orders (all for admin, user's own for customer)
exports.getAllOrders = async (req, res) => {
  try {
    const { role, id } = req.user;
    let orders;

    if (role === "SUPERADMIN") {
      orders = await Order.find()
        .populate("userId")
        .populate("items.productId");
    } else {
      const user = await User.findById(id).populate({
        path: "orders.orderId",
        populate: [
          { path: "userId"},
          { path: "items.productId"},
        ],
      });
      orders = user.orders.map((o) => o.orderId);
    }

    res.status(201).json({
      success: true,
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get order by id (admin can get any, users can only get their own)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId")
      .populate("items.productId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Authorization check
    if (
      req.user.role !== "SUPERADMIN" &&
      order.userId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    res.status(201).json({
      success: true,
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Authorization check
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (["DELIVERED"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel delivered order",
      });
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    order.status = "CANCELLED";
    await order.save();

    await User.updateOne(
      { _id: req.user.id, "orders.orderId": id },
      { $set: { "orders.$.status": "CANCELLED" } }
    );

    res.status(201).json({
      success: true,
      message: "Order cancelled",
      order,
    });
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Admin order status update
exports.updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const validStatuses = ["PENDING", "PROCESSING", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Status transition validation
    if (status === "CANCELLED" && ["DELIVERED"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel delivered order",
      });
    }

    // Restore stock if cancelling
    if (status === "CANCELLED") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.status = status;
    await order.save();

    // Update user's order reference
    await User.updateOne(
      { "orders.orderId": order._id },
      { $set: { "orders.$.status": status } }
    );

    res.status(201).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Admin payment status update
exports.updatePaymentStatus = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { payment } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!["PENDING", "PAID"].includes(payment)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    order.payment = payment;
    await order.save();

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
