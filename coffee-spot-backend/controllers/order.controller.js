const User = require("../models/user.model");
const Order = require("../models/order.model");
const Product = require("../models/product.model");

// Place new order
exports.placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, shippingFee, paymentMethod, totalAmount } =
      req.body;
    const userId = req.user.id;

    if (!items?.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    if (!shippingAddress || !shippingFee || !paymentMethod || !totalAmount) {
      return res.status(400).json({
        success: false,
        message:
          "Shipping address, shipping fee, payment method, and total amount are required",
      });
    }

    // Validate stock and calculate subtotal
    let calculatedSubtotal = 0;
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

      calculatedSubtotal += product.price * item.quantity;
      // Don't reduce stock yet - only reduce when payment is confirmed
    }

    const numericShippingFee = parseFloat(shippingFee);
    const calculatedTotal = calculatedSubtotal + numericShippingFee;

    if (calculatedTotal !== totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Calculated total amount doesn't match provided amount",
      });
    }

    // Create the order with initial statuses
    const order = new Order({
      userId,
      items,
      shippingAddress,
      shippingFee: shippingFee.toString(),
      paymentMethod,
      totalAmount,
      status: "ORDER_RECEIVED", // Initial status
      payment: paymentMethod === "COD" ? "PENDING" : "UNPAID", // More descriptive payment status
      statusHistory: [
        {
          status: "ORDER_RECEIVED",
          changedAt: new Date(),
          changedBy: "system",
        },
      ],
    });

    // Save the order
    const savedOrder = await order.save();

    // Update the user's orders array
    await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          orders: {
            orderId: savedOrder._id,
            status: "ORDER_RECEIVED", // Sync status with order
            placedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully. Please complete payment.",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while placing order",
      error: error.message,
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
      // First verify the user exists
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Get orders directly from Order model for better consistency
      orders = await Order.find({ userId: id })
        .populate("userId")
        .populate("items.productId");
    }

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No orders found",
        orders: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
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
    // Only SUPERADMIN can update order status
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - Only SUPERADMIN can update order status",
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

    // Valid statuses for coffee shop
    const validStatuses = [
      "ORDER_RECEIVED",
      "PAYMENT_CONFIRMED",
      "PREPARING",
      "READY_FOR_PICKUP",
      "PICKED_UP",
      "COMPLETED",
      "CANCELLED",
      "REFUNDED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Status transition validation
    const currentStatus = order.status;

    // Cannot revert from finalized states
    if (["COMPLETED", "CANCELLED", "REFUNDED"].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot modify order from ${currentStatus} state`,
      });
    }

    // Valid status transitions
    if (status === "READY_FOR_PICKUP" && currentStatus !== "PREPARING") {
      return res.status(400).json({
        success: false,
        message:
          "Order must be in PREPARING status before marking as READY_FOR_PICKUP",
      });
    }

    if (status === "PICKED_UP" && currentStatus !== "READY_FOR_PICKUP") {
      return res.status(400).json({
        success: false,
        message: "Order must be READY_FOR_PICKUP before marking as PICKED_UP",
      });
    }

    if (status === "COMPLETED" && currentStatus !== "PICKED_UP") {
      return res.status(400).json({
        success: false,
        message: "Order must be PICKED_UP before marking as COMPLETED",
      });
    }

    // Restore stock if cancelling or refunding
    if (["CANCELLED", "REFUNDED"].includes(status)) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    // Update order status and history
    order.status = status;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id,
    });

    await order.save();

    // Update user's order reference
    await User.updateOne(
      { "orders.orderId": order._id },
      { $set: { "orders.$.status": status } }
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Order Status Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating order status",
      error: error.message,
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

// Delete order (admin only)
exports.deleteOrder = async (req, res) => {
  try {
    // Only SUPERADMIN can delete orders
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - Only SUPERADMIN can delete orders",
      });
    }

    const { id } = req.params;

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Delete the order
    await Order.findByIdAndDelete(id);

    // Remove the order reference from the user's orders array
    await User.updateOne(
      { _id: order.userId },
      { $pull: { orders: { orderId: id } } }
    );

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Order Deletion Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting order",
      error: error.message,
    });
  }
};
