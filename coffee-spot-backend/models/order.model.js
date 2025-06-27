const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],

    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },

    payment: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
      required: true,
    },

    // Shipping information
    shippingAddress: {
      type: String,
      required: true,
    },

    // Total order amount
    totalAmount: {
      type: Number,
      required: true,
    },

    placedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
